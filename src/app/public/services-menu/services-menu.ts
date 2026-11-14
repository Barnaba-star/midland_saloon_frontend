import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { DoorInfo, PublicApi, StaffBadge, errorCode, photoUrl } from '../public-api';

/**
 * /huduma/:token - the services QR a branch prints (POS Setting > QR ya Huduma).
 * Anyone scans it with a plain phone (no app, no login) and sees the branch's
 * services with prices and time, and its stylists; from here they can join
 * the queue when it is on. Same door token as /foleni.
 */
@Component({
  selector: 'app-services-menu',
  imports: [FormsModule, DecimalPipe, TranslatePipe, RouterLink],
  templateUrl: './services-menu.html',
  styleUrls: ['../public-page.css', './services-menu.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesMenu implements OnInit {
  private api = inject(PublicApi);
  private route = inject(ActivatedRoute);

  token = '';
  door = signal<DoorInfo | null>(null);
  loading = signal(true);
  loadError = signal('');
  badges = signal<Record<string, StaffBadge>>({});
  search = signal('');

  services = computed(() => {
    const list = this.door()?.services ?? [];
    const q = this.search().trim().toLowerCase();
    return q ? list.filter((s) => `${s.name} ${s.description ?? ''}`.toLowerCase().includes(q)) : list;
  });

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') ?? '';
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.loadError.set('');
    this.api.door(this.token).subscribe({
      next: (d) => {
        this.door.set(d);
        this.loading.set(false);
        if (d.staff?.length) {
          this.api.staffBadges(this.token).subscribe({ next: (b) => this.badges.set(b ?? {}), error: () => {} });
        }
      },
      error: (e) => {
        this.loadError.set(errorCode(e));
        this.loading.set(false);
      },
    });
  }

  badgePhoto(uid: string): string {
    return photoUrl(this.badges()[uid]?.photo);
  }
}
