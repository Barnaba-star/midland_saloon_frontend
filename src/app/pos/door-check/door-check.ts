import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { environment } from '../../Utils/enviroments/environment';
import { LangDatePipe } from '../../Utils/pipes/lang-date.pipe';
import { localDate } from '../../Utils/services/local-date';
import { StaffFaces } from '../staff-faces/staff-faces';

interface DoorDay { date: string; entries: number | null; customers: number | null; bills: number; gap: number | null; }
interface DoorHour { hour: number; entries: number; bills: number; }
interface DoorReport {
  from: string; to: string; counters: number; staffEntries: number; alertGap: number;
  days: DoorDay[]; totals: { entries: number; customers: number; bills: number; gap: number };
  todayHours: DoorHour[];
}
interface DoorCounter { uid: string; name: string; key: string; link: string; host: string; path: string; lastSeenAt: string | null; }

/**
 * Ripoti > Mlango (owner, 2026-11-18 - step 1 of "service given but not
 * recorded"): the door camera's count of people coming in against the bills
 * that got services, day by day. A gap is a sign to look into, not proof.
 * CEO and manager only; the cashier, whose bills it checks, never sees it.
 */
@Component({
  selector: 'app-door-check',
  imports: [FormsModule, MatIconModule, TranslatePipe, LangDatePipe, StaffFaces],
  templateUrl: './door-check.html',
  styleUrl: './door-check.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoorCheck implements OnInit {
  readonly periods = [
    { key: 7, label: 'DOOR.LAST_7' },
    { key: 14, label: 'DOOR.LAST_14' },
    { key: 30, label: 'DOOR.LAST_30' },
  ];
  days = 7;
  loading = false;
  failed = false;
  report: DoorReport | null = null;

  setupOpen = false;
  facesOpen = false;
  counters: DoorCounter[] = [];
  newName = '';
  staffEntries = 0;
  alertGap = 3;
  alertsOn = true;
  saving = false;
  message = '';

  private readonly api = `${environment.baseApiUrl}/saloon/door`;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.load();
    this.loadSetup();
  }

  pick(days: number): void {
    this.days = days;
    this.load();
  }

  load(): void {
    this.loading = true;
    this.failed = false;
    this.cdr.markForCheck();
    const to = localDate(new Date());
    const start = new Date();
    start.setDate(start.getDate() - (this.days - 1));
    this.http.get<{ data: DoorReport }>(`${this.api}/report`, { params: { from: localDate(start), to } }).subscribe({
      next: (r) => { this.report = r.data; this.loading = false; this.cdr.markForCheck(); },
      error: () => { this.report = null; this.failed = true; this.loading = false; this.cdr.markForCheck(); },
    });
  }

  loadSetup(): void {
    this.http.get<{ data: DoorCounter[] }>(`${this.api}/counters`).subscribe({
      next: (r) => {
        this.counters = r.data ?? [];
        // No camera yet: open the setup straight away.
        if (this.counters.length === 0) this.setupOpen = true;
        this.cdr.markForCheck();
      },
      error: () => {},
    });
    this.http.get<{ data: { staffEntries: number; alertGap: number; alertsOn: boolean } }>(`${this.api}/settings`).subscribe({
      next: (r) => {
        this.staffEntries = r.data?.staffEntries ?? 0;
        this.alertGap = r.data?.alertGap ?? 3;
        this.alertsOn = r.data?.alertsOn ?? true;
        this.cdr.markForCheck();
      },
      error: () => {},
    });
  }

  addCounter(): void {
    this.saving = true;
    this.http.post<{ data: DoorCounter }>(`${this.api}/counters`, { name: this.newName }).subscribe({
      next: (r) => { this.counters = [...this.counters, r.data]; this.newName = ''; this.saving = false; this.load(); this.cdr.markForCheck(); },
      error: (e) => { this.message = e?.error?.message ?? 'DOOR.FAILED'; this.saving = false; this.cdr.markForCheck(); },
    });
  }

  removeCounter(c: DoorCounter): void {
    this.http.post(`${this.api}/counters/${c.uid}/remove`, {}).subscribe({
      next: () => { this.counters = this.counters.filter(x => x.uid !== c.uid); this.load(); this.cdr.markForCheck(); },
      error: () => {},
    });
  }

  saveSettings(): void {
    this.saving = true;
    this.message = '';
    this.http.post<{ data: unknown }>(`${this.api}/settings`, {
      staffEntries: this.staffEntries, alertGap: this.alertGap, alertsOn: this.alertsOn,
    }).subscribe({
      next: () => { this.saving = false; this.message = 'DOOR.SAVED'; this.load(); this.cdr.markForCheck(); },
      error: (e) => { this.saving = false; this.message = e?.error?.message ?? 'DOOR.FAILED'; this.cdr.markForCheck(); },
    });
  }

  copy(text: string): void {
    try { navigator.clipboard?.writeText(text); this.message = 'DOOR.COPIED'; } catch { /* old browser */ }
    this.cdr.markForCheck();
  }

  /** Bar length for the hour chart, against the busiest hour. */
  width(n: number): number {
    const max = Math.max(1, ...(this.report?.todayHours ?? []).map(h => Math.max(h.entries, h.bills)));
    return Math.round((n / max) * 100);
  }

  level(d: DoorDay): 'ok' | 'warn' | 'bad' | 'none' {
    if (d.gap == null) return 'none';
    if (d.gap >= (this.report?.alertGap ?? 3)) return 'bad';
    if (d.gap > 0) return 'warn';
    return 'ok';
  }
}
