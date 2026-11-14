import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { QueueLoyaltyService, QueueSettingsView } from '../queue-loyalty-service';
import { printDoorCard, servicesLink } from '../../Utils/services/print-door-card';
import { qrDataUrl } from '../../Utils/services/qr';
import { AlertService } from '../../Utils/services/alert';

/**
 * POS Setting > QR ya Huduma: the branch's services QR to print. A guest scans
 * it and sees the branch's services, prices and stylists (/huduma/TOKEN).
 * It shares the branch door token, so "Kadi mpya" under Foleni & Kadi also
 * makes this card old.
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

  settings = signal<QueueSettingsView | null>(null);
  qr = signal('');
  link = signal('');
  loadFailed = signal(false);

  ngOnInit(): void {
    this.api.settings().subscribe({
      next: (r) => {
        const s = r.data;
        this.settings.set(s);
        if (!s) {
          this.loadFailed.set(true);
          return;
        }
        const l = servicesLink(s.token);
        this.link.set(l);
        qrDataUrl(l, 480).then((u) => this.qr.set(u)).catch(() => this.qr.set(''));
      },
      error: () => this.loadFailed.set(true),
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
