import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../Utils/enviroments/environment';
import { StaffPhoto, StaffPortfolio, StylePhoto } from '../public/public-api';

export interface BoardRow {
  rank: number;
  staffUid: string;
  name: string;
  clients: number;
  regulars: number;
  stars: number;
  ratings: number;
  photo: string | null;
  score: number;
}

export interface WeeklyBoard {
  weekStart: string;
  weekEnd: string;
  bonus: number | null;
  rows: BoardRow[];
}

export interface ShowcaseSettings {
  tvOffer: string | null;
  weeklyBonus: number | null;
}

/** Stylists' work photos, customers' style photos, the weekly board, the TV line. */
@Injectable({ providedIn: 'root' })
export class ShowcaseService {
  private http = inject(HttpClient);
  private url = `${environment.baseApiUrl}/saloon/showcase`;

  staff(staffUid: string): Observable<{ data: StaffPortfolio }> {
    return this.http.get<{ data: StaffPortfolio }>(`${this.url}/staff/${staffUid}`);
  }
  addStaffPhoto(staffUid: string, file: File, caption?: string): Observable<{ data: StaffPhoto }> {
    const form = new FormData();
    form.append('file', file, file.name);
    if (caption?.trim()) {
      form.append('caption', caption.trim());
    }
    return this.http.post<{ data: StaffPhoto }>(`${this.url}/staff/${staffUid}/photos`, form);
  }
  removeStaffPhoto(uid: string): Observable<any> {
    return this.http.post(`${this.url}/staff/photos/${uid}/remove`, {});
  }

  customerPhotos(customerUid: string): Observable<{ data: StylePhoto[] }> {
    return this.http.get<{ data: StylePhoto[] }>(`${this.url}/customer/${customerUid}/photos`);
  }
  addCustomerPhoto(
    customerUid: string,
    file: File,
    kind: 'BEFORE' | 'AFTER',
    extra: { billUid?: string | null; staffUid?: string | null; note?: string | null } = {},
  ): Observable<{ data: StylePhoto }> {
    const form = new FormData();
    form.append('file', file, file.name);
    form.append('kind', kind);
    if (extra.billUid) {
      form.append('billUid', extra.billUid);
    }
    if (extra.staffUid) {
      form.append('staffUid', extra.staffUid);
    }
    if (extra.note?.trim()) {
      form.append('note', extra.note.trim());
    }
    return this.http.post<{ data: StylePhoto }>(`${this.url}/customer/${customerUid}/photos`, form);
  }
  removeCustomerPhoto(uid: string): Observable<any> {
    return this.http.post(`${this.url}/customer/photos/${uid}/remove`, {});
  }

  board(weeksBack: number): Observable<{ data: WeeklyBoard }> {
    return this.http.get<{ data: WeeklyBoard }>(`${this.url}/leaderboard`, { params: { weeksBack } });
  }

  settings(): Observable<{ data: ShowcaseSettings }> {
    return this.http.get<{ data: ShowcaseSettings }>(`${this.url}/settings`);
  }
  saveSettings(body: ShowcaseSettings): Observable<{ data: ShowcaseSettings }> {
    return this.http.post<{ data: ShowcaseSettings }>(`${this.url}/settings`, body);
  }
}
