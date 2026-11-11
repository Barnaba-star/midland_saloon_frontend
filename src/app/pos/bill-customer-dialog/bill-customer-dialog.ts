import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { BillLoyalty, LoyaltyCustomer, QueueLoyaltyService } from '../queue-loyalty-service';

export interface BillCustomerData {
  sale: { uid: string; salesCode?: string; bill?: number; customerUid?: string | null; customerName?: string | null; loyaltyDiscount?: number | null };
  /** The customer already on this bill, if this device looked them up before. */
  known?: LoyaltyCustomer | null;
  /** Every change made here goes back to the Sales page at once. */
  onChange: (bill: BillLoyalty, customer: LoyaltyCustomer | null) => void;
}

type View = 'current' | 'search' | 'found' | 'register';

/**
 * Mteja: put a customer (their card) on an open bill - scan the card QR with
 * the camera, or type the phone; not known yet - register. Then the reward,
 * when they have one, comes off the bill.
 */
@Component({
  selector: 'app-bill-customer-dialog',
  imports: [FormsModule, DecimalPipe, MatIconModule, TranslatePipe],
  templateUrl: './bill-customer-dialog.html',
  styleUrl: './bill-customer-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillCustomerDialog implements OnInit, OnDestroy {
  private api = inject(QueueLoyaltyService);
  private ref = inject(MatDialogRef<BillCustomerDialog>);
  data: BillCustomerData = inject(MAT_DIALOG_DATA);

  view = signal<View>('search');
  busy = signal(false);
  notFound = signal(false);
  customer = signal<LoyaltyCustomer | null>(null);
  billName = signal<string | null>(null);
  discount = signal(0);

  query = '';
  regName = '';
  regPhone = '';

  /** Camera scanning works where the browser has BarcodeDetector (Chrome on Android). */
  canScan = typeof window !== 'undefined' && 'BarcodeDetector' in window && !!navigator.mediaDevices?.getUserMedia;
  scanning = signal(false);
  scanError = signal(false);
  private video = viewChild<ElementRef<HTMLVideoElement>>('video');
  private stream: MediaStream | null = null;
  private scanTimer: any = null;

  ngOnInit(): void {
    const s = this.data.sale;
    this.billName.set(s.customerName ?? null);
    this.discount.set(Number(s.loyaltyDiscount ?? 0));
    if (s.customerUid) {
      this.customer.set(this.data.known && this.data.known.uid === s.customerUid ? this.data.known : null);
      this.view.set('current');
    }
  }

  ngOnDestroy(): void {
    this.stopScan();
  }

  close(): void {
    this.ref.close();
  }

  change(): void {
    this.query = '';
    this.notFound.set(false);
    this.view.set('search');
  }

  find(q = this.query): void {
    const query = (q ?? '').trim();
    if (!query || this.busy()) {
      return;
    }
    this.busy.set(true);
    this.notFound.set(false);
    this.api.find(query).subscribe({
      next: (r) => {
        this.busy.set(false);
        if (r.found && r.data) {
          this.customer.set(r.data);
          this.view.set('found');
        } else {
          this.notFound.set(true);
          // A typed phone is carried into the register form.
          this.regPhone = /^[+\d\s-]+$/.test(query) ? query : '';
        }
      },
      error: () => this.busy.set(false),
    });
  }

  openRegister(): void {
    this.view.set('register');
  }

  register(): void {
    if (!this.regName.trim() || !this.regPhone.trim() || this.busy()) {
      return;
    }
    this.busy.set(true);
    this.api.register(this.regName.trim(), this.regPhone.trim()).subscribe({
      next: (r) => {
        this.busy.set(false);
        this.customer.set(r.data);
        this.attach();
      },
      error: () => this.busy.set(false),
    });
  }

  attach(): void {
    const c = this.customer();
    if (!c || this.busy()) {
      return;
    }
    this.busy.set(true);
    this.api.attach(this.data.sale.uid, c.uid).subscribe({
      next: (r) => this.applied(r.data, c),
      error: () => this.busy.set(false),
    });
  }

  useReward(): void {
    if (this.busy()) {
      return;
    }
    this.busy.set(true);
    this.api.useReward(this.data.sale.uid).subscribe({
      next: (r) => {
        const c = this.customer();
        const after = c && (r.data?.loyaltyDiscount ?? 0) > this.discount() ? { ...c, rewardsAvailable: Math.max(0, c.rewardsAvailable - 1) } : c;
        this.applied(r.data, after);
      },
      error: () => this.busy.set(false),
    });
  }

  removeReward(): void {
    if (this.busy()) {
      return;
    }
    this.busy.set(true);
    this.api.removeReward(this.data.sale.uid).subscribe({
      next: (r) => {
        const c = this.customer();
        const after = c && this.discount() > 0 ? { ...c, rewardsAvailable: c.rewardsAvailable + 1 } : c;
        this.applied(r.data, after);
      },
      error: () => this.busy.set(false),
    });
  }

  private applied(bill: BillLoyalty, c: LoyaltyCustomer | null): void {
    this.busy.set(false);
    this.customer.set(c);
    this.billName.set(bill?.customerName ?? c?.name ?? null);
    this.discount.set(Number(bill?.loyaltyDiscount ?? 0));
    this.view.set('current');
    this.data.onChange(bill, c);
  }

  // ------------------------------------------------------------- camera

  async startScan(): Promise<void> {
    if (!this.canScan || this.scanning()) {
      return;
    }
    this.scanError.set(false);
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
    } catch {
      this.scanError.set(true);
      return;
    }
    this.scanning.set(true);
    // The <video> appears with scanning(); wait a tick for it.
    setTimeout(() => {
      const el = this.video()?.nativeElement;
      if (!el || !this.stream) {
        this.stopScan();
        return;
      }
      el.srcObject = this.stream;
      el.play().catch(() => {});
      const Detector = (window as any).BarcodeDetector;
      const detector = new Detector({ formats: ['qr_code'] });
      this.scanTimer = setInterval(async () => {
        if (el.readyState < 2) {
          return;
        }
        try {
          const codes = await detector.detect(el);
          const raw = codes?.[0]?.rawValue;
          if (raw) {
            this.stopScan();
            this.query = raw;
            this.find(raw);
          }
        } catch {}
      }, 300);
    });
  }

  stopScan(): void {
    clearInterval(this.scanTimer);
    this.scanTimer = null;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.scanning.set(false);
  }
}
