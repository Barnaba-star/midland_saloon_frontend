import { Pipe, PipeTransform, inject } from '@angular/core';
import { formatDate, registerLocaleData } from '@angular/common';
import localeSw from '@angular/common/locales/sw';
import { TranslateService } from '@ngx-translate/core';

registerLocaleData(localeSw, 'sw');

/**
 * Like `| date`, but month and day names follow the language on screen
 * ("12 Nov 2026" in English, "12 Nov 2026" with Swahili month names in
 * Swahili). Impure so it follows an EN/SW switch.
 * Usage: {{ value | langDate:'dd MMM yyyy' }}
 */
@Pipe({ name: 'langDate', pure: false })
export class LangDatePipe implements PipeTransform {
  private tr = inject(TranslateService);

  transform(value: any, format = 'mediumDate'): string {
    if (value === null || value === undefined || value === '') return '';
    const lang = this.tr.getCurrentLang() || 'sw';
    const locale = lang.startsWith('sw') ? 'sw' : 'en-US';
    try {
      return formatDate(value, format, locale);
    } catch {
      return String(value);
    }
  }
}
