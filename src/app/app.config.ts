import {
  ApplicationConfig,
  ErrorHandler,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';

import { provideRouter } from '@angular/router';

import {
  provideHttpClient,
  withFetch,
  withInterceptors
} from '@angular/common/http';

import {
  provideClientHydration,
  withEventReplay
} from '@angular/platform-browser';

import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { AuthInterceptor } from './Utils/inteceptor/auth-interceptor';
import { provideNativeDateAdapter } from '@angular/material/core';
import { StatusInterceptor } from './Utils/inteceptor/status-interceptor';
import { WakeRetryInterceptor } from './Utils/inteceptor/wake-retry-interceptor';
import { GlobalErrorHandler } from './Utils/handlers/global-error-handler';

export const appConfig: ApplicationConfig = {
  providers: [

    provideBrowserGlobalErrorListeners(),

    // Everything Angular throws gets recorded under Settings > Errors.
    { provide: ErrorHandler, useClass: GlobalErrorHandler },

    provideZonelessChangeDetection(),
    provideNativeDateAdapter(),

    provideRouter(routes),

    provideClientHydration(
      withEventReplay()
    ),

  provideHttpClient(
      withFetch(),
      withInterceptors([
        AuthInterceptor,
        StatusInterceptor,
        // innermost: a sleeping backend is retried before any error dialog shows
        WakeRetryInterceptor
      ])
    ),

    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: './assets/i18n/',
        // fresh words on every load: a cached sw.json from an older release
        // showed new keys raw (MENU.SUBSCRIPTION_DAYS_LEFT)
        suffix: `.json?v=${Date.now()}`
      }),
      fallbackLang: 'en',
      lang: 'sw'
    })

  ]
};
