import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { PublicApi, TicketView, errorCode } from '../public-api';

const POLL_MS = 15_000;

/**
 * /tiketi/:token - the walk-in's place in the queue, on their own phone.
 * Refreshes every 15 s while waiting or called; "ZAMU YAKO!" when called.
 */
@Component({
  selector: 'app-queue-ticket',
  imports: [TranslatePipe, RouterLink],
  templateUrl: './queue-ticket.html',
  styleUrls: ['../public-page.css', './queue-ticket.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QueueTicket implements OnInit, OnDestroy {
  private api = inject(PublicApi);
  private route = inject(ActivatedRoute);

  token = '';
  ticket = signal<TicketView | null>(null);
  loading = signal(true);
  error = signal('');
  leaving = signal(false);
  confirmLeave = signal(false);
  /** The door this phone joined from, for "Jiunge tena". */
  door = signal('');
  private timer: any = null;

  live = computed(() => {
    const t = this.ticket();
    return !!t && t.today && (t.status === 'WAITING' || t.status === 'CALLED');
  });

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') ?? '';
    try {
      this.door.set(localStorage.getItem('salonix-last-door') ?? '');
    } catch {}
    this.load();
    this.timer = setInterval(() => {
      if (this.live() && document.visibilityState !== 'hidden') {
        this.load(true);
      }
    }, POLL_MS);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  load(quiet = false): void {
    if (!quiet) {
      this.loading.set(true);
    }
    this.api.ticket(this.token).subscribe({
      next: (t) => {
        const was = this.ticket()?.status;
        this.ticket.set(t);
        this.error.set('');
        this.loading.set(false);
        if (t.status === 'CALLED' && was && was !== 'CALLED') {
          try {
            navigator.vibrate?.([300, 150, 300]);
          } catch {}
        }
        if (!this.live()) {
          this.forget();
        }
      },
      error: (e) => {
        this.loading.set(false);
        // A failed refresh keeps showing the last answer.
        if (!quiet || !this.ticket()) {
          this.error.set(errorCode(e));
        }
      },
    });
  }

  leave(): void {
    if (!this.confirmLeave()) {
      this.confirmLeave.set(true);
      return;
    }
    this.leaving.set(true);
    this.api.leave(this.token).subscribe({
      next: () => {
        this.leaving.set(false);
        this.confirmLeave.set(false);
        this.load(true);
      },
      error: () => {
        this.leaving.set(false);
        this.confirmLeave.set(false);
        this.load(true);
      },
    });
  }

  /** Over: the door page stops pointing at this ticket. */
  private forget(): void {
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k?.startsWith('salonix-ticket-') && localStorage.getItem(k) === this.token) {
          localStorage.removeItem(k);
        }
      }
    } catch {}
  }
}
