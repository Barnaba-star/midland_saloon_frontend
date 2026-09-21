import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path: 'settings',
    loadComponent: () => import('./settings/settings').then(m => m.Settings),
    children: [

      {
        path: 'users',
        loadComponent: () =>import('./settings/users-setting/users-setting').then(m => m.UsersSetting)
      },
       {
        path: 'node',
        loadComponent: () =>import('./settings/node-setting/node-setting').then(m => m.NodeSetting)
      },
      {
        path: 'role',
        loadComponent: () =>import('./settings/role-setting/role-setting').then(m => m.RoleSetting)
      },
      {
        path: 'permissions',
        loadComponent: () => import('./settings/permission-setting/permission-setting').then(m => m.PermissionSetting)
      },
       {
        path: 'configuration',
        loadComponent: () => import('./settings/configuration/configuration').then(m => m.Configuration)
      },
       {
        path: 'storage',
        loadComponent: () => import('./settings/storage-setting/storage-setting').then(m => m.StorageSetting)
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
