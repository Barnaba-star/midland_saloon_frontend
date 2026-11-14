import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PublicApi, TvPerson, TvView, errorCode, photoUrl } from '../public-api';
import { qrDataUrl } from '../../Utils/services/qr';

const POLL_MS = 10_000;
const FLASH_MS = 8_000;

/**
 * /tv/:token - the salon's TV on the wall: who is called now, who is next,
 * the stylist of the week, the offer and the card reward, and the door QR.
 * No login; refreshes every 10 s. Sized off the screen (vw/vh) so it reads
 * from across the room at 1920x1080 and 1280x720 alike.
 */
@Component({
  selector: 'app-salon-tv',
  imports: [DecimalPipe, TranslatePipe],
  templateUrl: './salon-tv.html',
  styleUrl: './salon-tv.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalonTv implements OnInit, OnDestroy {
  private api = inject(PublicApi);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);

  token = '';
  tv = signal<TvView | null>(null);
  error = signal('');
  /** The last refresh failed; the screen keeps showing the last answer. */
  stale = signal(false);
  qr = signal('');
  now = signal(new Date());
  /** Numbers called since the last refresh glow for a few seconds. */
  fresh = signal<Set<number>>(new Set());
  fullscreen = signal(false);

  private poll: any = null;
  private clock: any = null;
  private flashTimer: any = null;
  private wakeLock: any = null;
  private qrFor = '';
  private seenCalled: Set<number> | null = null;

  /** Called first (they should walk up now), then those in the chair. */
  nowRows = computed(() => {
    const t = this.tv();
    if (!t) {
      return [] as (TvPerson & { kind: 'CALLED' | 'SERVING' })[];
    }
    return [
      ...(t.called ?? []).map((p) => ({ ...p, kind: 'CALLED' as const })),
      ...(t.serving ?? []).map((p) => ({ ...p, kind: 'SERVING' as const })),
    ];
  });
  calledRows = computed(() => this.nowRows().filter((r) => r.kind === 'CALLED').slice(0, 2));
  servingRows = computed(() => this.nowRows().filter((r) => r.kind === 'SERVING').slice(0, 4));
  nextRows = computed(() => (this.tv()?.next ?? []).slice(0, 8));
  starPhoto = computed(() => photoUrl(this.tv()?.star?.photo));
  starFull = computed(() => Math.round(this.tv()?.star?.stars ?? 0));

  time = computed(() => {
    const d = this.now();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  date = computed(() => {
    const lang = this.translate.getCurrentLang() || 'sw';
    try {
      return new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'sw-TZ', { weekday: 'long', day: 'numeric', month: 'long' }).format(this.now());
    } catch {
      return this.now().toDateString();
    }
  });

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') ?? '';
    this.load();
    this.poll = setInterval(() => this.load(), POLL_MS);
    this.clock = setInterval(() => this.now.set(new Date()), 5_000);
    this.keepAwake();
    document.addEventListener('fullscreenchange', this.onFullscreen);
    document.addEventListener('visibilitychange', this.onVisible);
  }

  ngOnDestroy(): void {
    clearInterval(this.poll);
    clearInterval(this.clock);
    clearTimeout(this.flashTimer);
    document.removeEventListener('fullscreenchange', this.onFullscreen);
    document.removeEventListener('visibilitychange', this.onVisible);
    try {
      this.wakeLock?.release?.();
    } catch {}
  }

  load(): void {
    this.api.tv(this.token).subscribe({
      next: (t) => {
        this.markFresh(t);
        this.tv.set(t);
        this.error.set('');
        this.stale.set(false);
        // The services QR (the door queue is off since 2026-11-14).
        const link = `${location.origin}/huduma/${this.token}`;
        if (link !== this.qrFor) {
          this.qrFor = link;
          qrDataUrl(link, 640).then((u) => this.qr.set(u)).catch(() => this.qr.set(''));
        }
      },
      error: (e) => {
        if (this.tv()) {
          this.stale.set(true);
        } else {
          this.error.set(errorCode(e));
        }
      },
    });
  }

  goFullscreen(): void {
    document.documentElement.requestFullscreen?.().catch(() => {});
  }

  private markFresh(t: TvView): void {
    const called = new Set((t.called ?? []).map((p) => p.number));
    if (this.seenCalled) {
      const fresh = new Set([...called].filter((n) => !this.seenCalled!.has(n)));
      if (fresh.size) {
        this.fresh.set(fresh);
        clearTimeout(this.flashTimer);
        this.flashTimer = setTimeout(() => this.fresh.set(new Set()), FLASH_MS);
      }
    }
    this.seenCalled = called;
  }

  /** A TV left on all day: ask the browser not to dim the screen. */
  private async keepAwake(): Promise<void> {
    try {
      this.wakeLock = await (navigator as any).wakeLock?.request('screen');
    } catch {}
  }

  private onFullscreen = () => this.fullscreen.set(!!document.fullscreenElement);
  private onVisible = () => {
    if (document.visibilityState === 'visible') {
      this.keepAwake();
      this.load();
    }
  };
}
