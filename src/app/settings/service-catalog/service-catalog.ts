import { ChangeDetectionStrategy, Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Authentication } from '../../Utils/services/authentication';
import { ConfirmDeleteDialogComponent } from '../../Utils/component/dialogs/confirm-delete-dialog-component/confirm-delete-dialog-component';
import { CatalogService, ServiceCatalogApi } from './service-catalog-api';

/**
 * Settings > Huduma za mfumo (owner, 2026-11-14, as BaronixTZ's drinks): the
 * main office describes each salon service once - name, group, usual time,
 * what it is. Branches tick the ones they offer (POS > Setting > Huduma) and
 * add only their own price.
 */
@Component({
  selector: 'app-service-catalog',
  imports: [CommonModule, FormsModule, MatIconModule, TranslatePipe],
  templateUrl: './service-catalog.html',
  styleUrl: './service-catalog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceCatalog implements OnInit {
  readonly items = signal<CatalogService[]>([]);
  readonly loading = signal(false);
  readonly search = signal('');
  readonly form = signal<CatalogService | null>(null);
  readonly saving = signal(false);
  readonly error = signal('');

  /** ROOT and DIRECTOR keep the list; STAFF only reads it. */
  readonly canEdit: boolean;

  readonly shown = computed(() => {
    const q = this.search().trim().toLowerCase();
    if (!q) return this.items();
    return this.items().filter((c) => [c.name, c.category, c.description].some((v) => (v || '').toLowerCase().includes(q)));
  });

  constructor(private api: ServiceCatalogApi, private dialog: MatDialog, private translate: TranslateService, auth: Authentication) {
    this.canEdit = ['ROOT', 'DIRECTOR'].some((r) => auth.hasRole(r));
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.items().subscribe({
      next: (r) => { this.items.set(r.data || []); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  add(): void {
    this.error.set('');
    this.form.set({ name: '', category: '', description: '', duration: 30 });
  }

  edit(c: CatalogService): void {
    this.error.set('');
    this.form.set({ ...c });
  }

  cancel(): void {
    this.form.set(null);
  }

  patch(field: keyof CatalogService, value: any): void {
    const f = this.form();
    if (f) this.form.set({ ...f, [field]: value });
  }

  save(): void {
    const f = this.form();
    if (!f || this.saving()) return;
    if (!f.name?.trim()) {
      this.error.set(this.translate.instant('SERVICE_CATALOG.NAME_REQUIRED'));
      return;
    }
    this.saving.set(true);
    this.api.save({ ...f, duration: f.duration === null || (f.duration as any) === '' ? null : Number(f.duration) }).subscribe({
      next: (r) => {
        this.saving.set(false);
        if (r.data) {
          this.form.set(null);
          this.load();
        } else {
          this.error.set(r.message || '');
        }
      },
      error: () => this.saving.set(false),
    });
  }

  remove(c: CatalogService): void {
    this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '450px',
      data: {
        title: this.translate.instant('SERVICE_CATALOG.DELETE_TITLE'),
        message: this.translate.instant('SERVICE_CATALOG.DELETE_TEXT'),
        item: { branchName: c.name, branchCode: '' },
      },
    }).afterClosed().subscribe((ok) => {
      if (ok && c.uid) this.api.remove(c.uid).subscribe(() => this.load());
    });
  }
}
