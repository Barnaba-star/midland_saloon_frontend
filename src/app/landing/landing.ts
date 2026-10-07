import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { BrandWord } from '../Utils/component/brand-word/brand-word';

const IMG = 'assets/images/saloon/';

@Component({
  selector: 'app-landing',
  imports: [MatIconModule, TranslatePipe, RouterLink, BrandWord],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Landing implements OnInit {
  currentYear = new Date().getFullYear();
  menuOpen = false;
  readonly contactEmail = 'barnabachristopher@gmail.com';
  readonly contactHref = `mailto:${this.contactEmail}?subject=${encodeURIComponent('Mr Saloon')}`;

  /**
   * The titles across the top, as on the Bar's page: each opens its own tab
   * (/#huduma shows only the services); Mwanzo is the hero and the saloon.
   * The title rides in the URL, so the phone's back button steps back.
   */
  readonly navLinks: { id: string | null; label: string }[] = [
    { id: null, label: 'LANDING.NAV_HOME' },
    { id: 'kuhusu', label: 'LANDING.NAV_ABOUT' },
    { id: 'huduma', label: 'LANDING.NAV_SERVICES' },
    { id: 'bei', label: 'LANDING.NAV_PRICE' },
    { id: 'maswali', label: 'LANDING.NAV_FAQ' },
    { id: 'mawasiliano', label: 'LANDING.NAV_CONTACT' },
  ];

  /** The tab on show, or 'home' for Mwanzo. */
  view = 'home';
  private readonly tabOrder = ['kuhusu', 'huduma', 'bei', 'maswali', 'mawasiliano'];
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  get home(): boolean {
    return this.view === 'home';
  }

  /** The tab after this one, for "Ifuatayo" at its foot; null on the last. */
  get nextTab(): { id: string; label: string } | null {
    const id = this.tabOrder[this.tabOrder.indexOf(this.view) + 1];
    const link = id ? this.navLinks.find((l) => l.id === id) : undefined;
    return link && id ? { id, label: link.label } : null;
  }

  ngOnInit(): void {
    this.route.fragment.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((f) => {
      this.view = f && this.tabOrder.includes(f) ? f : 'home';
      this.menuOpen = false;
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0 });
      }
      this.cdr.markForCheck();
    });
  }

  readonly aboutPoints = [
    { icon: 'travel_explore', title: 'LANDING.ABOUT_P1_T', desc: 'LANDING.ABOUT_P1_D' },
    { icon: 'content_cut', title: 'LANDING.ABOUT_P2_T', desc: 'LANDING.ABOUT_P2_D' },
    { icon: 'store', title: 'LANDING.ABOUT_P3_T', desc: 'LANDING.ABOUT_P3_D' },
  ];

  readonly priceIncludes = ['LANDING.PRICE_INC1', 'LANDING.PRICE_INC2', 'LANDING.PRICE_INC3', 'LANDING.PRICE_INC4'];

  readonly faqs = [1, 2, 3, 4, 5, 6, 7].map((n) => ({ q: `LANDING.Q${n}`, a: `LANDING.A${n}` }));

  /** The band under the hero - the services a saloon sells every day. */
  readonly serviceNames = ['LANDING.SV_CUT', 'LANDING.SV_BRAIDS', 'LANDING.SV_SHAVE', 'LANDING.SV_WASH', 'LANDING.SV_NAILS', 'LANDING.SV_MAKEUP', 'LANDING.SV_DREADS', 'LANDING.SV_COLOUR'];

  /** The saloon itself - each photo tied to the part of the system that runs it. */
  readonly gallery = [
    { key: 'big', src: IMG + 'barber-fade.jpg', icon: 'content_cut', caption: 'LANDING.G_BARBER', note: 'LANDING.G_BARBER_NOTE' },
    { key: 'style', src: IMG + 'styling.jpg', icon: 'face_retouching_natural', caption: 'LANDING.G_STYLE', note: 'LANDING.G_STYLE_NOTE' },
    { key: 'client', src: IMG + 'client-smile.jpg', icon: 'sentiment_satisfied', caption: 'LANDING.G_CLIENT', note: 'LANDING.G_CLIENT_NOTE' },
    { key: 'nails', src: IMG + 'nails.jpg', icon: 'spa', caption: 'LANDING.G_NAILS', note: 'LANDING.G_NAILS_NOTE' },
    { key: 'tools', src: IMG + 'tools.jpg', icon: 'inventory_2', caption: 'LANDING.G_TOOLS', note: 'LANDING.G_TOOLS_NOTE' },
  ];

  /** A client's visit, chair to payment. */
  readonly steps = [
    { no: '01', icon: 'event_seat', photo: IMG + 'salon-floor.jpg', title: 'LANDING.STEP1_TITLE', desc: 'LANDING.STEP1_DESC' },
    { no: '02', icon: 'content_cut', photo: IMG + 'blow-dry.jpg', title: 'LANDING.STEP2_TITLE', desc: 'LANDING.STEP2_DESC' },
    { no: '03', icon: 'volunteer_activism', photo: IMG + 'barber-finish.jpg', title: 'LANDING.STEP3_TITLE', desc: 'LANDING.STEP3_DESC' },
    { no: '04', icon: 'payments', photo: IMG + 'payment.jpg', title: 'LANDING.STEP4_TITLE', desc: 'LANDING.STEP4_DESC' },
  ];

  readonly features = [
    { icon: 'point_of_sale', photo: IMG + 'barber-cut.jpg', title: 'LANDING.FEATURE1_TITLE', desc: 'LANDING.FEATURE1_DESC' },
    { icon: 'groups', photo: IMG + 'stylists.jpg', title: 'LANDING.FEATURE2_TITLE', desc: 'LANDING.FEATURE2_DESC' },
    { icon: 'inventory_2', photo: IMG + 'kit.jpg', title: 'LANDING.FEATURE3_TITLE', desc: 'LANDING.FEATURE3_DESC' },
    { icon: 'insights', photo: IMG + 'laptop.jpg', title: 'LANDING.FEATURE4_TITLE', desc: 'LANDING.FEATURE4_DESC' },
    { icon: 'store', photo: IMG + 'salon-modern.jpg', title: 'LANDING.FEATURE5_TITLE', desc: 'LANDING.FEATURE5_DESC' },
    { icon: 'admin_panel_settings', photo: IMG + 'salon-dark.jpg', title: 'LANDING.SECURE_ACCESS', desc: 'LANDING.FEATURE6_DESC' },
  ];

  readonly values = [
    { icon: 'work', title: 'LANDING.VALUE2_TITLE', desc: 'LANDING.VALUE2_DESC' },
    { icon: 'lightbulb', title: 'LANDING.VALUE3_TITLE', desc: 'LANDING.VALUE3_DESC' },
    { icon: 'diamond', title: 'LANDING.VALUE4_TITLE', desc: 'LANDING.VALUE4_DESC' },
  ];

  constructor(private router: Router) {}

  goToLogin() {
    this.router.navigate(['login']);
  }
}
