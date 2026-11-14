import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { environment } from '../../Utils/enviroments/environment';
import { qrDataUrl } from '../../Utils/services/qr';
import { AlertService } from '../../Utils/services/alert';

interface StaffCard { staffUid: string; name: string; token: string; branchName: string; }

/**
 * POS > Watumishi > QR (owner 2026-11-14): a stylist's own commission card.
 * They scan it and see their commission (/kamisheni/TOKEN); print it, copy
 * the link, or make a new one (the old one stops working).
 */
@Component({
  selector: 'app-staff-card-dialog',
  imports: [MatIconModule, TranslatePipe],
  templateUrl: './staff-card-dialog.html',
  styleUrl: './staff-card-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StaffCardDialog {
  private http = inject(HttpClient);
  private ref = inject(MatDialogRef<StaffCardDialog>);
  private translate = inject(TranslateService);
  private alert = inject(AlertService);
  readonly data = inject<{ staffUid: string; name: string }>(MAT_DIALOG_DATA);

  card = signal<StaffCard | null>(null);
  qr = signal('');
  link = signal('');
  busy = signal(false);
  confirmNew = signal(false);

  constructor() {
    this.load(false);
  }

  private load(newCard: boolean): void {
    this.busy.set(true);
    const url = `${environment.baseApiUrl}/saloon/staffCard/${encodeURIComponent(this.data.staffUid)}${newCard ? '/new' : ''}`;
    const req = newCard ? this.http.post<{ data: StaffCard }>(url, {}) : this.http.get<{ data: StaffCard }>(url);
    req.subscribe({
      next: (r) => {
        this.busy.set(false);
        this.confirmNew.set(false);
        this.card.set(r.data);
        const l = `${location.origin}/kamisheni/${r.data.token}`;
        this.link.set(l);
        qrDataUrl(l, 480).then((u) => this.qr.set(u)).catch(() => this.qr.set(''));
        if (newCard) this.alert.show('success', 'STAFF_CARD.NEW_DONE');
      },
      error: () => this.busy.set(false),
    });
  }

  newCard(): void {
    if (!this.confirmNew()) {
      this.confirmNew.set(true);
      return;
    }
    this.load(true);
  }

  copy(): void {
    navigator.clipboard?.writeText(this.link()).then(() => this.alert.show('success', 'SERVICES_QR.COPIED'), () => {});
  }

  /** A small card (fits A6) to hand to the stylist. */
  async print(): Promise<void> {
    const c = this.card();
    if (!c) return;
    const qr = await qrDataUrl(this.link(), 900);
    const esc = (s: string) => String(s ?? '').replace(/[&<>"']/g, (x) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[x]!);
    const logo = `${location.origin}/assets/images/salonix-logo-dark.png`;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(c.name)}</title><style>
      @page { size: A6; margin: 6mm; }
      body { margin: 0; font-family: Inter, Arial, sans-serif; color: #1d1812; text-align: center; }
      .card { border: 2px solid #f5a524; border-radius: 12px; padding: 6mm 4mm; }
      .logo { height: 11mm; } h1 { margin: 3mm 0 1mm; font-size: 17pt; } .qr { width: 62mm; height: 62mm; }
      p { margin: 1mm 0; font-size: 10pt; color: #6b4f33; } .branch { font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #1d1812; }
    </style></head><body><div class="card"><img class="logo" src="${esc(logo)}" alt=""><h1>${esc(c.name)}</h1>
      <img class="qr" src="${qr}" alt="QR"><p>${esc(this.translate.instant('STAFF_CARD.PRINT_HINT'))}</p><p class="branch">${esc(c.branchName)}</p></div></body></html>`;
    const frame = document.createElement('iframe');
    frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
    document.body.appendChild(frame);
    const doc = frame.contentWindow!.document;
    doc.open(); doc.write(html); doc.close();
    await Promise.all(Array.from(doc.images).map((img) => (img.complete ? Promise.resolve() : new Promise<void>((d) => { img.onload = img.onerror = () => d(); }))));
    frame.contentWindow!.focus();
    frame.contentWindow!.print();
    setTimeout(() => frame.remove(), 60_000);
  }

  close(): void {
    this.ref.close();
  }
}
