import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * The product logo: the owner's SalonixTz badge (a black pill with
 * "SalonixTz" in cream and orange - a bearded head and scissors inside the S).
 * It carries its own black band, so it reads on light and dark backgrounds
 * alike; the image is used as-is, never recoloured.
 *
 * It sizes with the font: the badge is 1.6em tall, width follows (about 8:1),
 * and it never grows wider than its container, so it fits at phone width.
 * tone and mark are kept so existing templates still compile; the badge is
 * the same everywhere.
 */
@Component({
  selector: 'app-brand-word',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.bw-light]': "tone() === 'light'",
    '[class.bw-mark]': 'mark()',
  },
  template: `<img class="bw-logo" src="assets/images/salonix-logo.png" alt="SalonixTz" width="885" height="111" />`,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      max-width: 100%;
      min-width: 0;
      line-height: 1;
    }
    .bw-logo {
      display: block;
      height: 1.6em;
      width: auto;
      max-width: 100%;
      object-fit: contain;
    }
  `],
})
export class BrandWord {
  readonly tone = input<'dark' | 'light'>('dark');
  readonly mark = input(false);
}
