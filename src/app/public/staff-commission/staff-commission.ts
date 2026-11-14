import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { environment } from '../../Utils/enviroments/environment';
import { ActivatedRoute } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { PublicApi, StaffCardView, errorCode } from '../public-api';
import { LangDatePipe } from '../../Utils/pipes/lang-date.pipe';

/**
 * /kamisheni/:token - a stylist scans their own QR (POS > Watumishi > QR) and
 * sees their commission today / this week / this month, the services behind
 * it, and what the salon paid them and still owes. No login.
 */
@Component({
  selector: 'app-staff-commission',
  imports: [DecimalPipe, TranslatePipe, LangDatePipe],
  templateUrl: './staff-commission.html',
  styleUrls: ['../public-page.css', './staff-commission.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StaffCommission implements OnInit, OnDestroy {
  private api = inject(PublicApi);
  private route = inject(ActivatedRoute);

  token = '';
  period = signal<'TODAY' | 'WEEK' | 'MONTH'>('MONTH');
  view = signal<StaffCardView | null>(null);
  loading = signal(true);
  error = signal('');
  readonly periods: ('TODAY' | 'WEEK' | 'MONTH')[] = ['TODAY', 'WEEK', 'MONTH'];

  /** Install as an app (owner 2026-11-14): Chrome's prompt when it offers one, else a how-to. */
  canPrompt = signal(false);
  installed = signal(false);
  showHow = signal(false);
  isIos = false;
  private deferred: any = null;
  private oldManifest: string | null = null;
  private onPrompt = (e: Event) => {
    e.preventDefault();
    this.deferred = e;
    this.canPrompt.set(true);
  };
  private onInstalled = () => {
    this.installed.set(true);
    this.canPrompt.set(false);
  };

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') ?? '';
    this.load();
    try {
      this.installed.set(window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true);
      this.isIos = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      // This card's own manifest: the installed app opens on this page.
      const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
      if (link && this.token) {
        this.oldManifest = link.getAttribute('href');
        link.setAttribute('href', `${environment.baseApiUrl}/public/staffCard/${encodeURIComponent(this.token)}/manifest`);
      }
      document.querySelector('meta[name="apple-mobile-web-app-title"]')?.setAttribute('content', 'Kamisheni');
      window.addEventListener('beforeinstallprompt', this.onPrompt);
      window.addEventListener('appinstalled', this.onInstalled);
    } catch {}
  }

  ngOnDestroy(): void {
    try {
      window.removeEventListener('beforeinstallprompt', this.onPrompt);
      window.removeEventListener('appinstalled', this.onInstalled);
      const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
      if (link && this.oldManifest) link.setAttribute('href', this.oldManifest);
      document.querySelector('meta[name="apple-mobile-web-app-title"]')?.setAttribute('content', 'SalonixTz');
    } catch {}
  }

  async install(): Promise<void> {
    if (!this.deferred) {
      this.showHow.set(!this.showHow());
      return;
    }
    this.deferred.prompt();
    try {
      const r = await this.deferred.userChoice;
      if (r?.outcome === 'accepted') this.installed.set(true);
    } catch {}
    this.deferred = null;
    this.canPrompt.set(false);
  }

  /** Barber / Beauty Therapist as the language reads them; anything else as stored. */
  catKey(c: string): string {
    const k = (c || '').trim().toLowerCase();
    return k === 'barber' ? 'POS_T.STAFF.BARBER' : k === 'beauty therapist' ? 'POS_T.STAFF.BEAUTY_THERAPIST' : c;
  }

  pick(p: 'TODAY' | 'WEEK' | 'MONTH'): void {
    if (p === this.period()) return;
    this.period.set(p);
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.staffCard(this.token, this.period()).subscribe({
      next: (v) => { this.view.set(v); this.loading.set(false); },
      error: (e) => { this.error.set(errorCode(e)); this.loading.set(false); },
    });
  }
}
