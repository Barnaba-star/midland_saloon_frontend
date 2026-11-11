import { ChangeDetectionStrategy, Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { PublicApi, StaffPhoto, StaffPortfolio, errorCode, photoUrl } from '../public-api';

/**
 * /mhudumu/:doorToken/:staffUid - one stylist's work, for a walk-in choosing
 * who does their hair: photos, stars, what guests said, and a button that
 * joins the queue for them.
 */
@Component({
  selector: 'app-stylist-page',
  imports: [DatePipe, DecimalPipe, TranslatePipe, RouterLink],
  templateUrl: './stylist-page.html',
  styleUrls: ['../public-page.css', './stylist-page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StylistPage implements OnInit {
  private api = inject(PublicApi);
  private route = inject(ActivatedRoute);

  door = '';
  staffUid = '';
  staff = signal<StaffPortfolio | null>(null);
  loading = signal(true);
  error = signal('');
  /** The photo opened full size. */
  open = signal<StaffPhoto | null>(null);

  photos = computed(() => (this.staff()?.photos ?? []).map((p) => ({ ...p, src: photoUrl(p.url) })));
  comments = computed(() => (this.staff()?.comments ?? []).slice(0, 10));
  full = computed(() => Math.round(this.staff()?.stars ?? 0));

  ngOnInit(): void {
    this.door = this.route.snapshot.paramMap.get('doorToken') ?? '';
    this.staffUid = this.route.snapshot.paramMap.get('staffUid') ?? '';
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.staffPortfolio(this.door, this.staffUid).subscribe({
      next: (s) => {
        this.staff.set(s);
        this.loading.set(false);
      },
      error: (e) => {
        this.error.set(errorCode(e));
        this.loading.set(false);
      },
    });
  }

  src(p: StaffPhoto | null): string {
    return photoUrl(p?.url);
  }

  @HostListener('document:keydown.escape')
  close(): void {
    this.open.set(null);
  }
}
