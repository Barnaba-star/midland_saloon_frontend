import { SILENT_REQUEST } from './silent-request';
import {
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';

import { Injector, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import {
  StatusDialogComponent,
  StatusDialogData
} from '../component/status-dialog/status-dialog';

import { tap } from 'rxjs';

import { ErrorLogService } from '../services/error-log-service';
import { TranslateService } from '@ngx-translate/core';
import { translateServerMessage } from '../services/server-message';

/** The body as it was about to be sent, so a failure can be traced back to it. */
const serialiseBody = (body: unknown): string | undefined => {
  if (body === null || body === undefined) {
    return undefined;
  }
  if (typeof body === 'string') {
    return body;
  }
  // FormData and Blob carry file bytes - not worth sending, not readable anyway.
  if (body instanceof FormData || body instanceof Blob) {
    return '[binary body]';
  }
  try {
    return JSON.stringify(body);
  } catch {
    return undefined;
  }
};

export const StatusInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
) => {

  const dialog = inject(MatDialog);
  const errorLogService = inject(ErrorLogService);
  const router = inject(Router);
  // TranslateService loads its JSON through HttpClient, i.e. through this
  // interceptor: injecting it up front is a circular dependency. Look it up
  // only when a message is shown (by then it exists).
  const injector = inject(Injector);
  // Backend wording (or an SRV_MSG key) in the chosen language.
  const say = (msg: string) => translateServerMessage(msg, injector.get(TranslateService));

  /*
   * ============================================================
   * 1. IGNORE SPECIFIC REQUESTS
   * ============================================================
   *
   * Profile image inaweza kurudisha 401 lakini haipaswi
   * kuzuia page kuendelea au kuonyesha error dialog.
   */

  if (req.url.includes('/attachment/findUserForProfile')) {
    return next(req);
  }

  /*
   * Uploaded pictures (profile photo, logo): a missing one just shows the
   * default. On Render's free plan uploads live in /tmp and every deploy
   * clears them, so a stored name can point at a file that is gone - that
   * must not pop up "Resource not found".
   */
  if (req.url.includes('/uploads/')) {
    return next(req);
  }

  // The shift bar's own calls show their state in the bar, never a popup.
  if (req.url.includes('/shift/current')) {
    return next(req);
  }

  /*
   * Screens that say things in their own words.
   *
   * This covers both directions. The backend answers these in codes - EMPTY,
   * NOT_ALLOWED, SENT - which are for the screen to translate, not for a
   * dialog to show raw. A 200 carrying one of those in `message` was popping
   * it up as though it were news.
   *
   * The login screen shows its own message inline, under the form. A dialog
   * on top of it said the same thing twice - and for an expired subscription
   * it covered the button offering the way out.
   */
  const ownsItsMessages =
    req.url.includes('/authentication/login') ||
    // The subscribe dialog shows the reason inside itself; a popup over it
    // said the same thing twice.
    req.url.includes('/authentication/paySubscription') ||
    // The payout dialog reports its own outcome, in its own words. The
    // backend answers here in codes, which a popup would show raw.
    req.url.includes('/payment/payShare') ||
    // The change-password dialog shows its own errors inline, and on a first
    // login it is the whole screen - a popup on top of it has nothing to add.
    req.url.includes('/authentication/changePassword') ||
    // Branch messages and guidance: every outcome is a code the screen
    // has wording for, in both the success and the failure case.
    req.url.includes('/branchMessage/') ||
    req.url.includes('/guidance/') ||
    // Quiet refreshes and warm-ups (FastReadsInterceptor): never a popup.
    req.context.get(SILENT_REQUEST);


  /*
   * ============================================================
   * 2. SEND REQUEST
   * ============================================================
   */

  return next(req).pipe(

    tap({

      /*
       * ========================================================
       * SUCCESS RESPONSE
       * ========================================================
       */

      next: (event) => {

        if (event instanceof HttpResponse) {

          const body = event.body;

          /*
           * Kama backend imerudisha:
           *
           * {
           *   "message": "Malipo yamefanikiwa"
           * }
           *
           * basi message itaonyeshwa kwenye dialog.
           */

          if (
            !ownsItsMessages &&
            body &&
            typeof body === 'object' &&
            'message' in body &&
            typeof body.message === 'string' &&
            body.message.trim() !== ''
          ) {

            const dialogData: StatusDialogData = {
              status: 'info',
              message: say(body.message),
              showClose: true
            };

            dialog.open(StatusDialogComponent, {
              data: dialogData,
              width: '500px',
              panelClass: 'info'
            });
          }
        }
      },


      /*
       * ========================================================
       * ERROR RESPONSE
       * ========================================================
       */

      error: (error) => {

        console.error('🔥 Backend Error Object:', error);

        const status = error?.status;

        /*
         * ======================================================
         * 2b. REPORT UNREACHABLE-BACKEND FAILURES
         * ======================================================
         *
         * Status 0 means no response at all - backend down, DNS,
         * CORS, timeout. Those never reach GlobalExceptionHandler,
         * so this is the only place they can be recorded.
         * Anything with a real status code was already logged
         * server-side; reporting it here too would file it twice.
         */

        // Not filed: the heartbeat and quiet refreshes (the phone simply lost
        // signal for a moment - the next one tries again), and anything sent
        // while the device knows it is offline. They filled the error log
        // with network blips that nobody can fix (2026-11-11).
        const networkBlip =
          req.url.includes('/setting/heartbeat') ||
          req.context.get(SILENT_REQUEST) ||
          (typeof navigator !== 'undefined' && navigator.onLine === false);

        if (status === 0 && !networkBlip && !errorLogService.isReportingUrl(error?.url)) {
          errorLogService.reportClientError({
            level: 'ERROR',
            message: error?.message ?? 'Backend unreachable',
            exceptionType: 'HttpErrorResponse',
            path: error?.url ?? req.url,
            httpMethod: req.method,
            payload: serialiseBody(req.body)
          });
        }

        /*
         * ======================================================
         * 3. IGNORE PROFILE IMAGE 401
         * ======================================================
         *
         * Hii ni protection ya pili.
         */

        if (
          status === 401 &&
          error?.url?.includes('/attachment/findUserForProfile')
        ) {
          return;
        }

        /*
         * ======================================================
         * 3b. A TOKEN THAT MAY ONLY CHANGE ITS PASSWORD
         * ======================================================
         *
         * The login screen already has them in the forced dialog, so
         * nothing should be calling anything else. If something does -
         * a stray refresh, a bookmarked page - that page can load nothing,
         * so send them back to sign in, which puts the dialog up again.
         */

        if (status === 403 && error?.error?.code === 'PASSWORD_CHANGE_REQUIRED') {
          router.navigate(['/login']);
          return;
        }


        /*
         * ======================================================
         * 4. GET MESSAGE FROM BACKEND
         * ======================================================
         */

        let errorMessage = 'SRV_MSG.AN_UNEXPECTED_ERROR_OCCURRED';


        /*
         * Backend inaweza kurudisha string:
         *
         * "Weka Taarifa za Malipo"
         */

        if (
          typeof error?.error === 'string' &&
          error.error.trim() !== ''
        ) {

          errorMessage = error.error;
        }


        /*
         * Backend inaweza kurudisha:
         *
         * {
         *   "message": "Weka Commission REF"
         * }
         */

        else if (
          error?.error?.message &&
          typeof error.error.message === 'string'
        ) {

          errorMessage = error.error.message;
        }


        /*
         * Some answers carry only a code: { "code": "QUEUE_FULL" }.
         * Use it when we have wording for it.
         */

        else if (
          typeof error?.error?.code === 'string' &&
          say(error.error.code) !== error.error.code
        ) {

          errorMessage = error.error.code;
        }


        /*
         * ======================================================
         * 5. HANDLE HTTP STATUS
         * ======================================================
         */

        switch (status) {

          case 400:

            /*
             * Kama backend imetuma message yake,
             * usiibadilishe.
             */

            if (
              !error?.error?.message &&
              typeof error?.error !== 'string'
            ) {
              errorMessage =
                'SRV_MSG.BAD_REQUEST_PLEASE_CHECK_THE_INFORMATION_YOU_PROVIDED';
            }

            break;


          case 401:

            /*
             * Usifanye router.navigate(['/login']) hapa.
             *
             * AuthInterceptor ndiyo inapaswa kushughulikia
             * authentication.
             */

            if (
              !error?.error?.message &&
              typeof error?.error !== 'string'
            ) {
              errorMessage =
                'SRV_MSG.UNAUTHORIZED_PLEASE_LOGIN_TO_CONTINUE';
            }

            break;


          case 403:

            if (
              !error?.error?.message &&
              typeof error?.error !== 'string'
            ) {
              errorMessage =
                'SRV_MSG.ACCESS_DENIED_YOU_DO_NOT_HAVE_PERMISSION_TO_PERFORM_THIS_ACT';
            }

            break;


          case 404:

            if (
              !error?.error?.message &&
              typeof error?.error !== 'string'
            ) {
              errorMessage =
                'SRV_MSG.RESOURCE_NOT_FOUND_PLEASE_CHECK_THE_URL_OR_TRY_AGAIN_LATER';
            }

            break;


          case 500:

            if (
              !error?.error?.message &&
              typeof error?.error !== 'string'
            ) {
              errorMessage =
                'SRV_MSG.INTERNAL_SERVER_ERROR_PLEASE_CONTACT_SUPPORT_IF_THIS_PERSIST';
            }

            break;


          case 502:

            if (
              !error?.error?.message &&
              typeof error?.error !== 'string'
            ) {
              errorMessage =
                'SRV_MSG.BAD_METHOD_CHECK_URL';
            }

            break;


          case 0:

            // No answer at all - server down or no connection.
            errorMessage = 'SRV_MSG.BACKEND_UNREACHABLE';

            break;


          default:

            /*
             * Kwa errors nyingine tumia message ya backend
             * kama ipo.
             */

            break;
        }


        /*
         * ======================================================
         * 6. OPEN ERROR DIALOG
         * ======================================================
         */

        if (ownsItsMessages) {
          return;
        }

        const dialogData: StatusDialogData = {

          status: 'error',

          message: say(errorMessage),

          showClose: true
        };


        dialog.open(StatusDialogComponent, {

          data: dialogData,

          width: '400px',

          panelClass: 'error'
        });

      }

    })

  );
};
