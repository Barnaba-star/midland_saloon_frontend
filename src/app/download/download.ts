import { ChangeDetectionStrategy, Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { BrandWord } from '../Utils/component/brand-word/brand-word';
import { TranslateService } from '@ngx-translate/core';
import { RELEASES } from './releases';

/**
 * /app - download the SalonixTz Android app. The APKs live in
 * public/downloads/ with the version in the file name (the site serves
 * static files with a one-year cache, so a new version needs a new name).
 * One APK for every Android phone, old (32-bit, e.g. many Tecno/itel) and
 * new (64-bit) - two separate downloads confused people. Bump APP_VERSION
 * and the size together with the file.
 */
const APP_VERSION = '1.0.31';

@Component({
  selector: 'app-download',
  imports: [RouterLink, MatIconModule, TranslatePipe, BrandWord],
  templateUrl: './download.html',
  styleUrl: './download.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Download {
  readonly version = APP_VERSION;
  readonly main = { href: `/downloads/salonixtz-${APP_VERSION}.apk`, mb: 41.9 };
  /** Every version and what it brought, newest first (releases.ts - add each release at the top). */
  readonly releases = RELEASES;
  readonly lang: () => string;
  readonly currentYear = new Date().getFullYear();
  /** iPhone/iPad: the app is Android only for now - point them at the website. */
  readonly isApple: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: object, translate: TranslateService) {
    this.lang = () => translate.getCurrentLang() || 'sw';
    this.isApple = isPlatformBrowser(platformId) && /iPhone|iPad|iPod/i.test(navigator.userAgent);
  }
}
