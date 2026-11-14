import { Pipe, PipeTransform } from '@angular/core';

/**
 * Turns a status the server sends (PAID, NOT PAID, OPEN, active...) into its
 * translation key, so `{{ x | statusKey | translate }}` shows it in the chosen
 * language. A status it does not know passes through unchanged.
 */
const KEYS: Record<string, string> = {
  PAID: 'POS_T.STATUS.PAID',
  'NOT PAID': 'POS_T.STATUS.NOT_PAID',
  NOT_PAID: 'POS_T.STATUS.NOT_PAID',
  UNPAID: 'POS_T.STATUS.NOT_PAID',
  PARTIAL: 'POS_T.STATUS.PARTIAL',
  PENDING: 'POS_T.STATUS.PENDING',
  OPEN: 'POS_T.STATUS.OPEN',
  CLOSED: 'POS_T.STATUS.CLOSED',
  ACTIVE: 'POS_T.STATUS.ACTIVE',
  INACTIVE: 'POS_T.STATUS.INACTIVE',
  'NOT ACTIVE': 'POS_T.STATUS.INACTIVE',
};

@Pipe({ name: 'statusKey' })
export class StatusKeyPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (value === null || value === undefined) return '';
    return KEYS[String(value).trim().toUpperCase()] ?? String(value);
  }
}
