import { ChangeDetectionStrategy, Component, Inject, OnInit, Optional, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BranchCatalogService, CatalogServicePickResult, ServiceCatalogApi } from '../../settings/service-catalog/service-catalog-api';

interface Row extends BranchCatalogService {
  ticked: boolean;
  sell: number | null;
  minutes: number | null;
}

/**
 * POS > Setting > Huduma (owner, 2026-11-14, as BaronixTZ): the main office's
 * services, ticked for this branch, then this branch's own price (and time)
 * for each. Ticking one the branch already has only changes its price.
 * Closes with the number saved, or 'manual' for "Andika nyingine".
 */
@Component({
  selector: 'app-service-catalog-pick',
  imports: [CommonModule, FormsModule, MatIconModule, TranslatePipe],
  templateUrl: './service-catalog-pick.html',
  styleUrl: './service-catalog-pick.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceCatalogPick implements OnInit {
  readonly rows = signal<Row[]>([]);
  readonly loading = signal(true);
  readonly step = signal<1 | 2>(1);
  readonly search = signal('');
  readonly error = signal('');
  readonly saving = signal(false);
  readonly failed = signal<CatalogServicePickResult[]>([]);
  private saved = 0;
  readonly offerManual: boolean;

  readonly shown = computed(() => {
    const q = this.search().trim().toLowerCase();
    const all = this.rows();
    return q ? all.filter((r) => [r.name, r.category, r.description].some((v) => (v || '').toLowerCase().includes(q))) : all;
  });
  readonly ticked = computed(() => this.rows().filter((r) => r.ticked));

  constructor(
    private api: ServiceCatalogApi,
    private ref: MatDialogRef<ServiceCatalogPick, number | 'manual'>,
    private translate: TranslateService,
    @Optional() @Inject(MAT_DIALOG_DATA) data: { offerManual?: boolean; preselected?: string[] } | null,
  ) {
    this.offerManual = !!data?.offerManual;
    this.preselected = new Set(data?.preselected || []);
  }

  /** Ticked already on the Huduma page: open straight at their prices. */
  private readonly preselected: Set<string>;

  ngOnInit(): void {
    this.api.forBranch().subscribe({
      next: (r) => {
        const rows = (r.data || []).map((c) => ({ ...c, ticked: this.preselected.has(c.uid), sell: c.price ?? null, minutes: c.branchDuration ?? c.duration ?? null }));
        // Nothing registered by the main office yet: straight to typing one.
        if (rows.length === 0 && this.offerManual) {
          this.ref.close('manual');
          return;
        }
        this.rows.set(rows);
        if (this.preselected.size && this.ticked().length) this.step.set(2);
        this.loading.set(false);
      },
      error: () => {
        if (this.offerManual) this.ref.close('manual');
        else this.loading.set(false);
      },
    });
  }

  manual(): void {
    this.ref.close('manual');
  }

  toggle(row: Row): void {
    this.rows.set(this.rows().map((r) => (r.uid === row.uid ? { ...r, ticked: !r.ticked } : r)));
    this.error.set('');
  }

  setField(row: Row, field: 'sell' | 'minutes', value: any): void {
    const n = value === '' || value === null ? null : Number(value);
    this.rows.set(this.rows().map((r) => (r.uid === row.uid ? { ...r, [field]: n } : r)));
  }

  next(): void {
    if (this.ticked().length === 0) {
      this.error.set(this.translate.instant('SERVICE_CATALOG.NONE_SELECTED'));
      return;
    }
    this.error.set('');
    this.step.set(2);
  }

  save(): void {
    const picks = this.ticked();
    if (picks.some((r) => !r.sell || r.sell <= 0)) {
      this.error.set(this.translate.instant('SERVICE_CATALOG.PRICE_REQUIRED'));
      return;
    }
    this.saving.set(true);
    this.error.set('');
    this.api.addToBranch(picks.map((r) => ({ catalogUid: r.uid, price: r.sell!, duration: r.minutes }))).subscribe({
      next: (res) => {
        this.saving.set(false);
        const results = res.data || [];
        const bad = results.filter((x) => !x.ok);
        this.saved += results.length - bad.length;
        if (bad.length === 0) {
          this.ref.close(this.saved);
          return;
        }
        const badIds = new Set(bad.map((b) => b.catalogUid));
        this.rows.set(this.rows().map((r) => ({ ...r, ticked: badIds.has(r.uid), added: r.added || (r.ticked && !badIds.has(r.uid)) })));
        this.failed.set(bad);
      },
      error: () => this.saving.set(false),
    });
  }

  close(): void {
    this.ref.close(this.saved);
  }
}
