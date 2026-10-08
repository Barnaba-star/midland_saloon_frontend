import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { retry, timer } from 'rxjs';

/**
 * Render's free plan puts the backend to sleep after 15 idle minutes. While
 * it wakes (30-60 s) - or restarts after a deploy - requests come back as a
 * network failure (status 0, "Failed to fetch") or 502/503/504 from Render's
 * proxy. Rather than showing an error straight away, try again quietly a few
 * times with growing waits: 2 s, 4 s, 8 s, 16 s, 30 s (about a minute in all).
 *
 * Only retried when it is safe:
 * - GET (reading) on 0/502/503/504;
 * - anything else only on 502/503 - those come from Render's proxy, so the
 *   request never reached the app and cannot have been saved twice.
 */
const WAITS_MS = [2000, 4000, 8000, 16000, 30000];

export const WakeRetryInterceptor: HttpInterceptorFn = (req, next) => {
  const isRead = req.method === 'GET';
  return next(req).pipe(
    retry({
      count: WAITS_MS.length,
      delay: (error: unknown, attempt: number) => {
        const status = error instanceof HttpErrorResponse ? error.status : -1;
        const proxyNotReady = status === 502 || status === 503;
        const networkDown = status === 0 || status === 504;
        if (proxyNotReady || (isRead && networkDown)) {
          return timer(WAITS_MS[attempt - 1]);
        }
        throw error;
      },
    }),
  );
};
