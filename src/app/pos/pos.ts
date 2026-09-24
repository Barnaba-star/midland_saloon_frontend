import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';

import { filter } from 'rxjs';
import { SidenavItem } from '../Utils/component/main-sidenav-component/model';
import { Authentication } from '../Utils/services/authentication';
import { MainSidenav2 } from '../Utils/component/main-sidenav2/main-sidenav2';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { POS_FULL_ACCESS_ROLES } from './pos-role.guard';
import { ServiceSaloonMethod } from './service-saloon-method';

@Component({
  selector: 'app-pos',
  imports:  [CommonModule, RouterModule, MainSidenav2, MatIconModule, TranslatePipe],
  templateUrl: './pos.html',
  styleUrl: './pos.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export  class Pos implements OnInit{
// Injected as a field (not a constructor parameter) so it already exists
// when the field initializers below (e.g. reportLabel) run - constructor
// parameters are only assigned after those initializers.
private visibility = inject(Authentication);
constructor(private router: Router, private route: ActivatedRoute, private cdr: ChangeDetectorRef, private saloonService: ServiceSaloonMethod) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkIfHome();
        this.cdr.markForCheck();
      });
}
  ngOnInit(): void {
    // isHome starts true as a field default, which is not the same as being
    // on the home view - resolve it from the route before acting on it, or
    // opening straight into a sub-section would fetch a dashboard nobody is
    // looking at.
    this.checkIfHome();
    if (this.isHome) {
      this.loadDashboard();
    }
  }
isHome = true;
// Frontend visibility only - the actual security boundary is each
// endpoint's @PreAuthorize permission check on the backend. This just
// decides which of these a given role sees in the POS sidenav.
//   CEO     -> everything, including Setting
//   MANAGER -> everything except Setting; Report shows as "Matumizi"
//   CASHIER -> same as MANAGER
// ROOT/STAFF/DIRECTOR keep full access like CEO.
private readonly fullAccessRoles = POS_FULL_ACCESS_ROLES;
private readonly allRoles = [...POS_FULL_ACCESS_ROLES, 'MANAGER', 'CASHIER'];

// MANAGER/CASHIER see the Report section under the name "Matumizi"
// (Expenses). Anyone holding a full-access role sees it as "Report".
private readonly reportLabel = this.fullAccessRoles.some(role => this.visibility.hasRole(role))
  ? 'MENU.REPORT'
  : 'MENU.EXPENSES';

menuItems: SidenavItem[] = [
  {
    label: 'MENU.HOME',
    icon: 'home',
    // Bare /pos is the branch dashboard. Without a route this item rendered
    // but did nothing, so there was no way back to it once you had opened a
    // section.
    route: '/pos',
    roles: this.allRoles
  },
  {
    label: 'MENU.STAFF',
    icon: 'person',
    route: '/pos/saloonStaff',
    roles: this.allRoles
  },
  {
    label: 'MENU.SERVICE',
    icon: 'service',
    route:'/pos/saloonService',
    roles: this.allRoles
  },
  {
    label: 'MENU.STORE',
    icon: 'store',
    route: '/pos/saloonStore',
    roles: this.allRoles
  },
   {
    label: 'MENU.SALES',
    icon: 'payment2',
     route:'/pos/saloonSales',
    roles: this.allRoles,
  },
  {
    label: this.reportLabel,
    icon: 'report',
    route: '/pos/saloonReports',
    roles: this.allRoles
  },
  {
    label: 'MENU.SETTING',
    icon: 'setting',
    route: '/pos/saloonSetting',
    roles: this.fullAccessRoles
  }
];

getItems(menu: SidenavItem[]){
return this.visibility.filteredMenuItems(menu);
}

  private checkIfHome() {
    const wasHome = this.isHome;
    this.isHome = this.route.firstChild === null;

    // This component owns the router-outlet, so it is never destroyed while
    // moving between POS sections - ngOnInit runs once and once only. Without
    // this, coming back to the home view would show the figures from whenever
    // POS was first opened rather than the ones from now.
    if (this.isHome && !wasHome) {
      this.loadDashboard();
    }
  }

  get fullName(): string {
    return this.visibility.getFullName() || this.visibility.getUsername();
  }


  // ============================================================
  // BRANCH DASHBOARD (POS home)
  // ============================================================
  //
  // Everything here is scoped to the signed-in user's own branch by the
  // backend, which reads it off the token - nothing on this page chooses a
  // branch.
  //
  // The money figures are kept away from CASHIER: they take payments, they
  // do not need the branch's takings or where the owner's share goes. The
  // backend's @PreAuthorize is the real boundary; this only decides what is
  // worth rendering.

  summary: any = null;
  dashboardLoading = false;

  /** Trend geometry, computed once per load rather than per change detection pass. */
  trendPath = '';
  trendArea = '';
  trendPoints: { x: number; y: number; date: string; amount: number }[] = [];
  trendMax = 0;
  hoveredPoint: { x: number; y: number; date: string; amount: number } | null = null;

  serviceBars: { label: string; amount: number; percent: number }[] = [];
  splitBars: { label: string; amount: number; percent: number }[] = [];
  staffRows: { name: string; earned: number; services: number; percent: number }[] = [];
  stockRows: { label: string; total: number; paid: number; remaining: number; percent: number }[] = [];
  stockTotals = { total: 0, paid: 0, remaining: 0 };

  // The trend chart's drawing box. Fixed viewBox, scaled by CSS - so the
  // maths stays in one coordinate system whatever the screen width.
  readonly chartWidth = 720;
  readonly chartHeight = 180;
  private readonly padLeft = 8;
  private readonly padRight = 8;
  private readonly padTop = 12;
  private readonly padBottom = 22;

  get seesMoney(): boolean {
    return POS_FULL_ACCESS_ROLES.some(role => this.visibility.hasRole(role))
      || this.visibility.hasRole('MANAGER');
  }

  loadDashboard(): void {
    this.dashboardLoading = true;

    this.saloonService.findBranchDashboard().subscribe({
      next: (response) => {
        this.summary = response?.data ?? null;
        this.dashboardLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.summary = null;
        this.dashboardLoading = false;
        this.cdr.markForCheck();
      }
    });

    if (!this.seesMoney) {
      return;
    }

    this.saloonService.findRevenueTrend(30).subscribe({
      next: (response) => {
        this.buildTrend(response?.data ?? []);
        this.cdr.markForCheck();
      },
      error: () => {
        this.buildTrend([]);
        this.cdr.markForCheck();
      }
    });

    this.saloonService.findCurrentSaloonRevenueByService('MONTH').subscribe({
      next: (response) => {
        this.serviceBars = this.toBars(
          (response?.data ?? []).map((row: any) => ({
            label: row.serviceName ?? row.serviceCode ?? '-',
            // The projection carries the eleven buckets, not a total, so a
            // service's revenue is their sum.
            amount: this.sumBuckets(row)
          }))
        );
        this.cdr.markForCheck();
      },
      error: () => {
        this.serviceBars = [];
        this.cdr.markForCheck();
      }
    });

    this.saloonService.findStaffEarnings().subscribe({
      next: (response) => {
        const rows = (response?.data ?? []).map((row: any) => ({
          name: [row.firstName, row.lastName].filter(Boolean).join(' ') || '-',
          earned: Number(row.earned ?? 0),
          services: Number(row.servicesDone ?? 0)
        }));
        const max = rows.reduce((m: number, r: any) => Math.max(m, r.earned), 0);
        this.staffRows = rows.map((r: any) => ({ ...r, percent: max > 0 ? (r.earned / max) * 100 : 0 }));
        this.cdr.markForCheck();
      },
      error: () => {
        this.staffRows = [];
        this.cdr.markForCheck();
      }
    });

    this.saloonService.getStockAndPurchaseByFilter('THIS_WEEK').subscribe({
      next: (response) => {
        this.buildStock(response?.data ?? []);
        this.cdr.markForCheck();
      },
      error: () => {
        this.buildStock([]);
        this.cdr.markForCheck();
      }
    });

    this.saloonService.findCurrentSaloonRevenueReport('MONTH').subscribe({
      next: (response) => {
        // Not folded: every bucket a service price is split into is worth
        // seeing by name. Rolling eight of them into "Other" was hiding
        // exactly the ones being asked about - electricity, water, loan.
        this.splitBars = this.toBars(this.toSplit(response?.data), 0);
        this.cdr.markForCheck();
      },
      error: () => {
        this.splitBars = [];
        this.cdr.markForCheck();
      }
    });
  }


  /** The eleven columns a service price is split across, added back together. */
  private sumBuckets(row: any): number {
    if (!row) {
      return 0;
    }
    return [
      'staffAmount', 'ownerAmount', 'stockPurchaseAmount', 'traAmount',
      'rentAmount', 'lukuAmount', 'waterAmount', 'maintenanceAmount',
      'emergencyAmount', 'loanAmount', 'othersAmount'
    ].reduce((sum, key) => sum + Number(row[key] ?? 0), 0);
  }

  /** The eleven buckets a service price is divided into, as chartable rows. */
  private toSplit(data: any): { label: string; amount: number }[] {
    if (!data) {
      return [];
    }
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
      return [];
    }
    return [
      { label: 'POS_HOME.SPLIT_STAFF', amount: Number(row.staffAmount ?? 0) },
      { label: 'POS_HOME.SPLIT_OWNER', amount: Number(row.ownerAmount ?? 0) },
      { label: 'POS_HOME.SPLIT_STOCK', amount: Number(row.stockPurchaseAmount ?? 0) },
      { label: 'POS_HOME.SPLIT_TRA', amount: Number(row.traAmount ?? 0) },
      { label: 'POS_HOME.SPLIT_RENT', amount: Number(row.rentAmount ?? 0) },
      { label: 'POS_HOME.SPLIT_LUKU', amount: Number(row.lukuAmount ?? 0) },
      { label: 'POS_HOME.SPLIT_WATER', amount: Number(row.waterAmount ?? 0) },
      { label: 'POS_HOME.SPLIT_MAINTENANCE', amount: Number(row.maintenanceAmount ?? 0) },
      { label: 'POS_HOME.SPLIT_EMERGENCY', amount: Number(row.emergencyAmount ?? 0) },
      { label: 'POS_HOME.SPLIT_LOAN', amount: Number(row.loanAmount ?? 0) },
      { label: 'POS_HOME.SPLIT_OTHER', amount: Number(row.othersAmount ?? 0) }
    ];
  }

  /**
   * Ranked bars, largest first, with everything past the sixth folded into
   * one "Other" row - a chart with eleven near-zero bars says less than one
   * with six real ones.
   */
  private toBars(rows: { label: string; amount: number }[], limit = 8): { label: string; amount: number; percent: number }[] {
    const sorted = rows.filter(r => r.amount > 0).sort((a, b) => b.amount - a.amount);
    // limit 0 means show everything.
    const top = limit > 0 ? sorted.slice(0, limit) : sorted;
    const rest = limit > 0 ? sorted.slice(limit) : [];
    if (rest.length) {
      top.push({ label: 'POS_HOME.OTHER', amount: rest.reduce((sum, r) => sum + r.amount, 0) });
    }
    const max = top.length ? top[0].amount : 0;
    return top.map(r => ({ ...r, percent: max > 0 ? (r.amount / max) * 100 : 0 }));
  }

  /** This week's stock money: what was set aside per service, and what is left. */
  private buildStock(rows: any[]): void {
    const list = (Array.isArray(rows) ? rows : []).map((row: any) => ({
      label: row.serviceName ?? '-',
      total: Number(row.totalAmount ?? 0),
      paid: Number(row.payedAmount ?? 0),
      remaining: Number(row.remainingAmount ?? 0)
    })).filter(r => r.total > 0).sort((a, b) => b.total - a.total);

    const max = list.reduce((m, r) => Math.max(m, r.total), 0);
    this.stockRows = list.map(r => ({ ...r, percent: max > 0 ? (r.total / max) * 100 : 0 }));
    this.stockTotals = {
      total: list.reduce((s, r) => s + r.total, 0),
      paid: list.reduce((s, r) => s + r.paid, 0),
      remaining: list.reduce((s, r) => s + r.remaining, 0)
    };
  }

  private buildTrend(rows: any[]): void {
    this.trendPoints = [];
    this.trendPath = '';
    this.trendArea = '';
    this.trendMax = 0;

    if (!rows.length) {
      return;
    }

    const amounts = rows.map(r => Number(r.amount ?? 0));
    // A flat zero series would divide by zero below; 1 keeps the line on the
    // baseline instead.
    const max = Math.max(...amounts, 1);
    this.trendMax = Math.max(...amounts);

    const plotWidth = this.chartWidth - this.padLeft - this.padRight;
    const plotHeight = this.chartHeight - this.padTop - this.padBottom;
    const step = rows.length > 1 ? plotWidth / (rows.length - 1) : 0;

    this.trendPoints = rows.map((row, i) => ({
      x: this.padLeft + step * i,
      y: this.padTop + plotHeight - (Number(row.amount ?? 0) / max) * plotHeight,
      date: row.date,
      amount: Number(row.amount ?? 0)
    }));

    this.trendPath = this.trendPoints
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(' ');

    const baseline = this.padTop + plotHeight;
    const first = this.trendPoints[0];
    const last = this.trendPoints[this.trendPoints.length - 1];
    this.trendArea = `${this.trendPath} L${last.x.toFixed(1)},${baseline} L${first.x.toFixed(1)},${baseline} Z`;
  }

  onTrendHover(point: { x: number; y: number; date: string; amount: number } | null): void {
    this.hoveredPoint = point;
    this.cdr.markForCheck();
  }

  /** Change against yesterday, as a whole percent. Null when yesterday took nothing. */
  get revenueChange(): number | null {
    const today = Number(this.summary?.todayRevenue ?? 0);
    const yesterday = Number(this.summary?.yesterdayRevenue ?? 0);
    if (!yesterday) {
      return null;
    }
    return Math.round(((today - yesterday) / yesterday) * 100);
  }

  money(value: any): string {
    const n = Number(value ?? 0);
    return n.toLocaleString('en-US');
  }

}
