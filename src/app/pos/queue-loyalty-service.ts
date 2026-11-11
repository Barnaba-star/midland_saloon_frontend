import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../Utils/enviroments/environment';
import { silent } from '../Utils/inteceptor/silent-request';

export interface QueueTicketRow {
  uid: string;
  number: number;
  token?: string;
  customerName: string;
  phone: string;
  serviceName: string;
  serviceMinutes: number;
  staffUid: string | null;
  staffName: string | null;
  status: 'WAITING' | 'CALLED' | 'SERVING';
  joinedAt: string;
  calledAt: string | null;
  salesOpenedUid: string | null;
  smsSent: boolean;
}

export interface QueueSettingsView {
  token: string;
  link: string;
  enabled: boolean;
  smsOn: boolean;
  branchName: string;
}

export interface LoyaltyRuleView {
  enabled: boolean;
  visitsNeeded: number;
  rewardAmount: number;
  minBill: number;
}

export interface LoyaltyCustomer {
  uid: string;
  name: string;
  phone: string;
  totalVisits: number;
  visitsTowardReward: number;
  visitsNeeded: number;
  rewardsAvailable: number;
  rewardAmount: number;
  ruleOn: boolean;
  cardLink: string;
}

export interface BillLoyalty {
  uid: string;
  bill: number;
  customerUid: string | null;
  customerName: string | null;
  loyaltyDiscount: number;
  toPay: number;
}

/** The door queue board and the customer card, for the till. */
@Injectable({ providedIn: 'root' })
export class QueueLoyaltyService {
  private http = inject(HttpClient);
  private url = `${environment.baseApiUrl}/saloon`;

  board(quiet = false): Observable<{ data: QueueTicketRow[] }> {
    return this.http.get<{ data: QueueTicketRow[] }>(`${this.url}/queue/board`, quiet ? { context: silent() } : {});
  }
  call(uid: string): Observable<{ data: QueueTicketRow }> {
    return this.http.post<{ data: QueueTicketRow }>(`${this.url}/queue/${uid}/call`, {});
  }
  start(uid: string): Observable<{ data: any }> {
    return this.http.post<{ data: any }>(`${this.url}/queue/${uid}/start`, {});
  }
  left(uid: string): Observable<{ data: any }> {
    return this.http.post<{ data: any }>(`${this.url}/queue/${uid}/left`, {});
  }

  settings(): Observable<{ data: QueueSettingsView }> {
    return this.http.get<{ data: QueueSettingsView }>(`${this.url}/queue/settings`);
  }
  saveSettings(body: { enabled?: boolean; smsOn?: boolean; newCard?: boolean }): Observable<{ data: QueueSettingsView }> {
    return this.http.post<{ data: QueueSettingsView }>(`${this.url}/queue/settings`, body);
  }

  rule(): Observable<{ data: LoyaltyRuleView }> {
    return this.http.get<{ data: LoyaltyRuleView }>(`${this.url}/loyalty/rule`);
  }
  saveRule(body: LoyaltyRuleView): Observable<{ data: LoyaltyRuleView }> {
    return this.http.post<{ data: LoyaltyRuleView }>(`${this.url}/loyalty/rule`, body);
  }

  find(query: string): Observable<{ found: boolean; data?: LoyaltyCustomer }> {
    return this.http.post<{ found: boolean; data?: LoyaltyCustomer }>(`${this.url}/loyalty/find`, { query });
  }
  register(name: string, phone: string): Observable<{ data: LoyaltyCustomer }> {
    return this.http.post<{ data: LoyaltyCustomer }>(`${this.url}/loyalty/register`, { name, phone });
  }
  attach(billUid: string, customerUid: string): Observable<{ data: BillLoyalty }> {
    return this.http.post<{ data: BillLoyalty }>(`${this.url}/loyalty/bill/${billUid}/customer/${customerUid}`, {});
  }
  useReward(billUid: string): Observable<{ data: BillLoyalty }> {
    return this.http.post<{ data: BillLoyalty }>(`${this.url}/loyalty/bill/${billUid}/useReward`, {});
  }
  removeReward(billUid: string): Observable<{ data: BillLoyalty }> {
    return this.http.post<{ data: BillLoyalty }>(`${this.url}/loyalty/bill/${billUid}/removeReward`, {});
  }
}
