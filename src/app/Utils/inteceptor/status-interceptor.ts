import {
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';

import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import {
  StatusDialogComponent,
  StatusDialogData
} from '../component/status-dialog/status-dialog';

import { tap } from 'rxjs';

export const StatusInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
) => {

  const dialog = inject(MatDialog);

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
            body &&
            typeof body === 'object' &&
            'message' in body &&
            typeof body.message === 'string' &&
            body.message.trim() !== ''
          ) {

            const dialogData: StatusDialogData = {
              status: 'info',
              message: body.message,
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
         * 4. GET MESSAGE FROM BACKEND
         * ======================================================
         */

        let errorMessage = 'An unexpected error occurred.';


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
                'Bad Request. Please check the information you provided.';
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
                'Unauthorized: Please login to continue.';
            }

            break;


          case 403:

            if (
              !error?.error?.message &&
              typeof error?.error !== 'string'
            ) {
              errorMessage =
                'Access Denied. You do not have permission to perform this action.';
            }

            break;


          case 404:

            if (
              !error?.error?.message &&
              typeof error?.error !== 'string'
            ) {
              errorMessage =
                'Resource not found. Please check the URL or try again later.';
            }

            break;


          case 500:

            if (
              !error?.error?.message &&
              typeof error?.error !== 'string'
            ) {
              errorMessage =
                'Internal Server Error. Please contact support if this persists.';
            }

            break;


          case 502:

            if (
              !error?.error?.message &&
              typeof error?.error !== 'string'
            ) {
              errorMessage =
                'Bad Method, Check URL.';
            }

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

        const dialogData: StatusDialogData = {

          status: 'error',

          message: errorMessage,

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
