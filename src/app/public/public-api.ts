import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../Utils/enviroments/environment';

export interface DoorService { uid: string; name: string; price: number; minutes: number; }
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
}

/** The backend's error code ({code}) or a network failure. */
export function errorCode(err: any): string {
  if (!err || err.status === 0) {
    return 'NETWORK';
  }
  return err?.error?.code || (err.status === 404 ? 'NOT_FOUND' : 'UNKNOWN');
}
