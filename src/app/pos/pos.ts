import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';

import { filter } from 'rxjs';
import { SidenavItem } from '../Utils/component/main-sidenav-component/model';
import { Authentication } from '../Utils/services/authentication';
import { MainSidenav2 } from '../Utils/component/main-sidenav2/main-sidenav2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pos',
  imports:  [CommonModule, RouterModule, MainSidenav2],
  templateUrl: './pos.html',
  styleUrl: './pos.css',
})
export  class Pos implements OnInit{
constructor(private router: Router, private route: ActivatedRoute, private visibility:Authentication) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkIfHome();
      });
}
  ngOnInit(): void {

  }
isHome = true;
menuItems: SidenavItem[] = [
  {
    label: 'MENU.HOME',
    icon: 'home',
    roles: ['ROOT']
  },
  {
    label: 'MENU.STAFF',
    icon: 'person',
    route: '/pos/saloonStaff',
    roles: ['ROOT']
  },
  {
    label: 'MENU.SERVICE',
    icon: 'service',
    route:'/pos/saloonService',
    roles: ['ROOT']
  },
  {
    label: 'MENU.STORE',
    icon: 'store',
    route: '/pos/saloonStore',
    roles: ['ROOT']
  },
   {
    label: 'MENU.SALES',
    icon: 'payment2',
     route:'/pos/saloonSales',
    roles: ['ROOT'],
  },
  {
    label: 'MENU.REPORT',
    icon: 'report',
    route: '/pos/saloonReports',
    roles: ['ROOT']
  },
  {
    label: 'MENU.SETTING',
    icon: 'setting',
    route: '/pos/saloonSetting',
    roles: ['ROOT']
  }
];

getItems(menu: SidenavItem[]){
return this.visibility.filteredMenuItems(menu);
}

  private checkIfHome() {
    this.isHome = this.route.firstChild === null;
  }
}
