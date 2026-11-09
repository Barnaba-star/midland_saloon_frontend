import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * The product logo: "SalonixTz" in cream and orange (a bearded head and
 * scissors inside the S) with no background of its own (owner, 2026-11-09:
 * no black band). The cream letters need a DARK surface behind them - the
 * ink/espresso of the Bar palette - so every place that shows it puts it on
 * one. The image is used as-is, never recoloured.
 *
 * Sized by height: --bw-h (default 1.6em of the host's font), width follows
 * (about 5.6:1), and it never grows wider than its container, so it fits at
 * phone width. tone and mark are kept so existing templates still compile.
 */
@Component({
  selector: 'app-brand-word',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.bw-light]': "tone() === 'light'",
    '[class.bw-mark]': 'mark()',
  },
  template: `<img class="bw-logo" src="assets/images/salonix-logo.png" alt="SalonixTz" width="2247" height="403" />`,
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
      height: var(--bw-h, 1.6em);
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
