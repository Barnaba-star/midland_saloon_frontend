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
import { Router } from '@angular/router';
import { ShiftBar, ShiftState } from '../shift-bar/shift-bar';

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
 * Handing over a shift (zamu). The top card is the signed-in cashier's shift:
 * open it to sell, close it to hand over - what the payments they took in it
 * say each method should hold, a box to type what they counted, and the
 * difference as they type; then the store count, so anything missing stays on
 * that shift. Below, every shift (its handover and store loss) and the
 * cash-ups done - everyone's for a manager, their own for a cashier.
 */
@Component({
  selector: 'app-cash-up',
  imports: [PotNamePipe, ShiftBar, FormsModule, MatIconModule, DecimalPipe, DatePipe, TranslatePipe],
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
  /** NONE / OPEN show the shift bar; CLOSED shows the count below it. */
  shiftState: ShiftState | null = null;
  shifts: any[] = [];
  /** Just handed over: the store count comes next, on that same shift. */
  handedOverBy: string | null = null;
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
    private router: Router,
  ) {}

  private get url(): string {
    return `${environment.baseApiUrl}/${this.area}/cashUp`;
  }

  ngOnInit(): void {
    this.canClose = CashUp.TAKES_PAYMENTS.some((r) => this.auth.hasRole(r));
    if (this.canClose) {
      this.http.get<Response<any>>(`${environment.baseApiUrl}/${this.area}/shift/current`).subscribe({
        next: (res) => this.onShiftState(res?.data?.state ?? 'NONE'),
        error: () => {
          this.loadingShift = false;
          this.cdr.markForCheck();
        },
      });
    } else {
      this.loadingShift = false;
    }
    this.loadHistory(this.filter);
  }

  onShiftState(state: ShiftState): void {
    const changed = this.shiftState !== null && this.shiftState !== state;
    this.shiftState = state;
    if (state === 'CLOSED') {
      this.loadShift();
    } else {
      this.loadingShift = false;
      this.lines = [];
    }
    if (changed) {
      this.loadShifts(this.filter);
    }
    this.cdr.markForCheck();
  }

  /** The store count of the shift just handed over (Reports > store count). */
  countStore(): void {
    this.router.navigate(['/pos/saloonReports'], { queryParams: { tab: 'REPORTS.VARIANCE' } });
  }

  loadShifts(filter: string): void {
    this.http.get<ResponseList<any>>(`${environment.baseApiUrl}/${this.area}/shift/list/${filter}`).subscribe({
      next: (res) => {
        this.shifts = res?.data ?? [];
        this.cdr.markForCheck();
      },
      error: () => {
        this.shifts = [];
        this.cdr.markForCheck();
      },
    });
  }

  duration(minutes: number): string {
    const m = Number(minutes) || 0;
    return m < 60
      ? this.translate.instant('SHIFT.MINUTES', { m })
      : this.translate.instant('SHIFT.HOURS', { h: Math.floor(m / 60), m: m % 60 });
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
          this.handedOverBy = res.data.cashierName || '';
          this.shiftState = 'NONE';
          this.lines = [];
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
    this.loadShifts(filter);
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
