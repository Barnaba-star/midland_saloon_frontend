import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../Utils/enviroments/environment';

export interface DoorService { uid: string; name: string; price: number; minutes: number; description?: string | null; }
export interface DoorStaff { uid: string; name: string; waiting: number; }
export interface DoorInfo {
  branchName: string;
  enabled: boolean;
  waiting: number;
  services: DoorService[];
  staff: DoorStaff[];
}
export interface TicketView {
  number: number;
  status: 'WAITING' | 'CALLED' | 'SERVING' | 'DONE' | 'LEFT' | 'CANCELLED';
  name: string;
  serviceName: string;
  staffName: string | null;
  branchName: string;
  today: boolean;
  ahead?: number;
  waitMinutes?: number;
}
export interface CardView {
  name: string;
  branchName: string;
  cardToken: string;
  totalVisits: number;
  visitsTowardReward: number;
  visitsNeeded: number;
  rewardsAvailable: number;
  rewardAmount: number;
  ruleOn: boolean;
}
export interface TvPerson { number: number; name: string; staffName: string | null; serviceName: string | null; }
export interface StarStaff { staffUid: string; name: string; clients: number; regulars: number; stars: number; ratings: number; photo: string | null; rank: number; }
export interface TvView {
  branchName: string;
  called: TvPerson[];
  serving: TvPerson[];
  waiting: number;
  next: TvPerson[];
  star: StarStaff | null;
  offer: string | null;
  loyalty: { visitsNeeded: number; rewardAmount: number } | null;
  joinPath: string;
}
export interface StaffBadge { photo?: string | null; stars?: number | null; ratings?: number | null; }
export interface StaffPhoto { uid: string; url: string; caption: string | null; at: string; }
export interface StaffComment { stars: number; comment: string | null; name: string | null; at: string; }
export interface StaffPortfolio {
  uid: string;
  name: string;
  category: string | null;
  photos: StaffPhoto[];
  stars: number;
  ratings: number;
  comments: StaffComment[];
  branchName?: string;
}
export interface RatingState { canRate: boolean; servedBy: string | null; servedByUid: string | null; }
export interface StylePhoto { uid: string; url: string; kind: 'BEFORE' | 'AFTER'; staffName: string | null; note: string | null; billUid: string | null; at: string; }

/** A photo path from the backend (/public/photo/...) as a full address. */
export function photoUrl(path?: string | null): string {
  if (!path) {
    return '';
  }
  return /^https?:\/\//.test(path) ? path : `${environment.baseApiUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}

/**
 * The walk-in's own phone: no app, no login. These calls go straight to the
 * backend (HttpBackend), past every interceptor - no token is sent, no popup
 * shows, and an old login cookie on the phone can never send the guest to
 * /login.
 */
@Injectable({ providedIn: 'root' })
export class PublicApi {
  private http = new HttpClient(inject(HttpBackend));
  private base = `${environment.baseApiUrl}/public`;

  door(token: string): Observable<DoorInfo> {
    return this.http.get<DoorInfo>(`${this.base}/queue/${encodeURIComponent(token)}`);
  }

  join(token: string, body: { name: string; phone: string; serviceUid: string; staffUid: string | null }): Observable<{ ticketToken: string; number: number }> {
    return this.http.post<{ ticketToken: string; number: number }>(`${this.base}/queue/${encodeURIComponent(token)}/join`, body);
  }

  ticket(token: string): Observable<TicketView> {
    return this.http.get<TicketView>(`${this.base}/ticket/${encodeURIComponent(token)}`);
  }

  leave(token: string): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${this.base}/ticket/${encodeURIComponent(token)}/leave`, {});
  }

  card(token: string): Observable<CardView> {
    return this.http.get<CardView>(`${this.base}/card/${encodeURIComponent(token)}`);
  }

  cardPhotos(token: string): Observable<{ photos: StylePhoto[] }> {
    return this.http.get<{ photos: StylePhoto[] }>(`${this.base}/card/${encodeURIComponent(token)}/photos`);
  }

  /** The salon TV: who is called, who is next, the star of the week. */
  tv(token: string): Observable<TvView> {
    return this.http.get<TvView>(`${this.base}/queue/${encodeURIComponent(token)}/tv`);
  }

  /** Photo + stars per stylist, for the join page's stylist choice. */
  staffBadges(token: string): Observable<Record<string, StaffBadge>> {
    return this.http.get<Record<string, StaffBadge>>(`${this.base}/queue/${encodeURIComponent(token)}/staff`);
  }

  staffPortfolio(token: string, staffUid: string): Observable<StaffPortfolio> {
    return this.http.get<StaffPortfolio>(`${this.base}/queue/${encodeURIComponent(token)}/staff/${encodeURIComponent(staffUid)}`);
  }

  rating(ticketToken: string): Observable<RatingState> {
    return this.http.get<RatingState>(`${this.base}/ticket/${encodeURIComponent(ticketToken)}/rating`);
  }

  rate(ticketToken: string, body: { stars: number; comment?: string }): Observable<{ rated: boolean }> {
    return this.http.post<{ rated: boolean }>(`${this.base}/ticket/${encodeURIComponent(ticketToken)}/rate`, body);
  }
}

/** The backend's error code ({code}) or a network failure. */
export function errorCode(err: any): string {
  if (!err || err.status === 0) {
    return 'NETWORK';
  }
  return err?.error?.code || (err.status === 404 ? 'NOT_FOUND' : 'UNKNOWN');
}
