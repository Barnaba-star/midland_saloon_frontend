import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../Utils/enviroments/environment';
import { Response } from '../../Utils/models/responces';

/** One person on the payment schedule. */
export interface PayrollLine {
  uid: string;
  /** ROOT, DIRECTOR or STAFF - how they came to be owed this. */
  role: string;
  name: string;
  phone: string | null;
  /** Not collected anywhere yet; the column appears once it is. */
  accountNumber: string | null;
  earned: number;
  paid: number;
  /** What the bank is being asked to send. */
  toPay: number;
}

export interface Payroll {
  year: number;
  month: number;
  generatedAt: string;
  revenue: number;
  totalToPay: number;
  recipients: number;
  /** A bank needs a number; this says how many are missing one. */
  missingPhone: number;
  lines: PayrollLine[];
}

@Injectable({ providedIn: 'root' })
export class PayrollService {

  constructor(private http: HttpClient) {}

  private readonly paymentUrl = `${environment.baseApiUrl}/payment`;

  /** Both parts are optional; leaving them out asks for the current month. */
  findPayroll(year?: number, month?: number): Observable<Response<Payroll>> {
    let params = new HttpParams();
    if (year != null) {
      params = params.set('year', year);
    }
    if (month != null) {
      params = params.set('month', month);
    }
    return this.http.get<Response<Payroll>>(`${this.paymentUrl}/findPayroll`, { params });
  }
}
