import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../Utils/enviroments/environment';
import { PageableParam, Response, ResponseList, ResponsePage } from '../../Utils/models/responces';

export interface SubscriptionPayment {
  uid: string;
  createdAt: string;
  paidAt: string;
  amount: number;
  months: number;
  reference: string;
  branchName: string;
  branchCode: string;
  branchUid: string;
  commissionAmount: number;
  commissionPercent: number;
  staffName: string;
  staffUid: string;
}

/** The branch shape the unresolved-payments endpoint returns. */
export interface UnresolvedBranch {
  uid: string;
  branchName: string;
  branchCode: string;
  subscriptionStatus: string;
  pendingPaymentRef: string;
  pendingPaymentAt: string;
  lastPaymentFailure: string;
  subscriptionAmount: number;
  closeSubscription: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {

  private readonly paymentUrl = `${environment.baseApiUrl}/payment`;

  constructor(private http: HttpClient) {}

  findPaymentPage(pageableParam: PageableParam): Observable<ResponsePage<SubscriptionPayment>> {
    return this.http.post<ResponsePage<SubscriptionPayment>>(
      `${this.paymentUrl}/findPaymentPage`,
      pageableParam
    );
  }

  findUnresolvedPayments(): Observable<ResponseList<UnresolvedBranch>> {
    return this.http.get<ResponseList<UnresolvedBranch>>(
      `${this.paymentUrl}/findUnresolvedPayments`
    );
  }

  reconcile(branchUid: string): Observable<Response<string>> {
    return this.http.post<Response<string>>(
      `${this.paymentUrl}/reconcile/${branchUid}`,
      {}
    );
  }

  /** data is null when Snippe can't be reached - the page says so instead of showing 0. */
  findPaymentTotals(): Observable<Response<{ payments: number; totalAmount: number; totalCommission: number; thisMonth: number }>> {
    return this.http.get<Response<{ payments: number; totalAmount: number; totalCommission: number; thisMonth: number }>>(
      `${this.paymentUrl}/findPaymentTotals`
    );
  }

  findBalance(): Observable<Response<number | null>> {
    return this.http.get<Response<number | null>>(`${this.paymentUrl}/findBalance`);
  }
}
