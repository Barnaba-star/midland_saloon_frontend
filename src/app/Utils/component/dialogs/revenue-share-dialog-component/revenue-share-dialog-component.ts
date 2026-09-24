import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { PaymentService, RevenueShareDTO } from '../../../../settings/payment-setting/payment-service';

/** One line of the split: what it is called, its share, and what that comes to. */
interface ShareRow {
  label: string;
  amount: number;
  color: string;
  /** Already-built text like "10%" or "10% x 3"; empty for running costs. */
  percentText: string;
  /** Running costs are the remainder, so they sit apart from the three shares. */
  remainder: boolean;
}

@Component({
  selector: 'app-revenue-share-dialog-component',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, TranslatePipe],
  templateUrl: './revenue-share-dialog-component.html',
  styleUrl: './revenue-share-dialog-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RevenueShareDialogComponent implements OnInit {

  share: RevenueShareDTO | null = null;
  rows: ShareRow[] = [];
  isLoading = false;

  /** Built from year and month so the date pipe can name the month. */
  monthDate: Date | null = null;

  constructor(
    public dialogRef: MatDialogRef<RevenueShareDialogComponent>,
    private paymentService: PaymentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    // No year or month: the backend answers for the month we are in.
    this.paymentService.findRevenueShare().subscribe({
      next: (response) => {
        this.share = response.data ?? null;
        this.rows = this.buildRows(this.share);
        this.monthDate = this.share
          ? new Date(this.share.year, Math.max(0, (this.share.month || 1) - 1), 1)
          : null;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        // The interceptor already said what went wrong.
        this.share = null;
        this.rows = [];
        this.monthDate = null;
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private buildRows(share: RevenueShareDTO | null): ShareRow[] {
    if (!share) {
      return [];
    }
    return [
      {
        label: 'REVENUE_SHARE_DIALOG.STAFF',
        amount: share.staffAmount || 0,
        color: '#2a78d6',
        percentText: `${share.staffPercent}%`,
        remainder: false
      },
      {
        label: 'REVENUE_SHARE_DIALOG.DIRECTORS',
        amount: share.directorAmount || 0,
        color: '#eb6834',
        percentText: `${share.directorPercent}% × ${share.directorCount}`,
        remainder: false
      },
      {
        label: 'REVENUE_SHARE_DIALOG.ROOT',
        amount: share.rootAmount || 0,
        color: '#1baf7a',
        percentText: `${share.rootPercent}%`,
        remainder: false
      },
      {
        label: 'REVENUE_SHARE_DIALOG.OPERATING',
        amount: share.operatingAmount || 0,
        color: '#94a3b8',
        percentText: '',
        remainder: true
      }
    ];
  }

  /** How wide the little proportion bar should be, capped so it can never overflow. */
  barWidth(amount: number): number {
    const revenue = this.share?.revenue || 0;
    if (revenue <= 0) {
      return 0;
    }
    return Math.min(100, Math.max(0, (amount / revenue) * 100));
  }

  get hasRevenue(): boolean {
    return (this.share?.revenue || 0) > 0;
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
