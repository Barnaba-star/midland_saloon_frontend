import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AlertService } from '../../Utils/services/alert';
import { ComfirmDialogComponent } from '../../Utils/component/comfirm-dialog/comfirm-dialog';
import { QueueLoyaltyService, QueueSettingsView } from '../queue-loyalty-service';
import { doorLink, printDoorCard } from '../../Utils/services/print-door-card';
import { qrDataUrl } from '../../Utils/services/qr';

/**
 * POS Setting > Foleni & Kadi (CEO): the branch's door QR card (print, a new
 * one, on/off, the "your turn" SMS) and the customer-card reward rule.
 */
@Component({
  selector: 'app-queue-card-setting',
  imports: [FormsModule, MatIconModule, MatSlideToggleModule, TranslatePipe],
  templateUrl: './queue-card-setting.html',
  styleUrl: './queue-card-setting.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QueueCardSetting implements OnInit {
  private api = inject(QueueLoyaltyService);
  private dialog = inject(MatDialog);
  private alert = inject(AlertService);
  private translate = inject(TranslateService);

  settings = signal<QueueSettingsView | null>(null);
  qr = signal('');
  link = signal('');
  saving = signal(false);

  rule = { enabled: false, visitsNeeded: 10, rewardAmount: 5000, minBill: 0 };
  ruleLoaded = signal(false);
  savingRule = signal(false);

  ngOnInit(): void {
    this.api.settings().subscribe({ next: (r) => this.show(r.data), error: () => {} });
    this.api.rule().subscribe({
      next: (r) => {
        if (r.data) {
          this.rule = {
            enabled: !!r.data.enabled,
            visitsNeeded: r.data.visitsNeeded ?? 10,
            rewardAmount: r.data.rewardAmount ?? 5000,
            minBill: r.data.minBill ?? 0,
          };
        }
        this.ruleLoaded.set(true);
      },
      error: () => this.ruleLoaded.set(true),
    });
  }

  private show(s: QueueSettingsView | null): void {
    this.settings.set(s);
    if (!s) {
      return;
    }
    const l = doorLink(s.token);
    this.link.set(l);
    qrDataUrl(l, 480).then((u) => this.qr.set(u)).catch(() => this.qr.set(''));
  }

  toggle(field: 'enabled' | 'smsOn', value: boolean): void {
    this.save({ [field]: value });
  }

  newCard(): void {
    this.dialog
      .open(ComfirmDialogComponent, {
        width: '440px',
        maxWidth: '95vw',
        data: {
          title: this.translate.instant('QUEUE_SETTING.NEW_CARD_TITLE'),
          message: this.translate.instant('QUEUE_SETTING.NEW_CARD_CONFIRM'),
          confirmLabel: this.translate.instant('QUEUE_SETTING.NEW_CARD'),
        },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (ok) {
          this.save({ newCard: true }, 'QUEUE_SETTING.NEW_CARD_DONE');
        }
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
      heading: this.translate.instant('QUEUE_SETTING.PRINT_HEADING'),
      hint: this.translate.instant('QUEUE_SETTING.PRINT_HINT'),
    });
  }

  saveRule(): void {
    this.savingRule.set(true);
    this.api
      .saveRule({
        enabled: this.rule.enabled,
        visitsNeeded: Number(this.rule.visitsNeeded) || 0,
        rewardAmount: Number(this.rule.rewardAmount) || 0,
        minBill: Number(this.rule.minBill) || 0,
      })
      .subscribe({
        next: () => {
          this.savingRule.set(false);
          this.alert.show('success', this.translate.instant('QUEUE_SETTING.RULE_SAVED'));
        },
        error: () => this.savingRule.set(false),
      });
  }

  private save(body: { enabled?: boolean; smsOn?: boolean; newCard?: boolean }, done?: string): void {
    this.saving.set(true);
    this.api.saveSettings(body).subscribe({
      next: (r) => {
        this.saving.set(false);
        this.show(r.data);
        if (done) {
          this.alert.show('success', this.translate.instant(done));
        }
      },
      error: () => {
        this.saving.set(false);
        // Put the switch back to what the server holds.
        const s = this.settings();
        this.settings.set(s ? { ...s } : s);
      },
    });
  }
}
