import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { CardView, PublicApi, StylePhoto, errorCode, photoUrl } from '../public-api';
import { qrDataUrl } from '../../Utils/services/qr';

/**
 * /kadi/:token - the customer's card on their own phone: a big QR of this
 * same link (the till scans it) and how close the next reward is.
 */
@Component({
  selector: 'app-customer-card',
  imports: [DatePipe, DecimalPipe, TranslatePipe],
  templateUrl: './customer-card.html',
  styleUrls: ['../public-page.css', './customer-card.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerCard implements OnInit {
  private api = inject(PublicApi);
  private route = inject(ActivatedRoute);

  token = '';
  card = signal<CardView | null>(null);
  qr = signal('');
  loading = signal(true);
  error = signal('');
  /** "Mitindo yako": the styles done on this guest, newest first. */
  photos = signal<(StylePhoto & { src: string })[]>([]);
  open = signal<(StylePhoto & { src: string }) | null>(null);

  /** One dot per visit of the rule; long rules (over 20) show a bar instead. */
  dots = computed(() => {
    const c = this.card();
    if (!c || !c.ruleOn || !c.visitsNeeded || c.visitsNeeded > 20) {
      return [];
    }
    return Array.from({ length: c.visitsNeeded }, (_, i) => i < (c.visitsTowardReward ?? 0));
  });

  percent = computed(() => {
    const c = this.card();
    if (!c?.visitsNeeded) {
      return 0;
    }
    return Math.min(100, Math.round(((c.visitsTowardReward ?? 0) / c.visitsNeeded) * 100));
  });

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') ?? '';
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.card(this.token).subscribe({
      next: (c) => {
        this.card.set(c);
        this.loading.set(false);
        const link = `${location.origin}/kadi/${c.cardToken || this.token}`;
        qrDataUrl(link, 640).then((url) => this.qr.set(url)).catch(() => this.qr.set(''));
        this.loadPhotos(c.cardToken || this.token);
      },
      error: (e) => {
        this.error.set(errorCode(e));
        this.loading.set(false);
      },
    });
  }

  private loadPhotos(token: string): void {
    this.api.cardPhotos(token).subscribe({
      next: (r) => {
        const list = [...(r?.photos ?? [])]
          .sort((a, b) => (b.at ?? '').localeCompare(a.at ?? ''))
          .map((p) => ({ ...p, src: photoUrl(p.url) }));
        this.photos.set(list);
      },
      error: () => this.photos.set([]),
    });
  }
}
