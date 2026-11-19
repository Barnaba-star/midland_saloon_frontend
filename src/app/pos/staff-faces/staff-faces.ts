import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { environment } from '../../Utils/enviroments/environment';
import { LangDatePipe } from '../../Utils/pipes/lang-date.pipe';

interface Face { uid: string; at: string; }
interface StaffRow {
  staffUid: string; name: string; category: string | null; agreed: boolean;
  agreedAt: string | null; agreedBy: string | null; faces: Face[]; ready: boolean;
}
interface FacesData { staff: StaffRow[]; ready: number; total: number; maxFaces: number; goodFaces: number; }

/**
 * Nyuso za wahudumu (owner, 2026-11-19): the team's faces, so the door camera
 * counts customers only. Consent first, then 3-5 pictures. The pictures are
 * private - fetched with the signed-in token, never a public link.
 */
@Component({
  selector: 'app-staff-faces',
  imports: [MatIconModule, TranslatePipe, LangDatePipe],
  templateUrl: './staff-faces.html',
  styleUrl: './staff-faces.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StaffFaces implements OnInit, OnDestroy {
  @Input() canManage = true;

  data: FacesData | null = null;
  open: StaffRow | null = null;
  confirm: 'yes' | 'no' | null = null;
  busy = false;
  failed = false;
  message = '';
  /** face uid -> object URL of the picture (fetched with the token). */
  pics: Record<string, string> = {};

  private readonly api = `${environment.baseApiUrl}/saloon/door/faces`;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.load(); }

  ngOnDestroy(): void {
    Object.values(this.pics).forEach(u => URL.revokeObjectURL(u));
  }

  load(): void {
    this.http.get<{ data: FacesData }>(this.api).subscribe({
      next: (r) => this.take(r.data),
      error: () => { this.failed = true; this.cdr.markForCheck(); },
    });
  }

  private take(d: FacesData): void {
    this.data = d;
    this.failed = false;
    if (this.open) this.open = d.staff.find(s => s.staffUid === this.open!.staffUid) ?? null;
    const keep = new Set(d.staff.flatMap(s => s.faces.map(f => f.uid)));
    for (const uid of Object.keys(this.pics)) {
      if (!keep.has(uid)) { URL.revokeObjectURL(this.pics[uid]); delete this.pics[uid]; }
    }
    if (this.open) this.fetchPics(this.open);
    this.cdr.markForCheck();
  }

  private fetchPics(s: StaffRow): void {
    for (const f of s.faces) {
      if (this.pics[f.uid]) continue;
      this.http.get(`${this.api}/photos/${f.uid}`, { responseType: 'blob' }).subscribe({
        next: (b) => { this.pics = { ...this.pics, [f.uid]: URL.createObjectURL(b) }; this.cdr.markForCheck(); },
        error: () => {},
      });
    }
  }

  pick(s: StaffRow): void {
    this.open = this.open?.staffUid === s.staffUid ? null : s;
    this.confirm = null;
    this.message = '';
    if (this.open) this.fetchPics(this.open);
    this.cdr.markForCheck();
  }

  consent(agreed: boolean): void {
    if (!this.open) return;
    this.busy = true;
    this.http.post<{ data: FacesData }>(`${this.api}/${this.open.staffUid}/consent`, { agreed }).subscribe({
      next: (r) => { this.busy = false; this.confirm = null; this.take(r.data); },
      error: (e) => this.fail(e),
    });
  }

  upload(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file || !this.open) return;
    const form = new FormData();
    form.append('file', file);
    this.busy = true;
    this.message = '';
    this.http.post<{ data: FacesData }>(`${this.api}/${this.open.staffUid}/photos`, form).subscribe({
      next: (r) => { this.busy = false; this.message = 'FACES.SAVED'; this.take(r.data); },
      error: (e) => this.fail(e),
    });
  }

  remove(f: Face): void {
    this.busy = true;
    this.http.post<{ data: FacesData }>(`${this.api}/photos/${f.uid}/remove`, {}).subscribe({
      next: (r) => { this.busy = false; this.take(r.data); },
      error: (e) => this.fail(e),
    });
  }

  private fail(e: { error?: { message?: string } }): void {
    this.busy = false;
    this.message = e?.error?.message ?? 'FACES.FAILED';
    this.cdr.markForCheck();
  }
}
