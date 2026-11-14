import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ComfirmDialogComponent } from '../../Utils/component/comfirm-dialog/comfirm-dialog';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { QueueLoyaltyService, QueueSettingsView } from '../queue-loyalty-service';
import { printDoorCard, servicesLink } from '../../Utils/services/print-door-card';
import { qrDataUrl } from '../../Utils/services/qr';
import { AlertService } from '../../Utils/services/alert';

/**
 * POS Setting > QR ya Huduma: the branch's services QR to print. A guest scans
 * it and sees the branch's services, prices and stylists (/huduma/TOKEN).
 * "QR mpya" makes a new branch token: the old printed card stops working.
 */
@Component({
  selector: 'app-services-qr-setting',
  imports: [MatIconModule, TranslatePipe],
  templateUrl: './services-qr-setting.html',
  styleUrl: '../queue-card-setting/queue-card-setting.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesQrSetting implements OnInit {
  private api = inject(QueueLoyaltyService);
  private translate = inject(TranslateService);
  private alert = inject(AlertService);
  private dialog = inject(MatDialog);

  settings = signal<QueueSettingsView | null>(null);
  qr = signal('');
  link = signal('');
  loadFailed = signal(false);
  saving = signal(false);

  ngOnInit(): void {
    this.api.settings().subscribe({
      next: (r) => this.show(r.data),
      error: () => this.loadFailed.set(true),
    });
  }

  private show(s: QueueSettingsView | null): void {
    this.settings.set(s);
    if (!s) {
      this.loadFailed.set(true);
      return;
    }
    const l = servicesLink(s.token);
    this.link.set(l);
    qrDataUrl(l, 480).then((u) => this.qr.set(u)).catch(() => this.qr.set(''));
  }

  newCard(): void {
    this.dialog
      .open(ComfirmDialogComponent, {
        width: '440px',
        maxWidth: '95vw',
        data: {
          title: this.translate.instant('SERVICES_QR.NEW_TITLE'),
          message: this.translate.instant('SERVICES_QR.NEW_CONFIRM'),
          confirmLabel: this.translate.instant('SERVICES_QR.NEW'),
        },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (!ok) {
          return;
        }
        this.saving.set(true);
        this.api.saveSettings({ newCard: true }).subscribe({
          next: (r) => {
            this.saving.set(false);
            this.show(r.data);
            this.alert.show('success', this.translate.instant('SERVICES_QR.NEW_DONE'));
          },
          error: () => this.saving.set(false),
        });
      });
  }

  print(): void {
    const s = this.settings();
    if (!s) {
      return;
    }
    printDoorCard({
      token: s.token,
      branchName: s.branchName,
      link: this.link(),
      heading: this.translate.instant('SERVICES_QR.PRINT_HEADING'),
      hint: this.translate.instant('SERVICES_QR.PRINT_HINT'),
    });
  }

  copy(): void {
    navigator.clipboard?.writeText(this.link()).then(
      () => this.alert.show('success', this.translate.instant('SERVICES_QR.COPIED')),
      () => {},
    );
  }
}
