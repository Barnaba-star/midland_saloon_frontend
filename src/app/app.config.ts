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
import { FastReadsInterceptor } from './Utils/inteceptor/fast-reads-interceptor';
import { GlobalErrorHandler } from './Utils/handlers/global-error-handler';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslatedPaginatorIntl } from './Utils/services/paginator-intl';

export const appConfig: ApplicationConfig = {
  providers: [

    provideBrowserGlobalErrorListeners(),

    // Everything Angular throws gets recorded under Settings > Errors.
    { provide: ErrorHandler, useClass: GlobalErrorHandler },

    provideZonelessChangeDetection(),
    provideNativeDateAdapter(),
    // paginator words follow the chosen language (sw/en)
    { provide: MatPaginatorIntl, useClass: TranslatedPaginatorIntl },

    provideRouter(routes),

    provideClientHydration(
      withEventReplay()
    ),

  provideHttpClient(
      withFetch(),
      withInterceptors([
        AuthInterceptor,
        // Lists answered at once from the device's last copy, refreshed quietly
        // (the server is ~0.5 s away from Tanzania) - as Bar and Hotel.
        FastReadsInterceptor,
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
