import { Injectable } from '@angular/core';

export interface SearchItem {
  labelKey: string;
  route: string;
  icon: string;
}

/**
 * A static index of every navigable page in the app, independent of
 * whichever sidenav (pos / settings) happens to be active. Used to
 * power the header's quick-search / command-palette.
 */
@Injectable({ providedIn: 'root' })
export class GlobalSearchService {

  readonly index: SearchItem[] = [

    { labelKey: 'DASHBOARD.WELCOME', route: '/dashboard', icon: 'home' },

    { labelKey: 'MENU.STAFF', route: '/pos/saloonStaff', icon: 'person' },
    { labelKey: 'MENU.SERVICE', route: '/pos/saloonService', icon: 'service' },
    { labelKey: 'MENU.STORE', route: '/pos/saloonStore', icon: 'store' },
    { labelKey: 'MENU.SALES', route: '/pos/saloonSales', icon: 'payment2' },
    { labelKey: 'MENU.REPORT', route: '/pos/saloonReports', icon: 'report' },
    { labelKey: 'MENU.SETTING', route: '/pos/saloonSetting', icon: 'setting' },

    { labelKey: 'SETTINGS_MENU.ROLE', route: '/settings/role', icon: 'role' },
    { labelKey: 'SETTINGS_MENU.BRANCH', route: '/settings/node', icon: 'office' },
    { labelKey: 'SETTINGS_MENU.USERS', route: '/settings/users', icon: 'user' },
    { labelKey: 'SETTINGS_MENU.PERMISSIONS', route: '/settings/permissions', icon: 'permission' },
    { labelKey: 'SETTINGS_MENU.CONFIG', route: '/settings/configuration', icon: 'setting' },
    { labelKey: 'SETTINGS_MENU.STORAGE', route: '/settings/storage', icon: 'save' },
  ];
}
