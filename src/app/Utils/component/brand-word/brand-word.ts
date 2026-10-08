import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** A handlebar moustache, 100 x 26 units: full in the middle, tips curled up. */
const MOUSTACHE =
  'M50 9C45 2 34 1 27 7C21 12 13 15 5 10C2 8 0 5 1 2C-2 10 3 19 13 22C24 25 38 20 50 15' +
  'C62 20 76 25 87 22C97 19 102 10 99 2C100 5 98 8 95 10C87 15 79 12 73 7C66 1 55 2 50 9Z';

/**
 * The Mr Saloon logo, which is the word itself (as BaronixTZ is the Bar's):
 * a gold "Mr" in Allura script with a handlebar moustache under it - the
 * gentleman in the chair - then "SALOON" in heavy, spaced Inter capitals led
 * by a big gold Bodoni italic S,
 * standing level with the script.
 *
 * tone="dark" draws SALOON in navy (for light backgrounds); "light" in white
 * (for the photo and navy panels). With [mark]="true" only the round badge is
 * drawn: navy disc, gold "Mr" and moustache - the same as the favicon.
 * Everything sizes with the font.
 */
@Component({
  selector: 'app-brand-word',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'img',
    'aria-label': 'Mr Saloon',
    '[class.bw-light]': "tone() === 'light'",
    '[class.bw-mark]': 'mark()',
  },
  template: `
    @if (mark()) {
      <svg class="bw-badge" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="32" fill="#14315d"/>
        <circle cx="32" cy="32" r="28.5" fill="none" stroke="#c9962e" stroke-width="1.5"/>
        <text x="32" y="37" text-anchor="middle" font-family="Allura, cursive" font-size="30" fill="#e2bf6e">Mr</text>
        <path fill="#c9962e" transform="translate(16 40) scale(.32)" d="${MOUSTACHE}"/>
      </svg>
    } @else {
      <span class="bw-mr" aria-hidden="true">Mr<svg class="bw-tache" viewBox="0 0 100 26"><path d="${MOUSTACHE}"/></svg></span><span class="bw-saloon" aria-hidden="true"><span class="bw-s">S</span>aloon</span>
    }
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      white-space: nowrap;
      line-height: 1;
      color: var(--sx-navy-700, #14315d);
    }
    :host(.bw-light) {
      color: #ffffff;
    }
    .bw-mr {
      position: relative;
      font-family: 'Allura', cursive;
      font-weight: 400;
      font-size: 1.7em;
      line-height: 0.8;
      color: var(--sx-gold-500, #c9962e);
      padding: 0 0.06em 0.16em 0;
    }
    :host(.bw-light) .bw-mr {
      color: var(--sx-gold-300, #e2bf6e);
    }
    /* The moustache, centred under the script. */
    .bw-tache {
      position: absolute;
      left: 50%;
      bottom: -0.02em;
      width: 0.8em;
      height: 0.21em;
      transform: translateX(-50%);
      fill: currentColor;
    }
    .bw-saloon {
      font-family: var(--font-sans, 'Inter', sans-serif);
      font-weight: 800;
      font-size: 0.82em;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      margin-left: 0.2em;
      /* the tracking would otherwise leave a gap after the N */
      margin-right: -0.2em;
    }
    /* The S leads big and gold: heavy Bodoni italic against the spaced caps. */
    .bw-s {
      display: inline-block;
      font-family: 'Bodoni Moda', 'Playfair Display', serif;
      font-style: italic;
      font-weight: 900;
      font-size: 1.6em;
      line-height: 0.8;
      letter-spacing: 0;
      margin-right: 0.04em;
      color: var(--sx-gold-500, #c9962e);
    }
    :host(.bw-light) .bw-s {
      color: var(--sx-gold-300, #e2bf6e);
    }
    .bw-badge {
      width: 1.6em;
      height: 1.6em;
      flex-shrink: 0;
    }
  `],
})
export class BrandWord {
  readonly tone = input<'dark' | 'light'>('dark');
  readonly mark = input(false);
}
