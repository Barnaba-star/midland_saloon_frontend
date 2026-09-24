import { Routes } from '@angular/router';
import { posFullAccessGuard } from './pos/pos-role.guard';
import { settingsGuard, settingsManageGuard, settingsRootOnlyGuard } from './settings/settings-role.guard';

export const routes: Routes = [

  {
    path: 'settings',
    canActivate: [settingsGuard],
    loadComponent: () => import('./settings/settings').then(m => m.Settings),
    children: [

      {
        path: 'users',
        canActivate: [settingsManageGuard],
        loadComponent: () =>import('./settings/users-setting/users-setting').then(m => m.UsersSetting)
      },
       {
        path: 'node',
        loadComponent: () =>import('./settings/node-setting/node-setting').then(m => m.NodeSetting)
      },
      {
        path: 'role',
        canActivate: [settingsManageGuard],
        loadComponent: () =>import('./settings/role-setting/role-setting').then(m => m.RoleSetting)
      },
      {
        path: 'commission',
        loadComponent: () => import('./settings/commission-setting/commission-setting').then(m => m.CommissionSetting)
      },
      {
        path: 'permissions',
        canActivate: [settingsRootOnlyGuard],
        loadComponent: () => import('./settings/permission-setting/permission-setting').then(m => m.PermissionSetting)
      },
       {
        path: 'configuration',
        canActivate: [settingsRootOnlyGuard],
        loadComponent: () => import('./settings/configuration/configuration').then(m => m.Configuration)
      },
       {
        path: 'storage',
        canActivate: [settingsRootOnlyGuard],
        loadComponent: () => import('./settings/storage-setting/storage-setting').then(m => m.StorageSetting)
      },
      {
        path: 'errors',
        canActivate: [settingsManageGuard],
        loadComponent: () => import('./settings/error-setting/error-setting').then(m => m.ErrorSetting)
      },
      {
        path: 'audit',
        canActivate: [settingsManageGuard],
        loadComponent: () => import('./settings/audit-setting/audit-setting').then(m => m.AuditSetting)
      },
      {
        path: 'payments',
        canActivate: [settingsManageGuard],
        loadComponent: () => import('./settings/payment-setting/payment-setting').then(m => m.PaymentSetting)
      },
      {
        // STAFF see this one too - the backend narrows it to their own branches.
        path: 'expiring',
        canActivate: [settingsGuard],
        loadComponent: () => import('./settings/expiring-setting/expiring-setting').then(m => m.ExpiringSetting)
      },
      {
        // Who gets paid what this month, in the shape it goes to a bank.
        // Same gate as Payments: it is the same money, listed by person.
        path: 'payroll',
        canActivate: [settingsManageGuard],
        loadComponent: () => import('./settings/payroll-setting/payroll-setting').then(m => m.PayrollSetting)
      },
      {
        // Regions are platform-wide settings, not a branch's own.
        path: 'regions',
        canActivate: [settingsRootOnlyGuard],
        loadComponent: () => import('./settings/region-setting/region-setting').then(m => m.RegionSetting)
      },
    ]
  },
{
  path: '',
  loadComponent: () => import('./landing/landing').then(m => m.Landing)
},
{
  path: 'login',
  loadComponent: () => import('./login/login').then(m => m.Login)
},
{
  path: 'dashboard',
  loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard)
},

   {
    path: 'pos',
    loadComponent: () => import('./pos/pos').then(m => m.Pos),
    children: [

      {
        path: 'saloonSetting',
        canActivate: [posFullAccessGuard],
        loadComponent: () =>import('./pos/saloon-setting/saloon-setting').then(m => m.SaloonSetting)
      },
      {
        path: 'saloonStaff',
        loadComponent:()=>import('./pos/saloon-staff/saloon-staff').then(m=>m.SaloonStaff)
      },
       {
        path: 'saloonService',
        loadComponent:()=>import('./pos/saloon-service/saloon-service').then(m=>m.SaloonService)
      },
       {
        path: 'saloonSales',
        loadComponent:()=>import('./pos/saloon-sales/saloon-sales').then(m=>m.SaloonSales)
      },
        {
        path: 'saloonReports',
        loadComponent:()=>import('./pos/saloon-reports/saloon-reports').then(m=>m.SaloonReports)
      },
       {
        path: 'saloonStore',
        loadComponent:()=>import('./pos/saloon-store/saloon-store').then(m=>m.SaloonStore)
      },

    ]
  },

];
