import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ShowcaseService } from '../showcase-service';
import { QueueLoyaltyService } from '../queue-loyalty-service';
import { AlertService } from '../../Utils/services/alert';
import { StaffPhoto, StaffPortfolio, photoUrl } from '../../public/public-api';
import { downscaleImage } from '../../Utils/services/downscale-image';

export interface StaffPhotosData {
  staffUid: string;
  name: string;
}

/**
 * Kazi zake: one stylist's work photos. Guests see them on the stylist's
 * public page (/mhudumu/...) and when choosing a stylist at the door.
 */
@Component({
  selector: 'app-staff-photos-dialog',
  imports: [FormsModule, DatePipe, DecimalPipe, MatIconModule, TranslatePipe],
  templateUrl: './staff-photos-dialog.html',
  styleUrl: './staff-photos-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StaffPhotosDialog implements OnInit, OnDestroy {
  private api = inject(ShowcaseService);
  private queue = inject(QueueLoyaltyService);
  private alert = inject(AlertService);
  private translate = inject(TranslateService);
  private ref = inject(MatDialogRef<StaffPhotosDialog>);
  data: StaffPhotosData = inject(MAT_DIALOG_DATA);

  staff = signal<StaffPortfolio | null>(null);
  loaded = signal(false);
  /** The picked photo, made small, waiting for its caption. */
  pending = signal<{ file: File; preview: string } | null>(null);
  caption = '';
  uploading = signal(false);
  confirmRemove = signal<string | null>(null);
  removing = signal<string | null>(null);
  doorToken = signal('');

  photos = computed(() => (this.staff()?.photos ?? []).map((p) => ({ ...p, src: photoUrl(p.url) })));
  comments = computed(() => (this.staff()?.comments ?? []).slice(0, 3));
  full = computed(() => Math.round(this.staff()?.stars ?? 0));
  publicLink = computed(() =>
    this.doorToken() ? `${location.origin}/mhudumu/${this.doorToken()}/${this.data.staffUid}` : '',
  );

  ngOnInit(): void {
    this.load();
    this.queue.settings(true).subscribe({ next: (r) => this.doorToken.set(r.data?.token ?? ''), error: () => {} });
  }

  ngOnDestroy(): void {
    this.clearPending();
  }

  load(): void {
    this.api.staff(this.data.staffUid).subscribe({
      next: (r) => {
        this.staff.set(r.data ?? null);
        this.loaded.set(true);
      },
      error: () => this.loaded.set(true),
    });
  }

  close(): void {
    this.ref.close();
  }

  async picked(ev: Event): Promise<void> {
    const el = ev.target as HTMLInputElement;
    const file = el.files?.[0];
    el.value = '';
    if (!file) {
      return;
    }
    const small = await downscaleImage(file, 1600, 0.8);
    this.clearPending();
    this.caption = '';
    this.pending.set({ file: small, preview: URL.createObjectURL(small) });
  }

  cancel(): void {
    this.clearPending();
  }

  upload(): void {
    const p = this.pending();
    if (!p || this.uploading()) {
      return;
    }
    this.uploading.set(true);
    this.api.addStaffPhoto(this.data.staffUid, p.file, this.caption).subscribe({
      next: () => {
        this.uploading.set(false);
        this.clearPending();
        this.alert.show('success', this.translate.instant('STAFF_PHOTOS.SAVED'));
        this.load();
      },
      error: () => this.uploading.set(false),
    });
  }

  remove(p: StaffPhoto): void {
    if (this.confirmRemove() !== p.uid) {
      this.confirmRemove.set(p.uid);
      return;
    }
    this.removing.set(p.uid);
    this.api.removeStaffPhoto(p.uid).subscribe({
      next: () => {
        this.removing.set(null);
        this.confirmRemove.set(null);
        const s = this.staff();
        if (s) {
          this.staff.set({ ...s, photos: s.photos.filter((x) => x.uid !== p.uid) });
        }
      },
      error: () => {
        this.removing.set(null);
        this.confirmRemove.set(null);
      },
    });
  }

  copyLink(): void {
    const l = this.publicLink();
    if (!l) {
      return;
    }
    navigator.clipboard?.writeText(l).then(
      () => this.alert.show('success', this.translate.instant('QUEUE.LINK_COPIED')),
      () => {},
    );
  }

  private clearPending(): void {
    const p = this.pending();
    if (p) {
      URL.revokeObjectURL(p.preview);
    }
    this.pending.set(null);
  }
}
