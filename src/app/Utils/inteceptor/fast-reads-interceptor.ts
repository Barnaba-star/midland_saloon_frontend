import { HttpClient, HttpContext, HttpContextToken, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { EMPTY, Observable, catchError, concat, filter, finalize, from, mergeMap, of, share, tap } from 'rxjs';
import { environment } from '../enviroments/environment';
import { SILENT_REQUEST } from './silent-request';
import { idbGet, idbSet } from '../fast/fast-store';

/**
 * The server is ~0.5 s away (Tanzania -> Railway's edge -> Amsterdam; ported from Hotel 2026-11-11), so
 * every screen used to wait that long for each list. These reads are answered
 * at once from the device's last copy of the same request, and the request
 * goes on quietly (no loader, no popups); when it lands the screen updates.
 *
 * - Only screens whose handler just sets a list belong here: one that opens a
 *   dialog on the answer would open it twice.
 * - A copy saved before this device's last write is not used, so after a sale,
 *   payment or check-in the next screen waits for the server's fresh answer.
 * - The first time a request is ever made there is no copy, and it waits.
 */
const INSTANT_READS: { method: 'GET' | 'POST'; match: RegExp }[] = [
  {
    method: 'GET',
    match: /^\/saloon\/(salesOpenedList|findSaloonServiceList|findSaloonStaffList|findBranchDashboard)$/,
  },
  {
    method: 'GET',
    match: /^\/saloon\/(salesOpenedListByStatus|findRevenueTrend|findCurrentSaloonRevenueReport|findCurrentSaloonRevenueByService|findIncomeExpenses|getStockAndPurchaseByFilter)\/[^/]+$/,
  },
];

/** Paths that write nothing although they are POSTs (reads, sign-in, error reports). */
const NOT_A_WRITE = /^\/(authentication\/|setting\/heartbeat|errorLog|reportClientError)|\/(find|get)[A-Z]/;

const WARM = new HttpContextToken<boolean>(() => false);

const WRITE_KEY = 'saloon-fast-last-write';
let lastWrite = 0;
try {
  lastWrite = Number(globalThis.localStorage?.getItem(WRITE_KEY)) || 0;
} catch {}

/** Same read asked twice at once (page + its dialog, a double tap): one trip, shared. */
const inflight = new Map<string, Observable<HttpEvent<any>>>();

let claimsFor = '';
let claims = '';
/** login + branch from the token, so a copy never shows to another user or branch. */
function who(req: HttpRequest<any>): string {
  const auth = req.headers.get('Authorization') ?? '';
  if (auth !== claimsFor) {
    claimsFor = auth;
    try {
      const p = JSON.parse(atob(auth.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      claims = `${p.sub ?? p.username ?? ''}|${p.branchUID ?? ''}`;
    } catch {
      claims = auth.slice(-24);
    }
  }
  return claims;
}

export function markWrite(): void {
  lastWrite = Date.now();
  try {
    globalThis.localStorage?.setItem(WRITE_KEY, String(lastWrite));
  } catch {}
}

/** Ask for these quietly in the background so the next visit to them is instant. */
export const warmContext = () => new HttpContext().set(SILENT_REQUEST, true).set(WARM, true);

let lastWarm = 0;
/**
 * Fetch the screens the till opens most, quietly, so moving to them is
 * instant. At most once a minute; a 403 for a screen this role lacks is
 * silent and harmless.
 */
export function warmUp(http: HttpClient): void {
  if (Date.now() - lastWarm < 60_000) {
    return;
  }
  lastWarm = Date.now();
  const base = environment.baseApiUrl;
  const paths = [
    '/saloon/salesOpenedList',
    '/saloon/salesOpenedListByStatus/DAY',
    '/saloon/findSaloonServiceList',
    '/saloon/findSaloonStaffList',
  ];
  for (const p of paths) {
    http.get(base + p, { context: warmContext() }).subscribe({ error: () => {} });
  }
}

export const FastReadsInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  if (!isPlatformBrowser(inject(PLATFORM_ID)) || !req.url.startsWith(environment.baseApiUrl)) {
    return next(req);
  }
  const path = req.url.substring(environment.baseApiUrl.length).split('?')[0];
  const instant = req.headers.has('Authorization') && INSTANT_READS.some((r) => r.method === req.method && r.match.test(path));

  if (!instant) {
    if (req.method !== 'GET' && !NOT_A_WRITE.test(path)) {
      // Anything this device changes makes older copies untrustworthy.
      return next(req).pipe(
        tap((ev) => {
          if (ev instanceof HttpResponse) {
            markWrite();
          }
        }),
      );
    }
    return next(req);
  }

  const key = `${who(req)}|${req.method}|${req.urlWithParams}|${req.body == null ? '' : JSON.stringify(req.body)}`;
  const keep = (ev: HttpEvent<any>) => {
    if (ev instanceof HttpResponse && ev.status === 200 && ev.body && (ev.body as any).data !== undefined) {
      idbSet(key, { at: Date.now(), body: ev.body });
    }
  };
  const network = (r: HttpRequest<any>): Observable<HttpEvent<any>> => {
    const shareKey = `${r.context.get(SILENT_REQUEST)}|${key}`;
    let trip = inflight.get(shareKey);
    if (!trip) {
      trip = next(r).pipe(tap(keep), finalize(() => inflight.delete(shareKey)), share());
      inflight.set(shareKey, trip);
    }
    return trip;
  };

  if (req.context.get(WARM)) {
    return network(req);
  }

  return from(idbGet<{ at: number; body: any }>(key)).pipe(
    mergeMap((copy) => {
      if (!copy || copy.at < lastWrite) {
        return network(req);
      }
      // Shown now; the fresh answer follows quietly, and only if it differs.
      const quiet = req.clone({ context: req.context.set(SILENT_REQUEST, true) });
      const was = JSON.stringify(copy.body);
      return concat(
        of(new HttpResponse({ status: 200, url: req.url, body: copy.body })),
        network(quiet).pipe(
          filter((ev) => ev instanceof HttpResponse && JSON.stringify((ev as HttpResponse<any>).body) !== was),
          catchError(() => EMPTY),
        ),
      );
    }),
  );
};
