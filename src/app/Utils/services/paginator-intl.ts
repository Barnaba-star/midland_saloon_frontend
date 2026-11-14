import { Injectable, inject } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';

/**
 * Material paginator words ("Items per page", "of", "Next page"...) in the
 * chosen language; refreshed whenever the language is switched.
 */
@Injectable()
export class TranslatedPaginatorIntl extends MatPaginatorIntl {
  private tr = inject(TranslateService);

  constructor() {
    super();
    this.setLabels();
    // labels change once the language file has loaded and on every switch
    this.tr.onLangChange.subscribe(() => this.setLabels());
    this.tr.onTranslationChange.subscribe(() => this.setLabels());
  }

  private setLabels(): void {
    this.itemsPerPageLabel = this.tr.instant('UTIL_T.PAGINATOR.ITEMS_PER_PAGE');
    this.nextPageLabel = this.tr.instant('UTIL_T.PAGINATOR.NEXT_PAGE');
    this.previousPageLabel = this.tr.instant('UTIL_T.PAGINATOR.PREVIOUS_PAGE');
    this.firstPageLabel = this.tr.instant('UTIL_T.PAGINATOR.FIRST_PAGE');
    this.lastPageLabel = this.tr.instant('UTIL_T.PAGINATOR.LAST_PAGE');
    this.changes.next();
  }

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      return this.tr.instant('UTIL_T.PAGINATOR.RANGE_EMPTY', { total: length });
    }
    const total = Math.max(length, 0);
    const start = page * pageSize;
    const end = start < total ? Math.min(start + pageSize, total) : start + pageSize;
    return this.tr.instant('UTIL_T.PAGINATOR.RANGE', { start: start + 1, end, total });
  };
}
