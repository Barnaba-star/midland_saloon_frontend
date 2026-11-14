import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef
} from '@angular/material/dialog';

import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { CustomerStylePhotos } from '../../../pos/customer-style-photos/customer-style-photos';

@Component({
  selector: 'app-sale-details-dialog-component',

  imports: [
    MatIcon,
    FormsModule, DecimalPipe, TranslatePipe, CustomerStylePhotos
  ],

  templateUrl: './sale-details-dialog-component.html',
  styleUrl: './sale-details-dialog-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaleDetailsDialogComponent {

  constructor(
    private dialogRef:
      MatDialogRef<SaleDetailsDialogComponent>,

    @Inject(MAT_DIALOG_DATA)
    public data: {
      sale: any;
      services: any[];
      showPayment: boolean;
    }
  ) {}


  selectedPaymentMethod = '';


  /** Payment status word on screen; an unknown status shows as sent. */
  statusLabel(status: string | null | undefined): string {
    const s = String(status || 'PENDING').toUpperCase();
    return ['PAID', 'PENDING', 'UNPAID', 'PARTIAL'].includes(s) ? 'UTIL_T.STATUS.' + s : s;
  }


  close() {
    this.dialogRef.close();
  }


  getTotal(): number {

    return this.data.services.reduce(
      (total, service) =>
        total + Number(service.price || 0),
      0
    );

  }


  /** The customer's reward taken off this bill (loyalty discount). */
  discount(): number {
    return Number(this.data.sale?.loyaltyDiscount ?? 0);
  }

  /** What the customer pays: the services less their reward. */
  toPay(): number {
    return Math.max(0, this.getTotal() - this.discount());
  }


  selectPaymentMethod(method: string) {

    this.selectedPaymentMethod = method;

  }


  confirmPayment() {

    if (!this.selectedPaymentMethod) {
      return;
    }

    this.dialogRef.close({
      action: 'PAYMENT',
      paymentMethod: this.selectedPaymentMethod
    });

  }

}
