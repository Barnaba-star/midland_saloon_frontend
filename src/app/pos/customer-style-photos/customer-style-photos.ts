import { ChangeDetectionStrategy, Component, OnChanges, SimpleChanges, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ShowcaseService } from '../showcase-service';
import { ServiceSaloonMethod } from '../service-saloon-method';
import { AlertService } from '../../Utils/services/alert';
import { StylePhoto, photoUrl } from '../../public/public-api';
import { downscaleImage } from '../../Utils/services/downscale-image';

interface StaffOption {
  uid: string;
  name: string;
}

/**
 * Picha za mtindo: the customer's before/after photos, taken at the till
 * (phone camera or a picked file, made small first). A photo taken on a bill
 * carries that bill and its stylist, and shows on the customer's own card.
 */
@Component({
  selector: 'app-customer-style-photos',
  imports: [FormsModule, DatePipe, MatIconModule, TranslatePipe],
  templateUrl: './customer-style-photos.html',
  styleUrl: './customer-style-photos.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerStylePhotos implements OnChanges {
  private api = inject(ShowcaseService);
  private saloon = inject(ServiceSaloonMethod);
  private alert = inject(AlertService);
  private translate = inject(TranslateService);

  customerUid = input.required<string>();
  /** The bill the photo is taken on, if any. */
  billUid = input<string | null>(null);

  photos = signal<(StylePhoto & { src: string })[]>([]);
  loaded = signal(false);
  staff = signal<StaffOption[]>([]);
  kind = signal<'BEFORE' | 'AFTER'>('AFTER');
  staffUid = signal('');
  uploading = signal(false);
  removing = signal<string | null>(null);
  confirmRemove = signal<string | null>(null);
  open = signal<(StylePhoto & { src: string }) | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customerUid'] && this.customerUid()) {
      this.load();
    }
    if (changes['billUid'] || (changes['customerUid'] && !this.staff().length)) {
      this.loadStaff();
    }
  }

  load(): void {
    this.api.customerPhotos(this.customerUid()).subscribe({
      next: (r) => {
        const list = [...(r.data ?? [])]
          .sort((a, b) => (b.at ?? '').localeCompare(a.at ?? ''))
          .map((p) => ({ ...p, src: photoUrl(p.url) }));
        this.photos.set(list);
        this.loaded.set(true);
      },
      error: () => this.loaded.set(true),
    });
  }

  /** The stylists to choose from; the bill's own stylist comes picked. */
  private loadStaff(): void {
    const bill = this.billUid();
    forkJoin({
      staff: this.saloon.findSaloonStaffList().pipe(catchError(() => of({ data: [] } as any))),
      lines: bill ? this.saloon.findSaloonSalesList(bill).pipe(catchError(() => of({ data: [] } as any))) : of({ data: [] } as any),
    }).subscribe(({ staff, lines }) => {
      const options: StaffOption[] = ((staff as any)?.data ?? [])
        .filter((s: any) => s?.uid)
        .map((s: any) => ({ uid: s.uid, name: [s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ') }));
      this.staff.set(options);
      if (!this.staffUid()) {
        const line = ((lines as any)?.data ?? []).find((l: any) => l?.firstName);
        if (line) {
          const first = String(line.firstName).toLowerCase();
          const last = String(line.lastName ?? '').toLowerCase();
          const match = ((staff as any)?.data ?? []).find(
            (s: any) => String(s.firstName ?? '').toLowerCase() === first && String(s.lastName ?? '').toLowerCase() === last,
          );
          this.staffUid.set(match?.uid ?? '');
        }
      }
    });
  }

  async picked(ev: Event): Promise<void> {
    const el = ev.target as HTMLInputElement;
    const file = el.files?.[0];
    el.value = '';
    if (!file || this.uploading()) {
      return;
    }
    this.uploading.set(true);
    const small = await downscaleImage(file, 1600, 0.8);
    this.api
      .addCustomerPhoto(this.customerUid(), small, this.kind(), { billUid: this.billUid(), staffUid: this.staffUid() || null })
      .subscribe({
        next: () => {
          this.uploading.set(false);
          this.alert.show('success', this.translate.instant('STYLES.SAVED'));
          this.load();
        },
        error: () => this.uploading.set(false),
      });
  }

  remove(p: StylePhoto): void {
    if (this.confirmRemove() !== p.uid) {
      this.confirmRemove.set(p.uid);
      return;
    }
    this.removing.set(p.uid);
    this.api.removeCustomerPhoto(p.uid).subscribe({
      next: () => {
        this.removing.set(null);
        this.confirmRemove.set(null);
        this.photos.update((list) => list.filter((x) => x.uid !== p.uid));
      },
      error: () => {
        this.removing.set(null);
        this.confirmRemove.set(null);
      },
    });
  }
}
