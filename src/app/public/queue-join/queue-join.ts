import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { DoorInfo, PublicApi, errorCode } from '../public-api';

const ticketKey = (door: string) => `salonix-ticket-${door}`;
const GUEST_KEY = 'salonix-guest';

/**
 * /foleni/:token - the door QR. A walk-in picks a service and a stylist (or
 * whoever is free), types name + phone and joins; then their ticket page
 * shows their place.
 */
@Component({
  selector: 'app-queue-join',
  imports: [FormsModule, DecimalPipe, TranslatePipe, RouterLink],
  templateUrl: './queue-join.html',
  styleUrls: ['../public-page.css', './queue-join.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QueueJoin implements OnInit {
  private api = inject(PublicApi);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  token = '';
  door = signal<DoorInfo | null>(null);
  loading = signal(true);
  loadError = signal('');
  sending = signal(false);
  joinError = signal('');
  /** A ticket this phone already holds for this door. */
  myTicket = signal('');

  serviceUid = signal('');
  staffUid = signal<string | null>(null);
  name = '';
  phone = '';

  canJoin = computed(() => !!this.serviceUid() && !this.sending());

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') ?? '';
    try {
      this.myTicket.set(localStorage.getItem(ticketKey(this.token)) ?? '');
      const guest = JSON.parse(localStorage.getItem(GUEST_KEY) ?? 'null');
      if (guest) {
        this.name = guest.name ?? '';
        this.phone = guest.phone ?? '';
      }
    } catch {}
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.loadError.set('');
    this.api.door(this.token).subscribe({
      next: (d) => {
        this.door.set(d);
        if (d.services?.length === 1) {
          this.serviceUid.set(d.services[0].uid);
        }
        this.loading.set(false);
      },
      error: (e) => {
        this.loadError.set(errorCode(e));
        this.loading.set(false);
      },
    });
  }

  join(): void {
    if (!this.canJoin()) {
      return;
    }
    if (!this.name.trim()) {
      this.joinError.set('NAME_REQUIRED');
      return;
    }
    if (this.phone.replace(/\D/g, '').length < 9) {
      this.joinError.set('PHONE_INVALID');
      return;
    }
    this.sending.set(true);
    this.joinError.set('');
    this.api
      .join(this.token, {
        name: this.name.trim(),
        phone: this.phone.trim(),
        serviceUid: this.serviceUid(),
        staffUid: this.staffUid(),
      })
      .subscribe({
        next: (res) => {
          try {
            localStorage.setItem(ticketKey(this.token), res.ticketToken);
            localStorage.setItem('salonix-last-door', this.token);
            localStorage.setItem(GUEST_KEY, JSON.stringify({ name: this.name.trim(), phone: this.phone.trim() }));
          } catch {}
          this.router.navigate(['/tiketi', res.ticketToken]);
        },
        error: (e) => {
          this.sending.set(false);
          this.joinError.set(errorCode(e));
        },
      });
  }
}
