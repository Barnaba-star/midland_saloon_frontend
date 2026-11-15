import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { environment } from '../../Utils/enviroments/environment';
import { LangDatePipe } from '../../Utils/pipes/lang-date.pipe';
import { StatusKeyPipe } from '../status-key.pipe';

interface UsageUnit {
  uid: string; totalUses: number; firstTrip: number | null; lastTrip: number | null;
  code: string; status: string; openedDate: string; closedDate: string | null;
  openedInPeriod: boolean; closedInPeriod: boolean; uses: number; collected: number;
}
interface Trip {
  trip: number; date: string; time: string | null; serviceName: string; staffName: string; billCode: string | null; amount: number;
}
interface UsageItem {
  storeUid: string; name: string; code: string; services: string[]; buyingPrice: number; inStore: number;
  opened: number; finished: number; openNow: number; uses: number; collected: number; cost: number; balance: number;
  byService: { serviceName: string; uses: number; collected: number }[];
  units: UsageUnit[];
}
interface UsageReport {
  start: string; end: string;
  totals: { items: number; opened: number; finished: number; openNow: number; uses: number;
    collected: number; cost: number; balance: number; stockValue: number };
  items: UsageItem[];
}

/**
 * Ripoti > Store (owner 2026-11-15): every store item used in the period -
 * opened, finished, how many times it served a sale and for which services,
 * what it brought in against what it cost, and each opened item on its own.
 */
@Component({
  selector: 'app-store-usage',
  imports: [DecimalPipe, MatIconModule, TranslatePipe, LangDatePipe, StatusKeyPipe],
  templateUrl: './store-usage.html',
  styleUrl: './store-usage.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreUsage implements OnInit {
  /** The period picked, so the page can follow it (the commission table below). */
  @Output() periodChange = new EventEmitter<string>();
  @ViewChild('dateInput') dateInput?: ElementRef<HTMLInputElement>;

  readonly filters = [
    { key: 'DAY', label: 'COMMON.TODAY' },
    { key: 'YESTERDAY', label: 'COMMON.YESTERDAY' },
    { key: 'WEEK', label: 'COMMON.THIS_WEEK' },
    { key: 'LAST_WEEK', label: 'COMMON.LAST_WEEK' },
    { key: 'MONTH', label: 'COMMON.THIS_MONTH' },
    { key: 'LAST_MONTH', label: 'COMMON.LAST_MONTH' },
    { key: 'THIS_YEAR', label: 'COMMON.THIS_YEAR' },
    { key: 'LAST_YEAR', label: 'COMMON.LAST_YEAR' },
  ];
  period = 'DAY';
  loading = false;
  failed = false;
  report: UsageReport | null = null;
  open = new Set<string>();
  search = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.load();
  }

  pick(p: string): void {
    if (!p) return;
    this.period = p;
    this.periodChange.emit(p);
    this.load();
  }

  pickDate(): void {
    const el = this.dateInput?.nativeElement;
    try { el?.showPicker(); } catch { el?.click(); }
  }

  get isCustom(): boolean {
    return !this.filters.some(f => f.key === this.period);
  }

  load(): void {
    this.loading = true;
    this.failed = false;
    this.cdr.markForCheck();
    this.http.get<{ data: UsageReport }>(`${environment.baseApiUrl}/saloon/storeUsage`, { params: { period: this.period } })
      .subscribe({
        next: (r) => { this.report = r.data; this.trips.clear(); this.openUnit = null; this.loading = false; this.cdr.markForCheck(); },
        error: () => { this.report = null; this.failed = true; this.loading = false; this.cdr.markForCheck(); },
      });
  }

  get items(): UsageItem[] {
    const q = this.search.trim().toLowerCase();
    const all = this.report?.items ?? [];
    if (!q) return all;
    return all.filter(i => (i.name + ' ' + i.code + ' ' + i.services.join(' ')).toLowerCase().includes(q));
  }

  /** The opened item (kopo) whose trips are showing, and the trips fetched so far. */
  openUnit: string | null = null;
  trips = new Map<string, Trip[]>();
  tripsLoading = false;

  toggleUnit(u: UsageUnit): void {
    if (this.openUnit === u.uid) { this.openUnit = null; return; }
    this.openUnit = u.uid;
    if (this.trips.has(u.uid)) return;
    this.tripsLoading = true;
    this.http.get<{ data: { trips: Trip[] } }>(`${environment.baseApiUrl}/saloon/storeUsage/unit/${u.uid}`).subscribe({
      next: (r) => { this.trips.set(u.uid, r.data?.trips ?? []); this.tripsLoading = false; this.cdr.markForCheck(); },
      error: () => { this.trips.set(u.uid, []); this.tripsLoading = false; this.cdr.markForCheck(); },
    });
  }

  /** "Safari 3-5 kati ya 12" for the period's uses. */
  isPeriod(t: Trip, u: UsageUnit): boolean {
    return u.firstTrip != null && u.lastTrip != null && t.trip >= u.firstTrip && t.trip <= u.lastTrip;
  }

  toggle(uid: string): void {
    this.open.has(uid) ? this.open.delete(uid) : this.open.add(uid);
  }

  /** Share of the item's uses this service took, for the little bar. */
  share(item: UsageItem, uses: number): number {
    return item.uses ? Math.round((uses / item.uses) * 100) : 0;
  }
}
