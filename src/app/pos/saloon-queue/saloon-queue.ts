import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Title2 } from '../../Utils/component/title2/title2';
import { AlertService } from '../../Utils/services/alert';
import { QueueLoyaltyService, QueueSettingsView, QueueTicketRow } from '../queue-loyalty-service';
import { doorLink, printDoorCard, tvLink } from '../../Utils/services/print-door-card';

const POLL_MS = 20_000;

/**
 * Foleni - walk-ins who joined by the door QR, today. Ita sends them one SMS
 * and marks them called; Anza opens a bill for them (their customer card on
 * it) and goes to Sales; paying that bill closes the ticket.
 */
@Component({
  selector: 'app-saloon-queue',
  imports: [Title2, MatIconModule, TranslatePipe],
  templateUrl: './saloon-queue.html',
  styleUrl: './saloon-queue.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaloonQueue implements OnInit, OnDestroy {
  private api = inject(QueueLoyaltyService);
  private router = inject(Router);
  private alert = inject(AlertService);
  private translate = inject(TranslateService);

  tickets = signal<QueueTicketRow[]>([]);
  loaded = signal(false);
  busy = signal<string | null>(null);
  settings = signal<QueueSettingsView | null>(null);
  now = signal(Date.now());
  private timer: any = null;

  waiting = computed(() => this.tickets().filter((t) => t.status === 'WAITING'));
  called = computed(() => this.tickets().filter((t) => t.status === 'CALLED'));
  serving = computed(() => this.tickets().filter((t) => t.status === 'SERVING'));
  link = computed(() => (this.settings() ? doorLink(this.settings()!.token) : ''));
  tv = computed(() => (this.settings() ? tvLink(this.settings()!.token) : ''));

  groups = computed(() => [
    { key: 'WAITING', title: 'QUEUE.WAITING', rows: this.waiting() },
    { key: 'CALLED', title: 'QUEUE.CALLED', rows: this.called() },
    { key: 'SERVING', title: 'QUEUE.SERVING', rows: this.serving() },
  ]);

  ngOnInit(): void {
    this.load(false);
    this.api.settings().subscribe({ next: (r) => this.settings.set(r.data ?? null), error: () => {} });
    this.timer = setInterval(() => {
      if (document.visibilityState !== 'hidden') {
        this.load(true);
      }
    }, POLL_MS);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  load(quiet: boolean): void {
    this.api.board(quiet).subscribe({
      next: (r) => {
        this.tickets.set(r.data ?? []);
        this.now.set(Date.now());
        this.loaded.set(true);
      },
      error: () => this.loaded.set(true),
    });
  }

  /** Minutes since they joined (waiting) or were called. */
  minutes(t: QueueTicketRow): number {
    const from = t.status === 'WAITING' ? t.joinedAt : t.calledAt || t.joinedAt;
    const at = from ? new Date(from).getTime() : NaN;
    return isNaN(at) ? 0 : Math.max(0, Math.floor((this.now() - at) / 60_000));
  }

  call(t: QueueTicketRow): void {
    this.run(t, this.api.call(t.uid), (r) => {
      this.alert.show('success', this.translate.instant(r.data?.smsSent ? 'QUEUE.CALLED_SMS' : 'QUEUE.CALLED_OK', { name: t.customerName }));
    });
  }

  start(t: QueueTicketRow): void {
    this.run(t, this.api.start(t.uid), () => {
      this.alert.show('success', this.translate.instant('QUEUE.STARTED', { name: t.customerName }));
      this.router.navigate(['/pos/saloonSales']);
    });
  }

  left(t: QueueTicketRow): void {
    this.run(t, this.api.left(t.uid), () => {});
  }

  openSales(): void {
    this.router.navigate(['/pos/saloonSales']);
  }

  print(): void {
    const s = this.settings();
    if (!s) {
      return;
    }
    printDoorCard({
      token: s.token,
      branchName: s.branchName,
      heading: this.translate.instant('QUEUE_SETTING.PRINT_HEADING'),
      hint: this.translate.instant('QUEUE_SETTING.PRINT_HINT'),
    });
  }

  copyLink(): void {
    const l = this.link();
    if (!l) {
      return;
    }
    navigator.clipboard?.writeText(l).then(
      () => this.alert.show('success', this.translate.instant('QUEUE.LINK_COPIED')),
      () => {},
    );
  }

  private run(t: QueueTicketRow, req: any, done: (r: any) => void): void {
    if (this.busy()) {
      return;
    }
    this.busy.set(t.uid);
    req.subscribe({
      next: (r: any) => {
        this.busy.set(null);
        done(r);
        this.load(true);
      },
      error: () => {
        this.busy.set(null);
        this.load(true);
      },
    });
  }
}
