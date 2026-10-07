import { PotNamePipe } from '../../Utils/pipes/pot-name.pipe';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { environment } from '../../Utils/enviroments/environment';
import { Response, ResponseList } from '../../Utils/models/responces';
import { AlertService } from '../../Utils/services/alert';
import { Authentication } from '../../Utils/services/authentication';

interface CountLine {
  method: string;
  /** Payments taken by this method. */
  takings: number;
  /** Payouts recorded in the system during the shift (cash only) - shown, never typed. */
  payouts: number;
  expected: number;
  bills: number;
  counted: number | null;
}

/**
 * Closing a shift. The top card is the signed-in cashier's open shift: what
 * the payments they took say each method should hold, a box to type what they
 * counted, and the difference as they type. Below, the cash-ups already closed
 * - everyone's for a manager, their own for a cashier.
 */
@Component({
  selector: 'app-cash-up',
  imports: [PotNamePipe, FormsModule, MatIconModule, DecimalPipe, DatePipe, TranslatePipe],
  templateUrl: './cash-up.html',
  styleUrl: './cash-up.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashUp implements OnInit {
  @Input() area = 'saloon';

  /** Who may close a shift: those who take payments. */
  private static readonly TAKES_PAYMENTS = ['ROOT', 'CEO', 'MANAGER', 'CASHIER'];

  canClose = false;
  loadingShift = true;
  from: string | null = null;
  to: string | null = null;
  lines: CountLine[] = [];
  billCount = 0;
  payouts: any[] = [];
  payoutsTotal = 0;
  note = '';
  submitting = false;
  /** Asked once more before the shift is closed - a cash-up cannot be changed afterwards. */
  confirming = false;

  filter = 'DAY';
  readonly filters = [
    { key: 'DAY', label: 'COMMON.TODAY' },
    { key: 'YESTERDAY', label: 'COMMON.YESTERDAY' },
    { key: 'WEEK', label: 'COMMON.THIS_WEEK' },
    { key: 'MONTH', label: 'COMMON.THIS_MONTH' },
  ];
  history: any[] = [];
  openUid: string | null = null;
  openLines: any[] = [];

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private alert: AlertService,
    private translate: TranslateService,
    private auth: Authentication,
  ) {}

  private get url(): string {
    return `${environment.baseApiUrl}/${this.area}/cashUp`;
  }

  ngOnInit(): void {
    this.canClose = CashUp.TAKES_PAYMENTS.some((r) => this.auth.hasRole(r));
    if (this.canClose) {
      this.loadShift();
    } else {
      this.loadingShift = false;
    }
    this.loadHistory(this.filter);
  }

  loadShift(): void {
    this.loadingShift = true;
    this.http.get<Response<any>>(`${this.url}/preview`).subscribe({
      next: (res) => {
        const d = res?.data;
        this.from = d?.from ?? null;
        this.to = d?.to ?? null;
        this.billCount = d?.billCount ?? 0;
        this.payouts = d?.payouts ?? [];
        this.payoutsTotal = Number(d?.payoutsTotal) || 0;
        const lines: CountLine[] = (d?.lines ?? []).map((l: any) => ({
          method: l.method, takings: Number(l.takings) || 0, payouts: Number(l.payouts) || 0,
          expected: Number(l.expected) || 0, bills: l.bills || 0, counted: null,
        }));
        // Cash can always be counted, even on a shift with no cash taken.
        if (!lines.some((l) => l.method === 'cash')) {
          lines.unshift({ method: 'cash', takings: 0, payouts: 0, expected: 0, bills: 0, counted: null });
        }
        lines.sort((a, b) => (a.method === 'cash' ? -1 : b.method === 'cash' ? 1 : 0));
        this.lines = lines;
        this.loadingShift = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadingShift = false;
        this.cdr.markForCheck();
      },
    });
  }

  get takingsTotal(): number {
    return this.lines.reduce((s, l) => s + l.takings, 0);
  }

  get expectedTotal(): number {
    return this.lines.reduce((s, l) => s + l.expected, 0);
  }

  get countedTotal(): number {
    return this.lines.reduce((s, l) => s + (Number(l.counted) || 0), 0);
  }

  /** Whether anything has been counted yet - the total's difference waits until then. */
  get anyCounted(): boolean {
    return this.lines.some((l) => l.counted !== null && (l.counted as any) !== '');
  }

  variance(line: CountLine): number | null {
    return line.counted === null || (line.counted as any) === '' ? null : (Number(line.counted) || 0) - line.expected;
  }

  /** Every method with takings has a count. */
  get ready(): boolean {
    return !this.submitting && this.lines.every((l) => (l.takings === 0 && l.payouts === 0) || (l.counted !== null && (l.counted as any) !== ''));
  }

  submit(): void {
    if (!this.ready) {
      return;
    }
    if (!this.confirming) {
      this.confirming = true;
      return;
    }
    this.confirming = false;
    this.submitting = true;
    const counts = this.lines
      .filter((l) => l.counted !== null && (l.counted as any) !== '')
      .map((l) => ({ method: l.method, counted: Number(l.counted) || 0 }));
    this.http.post<Response<any>>(`${this.url}/submit`, { counts, note: this.note }).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res?.data) {
          const v = Number(res.data.variance) || 0;
          this.alert.show(v < 0 ? 'warning' : 'success', this.translate.instant(v < 0 ? 'CASH_UP.CLOSED_SHORT' : 'CASH_UP.CLOSED_OK', { amount: Math.abs(v).toLocaleString() }));
          this.note = '';
          this.loadShift();
          this.loadHistory(this.filter);
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.submitting = false;
        this.cdr.markForCheck();
      },
    });
  }

  loadHistory(filter: string): void {
    this.filter = filter;
    this.openUid = null;
    this.http.get<ResponseList<any>>(`${this.url}/list/${filter}`).subscribe({
      next: (res) => {
        this.history = res?.data ?? [];
        this.cdr.markForCheck();
      },
      error: () => {
        this.history = [];
        this.cdr.markForCheck();
      },
    });
  }

  get historyVariance(): number {
    return this.history.reduce((s, c) => s + (Number(c.variance) || 0), 0);
  }

  toggle(row: any): void {
    if (this.openUid === row.uid) {
      this.openUid = null;
      return;
    }
    this.openUid = row.uid;
    this.openLines = [];
    this.http.get<ResponseList<any>>(`${this.url}/${row.uid}/lines`).subscribe({
      next: (res) => {
        this.openLines = res?.data ?? [];
        this.cdr.markForCheck();
      },
    });
  }
}
