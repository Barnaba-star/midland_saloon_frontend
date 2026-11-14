import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../Utils/enviroments/environment';
import { Response, ResponseList } from '../../Utils/models/responces';

/** A salon service the main office describes once for every branch (owner, 2026-11-14). */
export interface CatalogService {
  uid?: string;
  name: string;
  category?: string | null;
  description?: string | null;
  duration?: number | null;
}

/** The same service as one branch sees it, with its price there if it offers it. */
export interface BranchCatalogService extends CatalogService {
  uid: string;
  added: boolean;
  serviceUid?: string | null;
  price?: number | null;
  branchDuration?: number | null;
}

export interface CatalogServicePick { catalogUid: string; price: number; duration?: number | null; }
export interface CatalogServicePickResult { catalogUid: string; name?: string; ok: boolean; updated?: boolean; message?: string; }

@Injectable({ providedIn: 'root' })
export class ServiceCatalogApi {
  private readonly url = `${environment.baseApiUrl}/serviceCatalog`;

  constructor(private http: HttpClient) {}

  items(): Observable<ResponseList<CatalogService>> {
    return this.http.get<ResponseList<CatalogService>>(`${this.url}/items`);
  }

  save(item: CatalogService): Observable<Response<CatalogService>> {
    return this.http.post<Response<CatalogService>>(`${this.url}/save`, item);
  }

  remove(uid: string): Observable<Response<CatalogService>> {
    return this.http.post<Response<CatalogService>>(`${this.url}/delete/${uid}`, {});
  }

  forBranch(): Observable<ResponseList<BranchCatalogService>> {
    return this.http.get<ResponseList<BranchCatalogService>>(`${this.url}/forBranch`);
  }

  addToBranch(items: CatalogServicePick[]): Observable<ResponseList<CatalogServicePickResult>> {
    return this.http.post<ResponseList<CatalogServicePickResult>>(`${this.url}/addToBranch`, { items });
  }
}
