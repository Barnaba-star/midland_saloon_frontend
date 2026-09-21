import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, ActivatedRoute, NavigationEnd  } from '@angular/router';
import { SidenavItem } from '../Utils/component/main-sidenav-component/model';
import { MainSidenavComponent } from "../Utils/component/main-sidenav-component/main-sidenav-component";
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { Authentication } from '../Utils/services/authentication';
import { MainSidenav2 } from "../Utils/component/main-sidenav2/main-sidenav2";
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-settings',
  imports: [RouterOutlet,  CommonModule, MainSidenav2, TranslatePipe],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit{
constructor(private router: Router, private route: ActivatedRoute, private visibility:Authentication) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkIfHome();
      });
}
  ngOnInit(): void {
    this.router.navigate([
        '/settings/role'
      ]);
  }

isHome = true;
menuItems: SidenavItem[] = [
  {
    label: 'SETTINGS_MENU.SYSTEM',
    icon: 'workflow',
    roles: ['ROOT', 'REG OFFICER'],
    children: [


    ]
  },
     {
        label: 'SETTINGS_MENU.ROLE',
        icon: 'role',
        route: '/settings/role',
        roles: ['ROOT', 'REG OFFICER']
      },
      {
        label: 'SETTINGS_MENU.BRANCH',
        icon: 'office',
        route: '/settings/node',
        roles: ['ROOT' , 'REG OFFICER']
      },
      {
        label: 'SETTINGS_MENU.USERS',
        icon: 'user',
        route: '/settings/users',
        roles: ['ROOT', 'REG OFFICER']
      },
      {
        label: 'SETTINGS_MENU.PERMISSIONS',
        icon: 'permission',
        route: '/settings/permissions',
        roles: ['ROOT']
      },


   {
        label: 'SETTINGS_MENU.CONFIG',
        icon: 'setting',
        route: '/settings/configuration',
        roles: ['ROOT']
      },
       {
        label: 'SETTINGS_MENU.STORAGE',
        icon: 'save',
        route: '/settings/storage',
        roles: ['ROOT']
      }
];

getItems(menu: SidenavItem[]){
return this.visibility.filteredMenuItems(menu);
}



 goToNode() {
    this.router.navigate(['node']);
}

  private checkIfHome() {
    this.isHome = this.route.firstChild === null;
  }

}
