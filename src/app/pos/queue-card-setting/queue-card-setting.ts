import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AlertService } from '../../Utils/services/alert';
import { QueueLoyaltyService, QueueSettingsView } from '../queue-loyalty-service';
import { tvLink } from '../../Utils/services/print-door-card';
import { ShowcaseService } from '../showcase-service';

/**
 * POS Setting > Kadi & TV (CEO): the customer-card reward rule, and the
 * salon TV's offer line + the stylists' weekly bonus (TV & Mashindano).
 * The door-QR queue card was taken out 2026-11-14 (owner chose the services
 * QR inside the salon - POS Setting > QR ya Huduma).
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
  private alert = inject(AlertService);
  private translate = inject(TranslateService);
  private showcase = inject(ShowcaseService);

  settings = signal<QueueSettingsView | null>(null);
  tv = signal('');

  show_ = { tvOffer: '', weeklyBonus: 0 };
  showLoaded = signal(false);
  savingShow = signal(false);

  rule = { enabled: false, visitsNeeded: 10, rewardAmount: 5000, minBill: 0 };
  ruleLoaded = signal(false);
  savingRule = signal(false);

  ngOnInit(): void {
    this.showcase.settings().subscribe({
      next: (r) => {
        this.show_ = { tvOffer: r.data?.tvOffer ?? '', weeklyBonus: Number(r.data?.weeklyBonus ?? 0) };
        this.showLoaded.set(true);
      },
      error: () => this.showLoaded.set(true),
    });
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
    this.tv.set(s ? tvLink(s.token) : '');
  }

  saveShowcase(): void {
    this.savingShow.set(true);
    this.showcase
      .saveSettings({ tvOffer: (this.show_.tvOffer ?? '').trim(), weeklyBonus: Math.max(0, Number(this.show_.weeklyBonus) || 0) })
      .subscribe({
        next: (r) => {
          this.savingShow.set(false);
          if (r.data) {
            this.show_ = { tvOffer: r.data.tvOffer ?? '', weeklyBonus: Number(r.data.weeklyBonus ?? 0) };
          }
          this.alert.show('success', this.translate.instant('TV_SETTING.SAVED'));
        },
        error: () => this.savingShow.set(false),
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


}
