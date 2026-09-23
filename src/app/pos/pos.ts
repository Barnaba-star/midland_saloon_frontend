import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';

import { filter } from 'rxjs';
import { SidenavItem } from '../Utils/component/main-sidenav-component/model';
import { Authentication } from '../Utils/services/authentication';
import { MainSidenav2 } from '../Utils/component/main-sidenav2/main-sidenav2';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { POS_FULL_ACCESS_ROLES } from './pos-role.guard';

@Component({
  selector: 'app-pos',
  imports:  [CommonModule, RouterModule, MainSidenav2, MatCardModule, MatIconModule, TranslatePipe],
  templateUrl: './pos.html',
  styleUrl: './pos.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export  class Pos implements OnInit{
// Injected as a field (not a constructor parameter) so it already exists
// when the field initializers below (e.g. reportLabel) run - constructor
// parameters are only assigned after those initializers.
private visibility = inject(Authentication);
constructor(private router: Router, private route: ActivatedRoute, private cdr: ChangeDetectorRef) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkIfHome();
        this.cdr.markForCheck();
      });
}
  ngOnInit(): void {

  }
isHome = true;
// Frontend visibility only - the actual security boundary is each
// endpoint's @PreAuthorize permission check on the backend. This just
// decides which of these a given role sees in the POS sidenav.
//   CEO     -> everything, including Setting
//   MANAGER -> everything except Setting; Report shows as "Matumizi"
//   CASHIER -> same as MANAGER
// ROOT/STAFF/DIRECTOR keep full access like CEO.
private readonly fullAccessRoles = POS_FULL_ACCESS_ROLES;
private readonly allRoles = [...POS_FULL_ACCESS_ROLES, 'MANAGER', 'CASHIER'];

// MANAGER/CASHIER see the Report section under the name "Matumizi"
// (Expenses). Anyone holding a full-access role sees it as "Report".
private readonly reportLabel = this.fullAccessRoles.some(role => this.visibility.hasRole(role))
  ? 'MENU.REPORT'
  : 'MENU.EXPENSES';

menuItems: SidenavItem[] = [
  {
    label: 'MENU.HOME',
    icon: 'home',
    roles: this.allRoles
  },
  {
    label: 'MENU.STAFF',
    icon: 'person',
    route: '/pos/saloonStaff',
    roles: this.allRoles
  },
  {
    label: 'MENU.SERVICE',
    icon: 'service',
    route:'/pos/saloonService',
    roles: this.allRoles
  },
  {
    label: 'MENU.STORE',
    icon: 'store',
    route: '/pos/saloonStore',
    roles: this.allRoles
  },
   {
    label: 'MENU.SALES',
    icon: 'payment2',
     route:'/pos/saloonSales',
    roles: this.allRoles,
  },
  {
    label: this.reportLabel,
    icon: 'report',
    route: '/pos/saloonReports',
    roles: this.allRoles
  },
  {
    label: 'MENU.SETTING',
    icon: 'setting',
    route: '/pos/saloonSetting',
    roles: this.fullAccessRoles
  }
];

getItems(menu: SidenavItem[]){
return this.visibility.filteredMenuItems(menu);
}

  private checkIfHome() {
    this.isHome = this.route.firstChild === null;
  }

  // Quick-access cards shown on the POS "home" screen (bare /pos, before
  // any sub-section is picked). Mirrors the Dashboard's card pattern.
  homeCards = [
    {
      title: 'MENU.SALES',
      description: 'POS_HOME.SALES_DESC',
      icon: 'payment2',
      route: '/pos/saloonSales',
      roles: this.allRoles,
    },
    {
      title: 'MENU.STAFF',
      description: 'POS_HOME.STAFF_DESC',
      icon: 'person',
      route: '/pos/saloonStaff',
      roles: this.allRoles,
    },
    {
      title: 'MENU.SERVICE',
      description: 'POS_HOME.SERVICE_DESC',
      icon: 'service',
      route: '/pos/saloonService',
      roles: this.allRoles,
    },
    {
      title: 'MENU.STORE',
      description: 'POS_HOME.STORE_DESC',
      icon: 'store',
      route: '/pos/saloonStore',
      roles: this.allRoles,
    },
    {
      title: this.reportLabel,
      description: this.reportLabel === 'MENU.REPORT' ? 'POS_HOME.REPORT_DESC' : 'POS_HOME.EXPENSES_DESC',
      icon: 'report',
      route: '/pos/saloonReports',
      roles: this.allRoles,
    },
    {
      title: 'MENU.SETTING',
      description: 'POS_HOME.SETTING_DESC',
      icon: 'setting',
      route: '/pos/saloonSetting',
      roles: this.fullAccessRoles,
    },
  ];

  get filteredHomeCards() {
    return this.homeCards.filter(card =>
      card.roles.some(role => this.visibility.hasRole(role))
    );
  }

  goTo(route: string): void {
    this.router.navigate([route]);
  }

  get fullName(): string {
    return this.visibility.getFullName() || this.visibility.getUsername();
  }
}
