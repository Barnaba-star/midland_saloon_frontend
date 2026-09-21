import {
  ApplicationConfig,
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

export const appConfig: ApplicationConfig = {
  providers: [

    provideBrowserGlobalErrorListeners(),

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
        StatusInterceptor
      ])
    ),

    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: './assets/i18n/',
        suffix: '.json'
      }),
      fallbackLang: 'en',
      lang: 'en'
    })

  ]
};
