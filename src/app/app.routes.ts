import { Routes } from '@angular/router';
import { posFullAccessGuard } from './pos/pos-role.guard';
import { settingsGuard, settingsManageGuard, settingsRootOnlyGuard } from './settings/settings-role.guard';
import { adminGuard, adminManageGuard, adminRootOnlyGuard } from './admin/admin-role.guard';

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
        // Main office's service catalog (owner, 2026-11-14).
        path: 'serviceCatalog',
        loadComponent: () => import('./settings/service-catalog/service-catalog').then(m => m.ServiceCatalog)
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
    ]
  },
  {
    // The third area. Settings is how the system is configured; this is the
    // running of it - what branches are telling us, and what we publish back.
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./admin/admin').then(m => m.Admin),
    children: [
      {
        path: 'messages',
        loadComponent: () => import('./admin/message-admin/message-admin').then(m => m.MessageAdmin)
      },
      {
        path: 'guidance',
        loadComponent: () => import('./admin/guidance-admin/guidance-admin').then(m => m.GuidanceAdmin)
      },
      {
        // Moved here from Settings: watching the platform, not configuring it.
        path: 'errors',
        loadComponent: () => import('./settings/error-setting/error-setting').then(m => m.ErrorSetting)
      },
      {
        path: 'audit',
        loadComponent: () => import('./settings/audit-setting/audit-setting').then(m => m.AuditSetting)
      },
      {
        path: 'expiring',
        loadComponent: () => import('./settings/expiring-setting/expiring-setting').then(m => m.ExpiringSetting)
      },
      {
        // Regions are platform-wide - still ROOT only.
        path: 'regions',
        canActivate: [adminRootOnlyGuard],
        loadComponent: () => import('./settings/region-setting/region-setting').then(m => m.RegionSetting)
      },
      {
        // Money in (subscriptions) - ROOT and DIRECTOR only, not the ADMIN role.
        path: 'payments',
        canActivate: [adminManageGuard],
        loadComponent: () => import('./settings/payment-setting/payment-setting').then(m => m.PaymentSetting)
      },
      {
        // Who gets paid what this month, in the shape it goes to a bank.
        // Same gate as Payments: it is the same money, listed by person.
        path: 'payroll',
        canActivate: [adminManageGuard],
        loadComponent: () => import('./settings/payroll-setting/payroll-setting').then(m => m.PayrollSetting)
      },
    ]
  },
{
  path: '',
  loadComponent: () => import('./landing/landing').then(m => m.Landing)
},
{
  // Download the Android app.
  path: 'app',
  loadComponent: () => import('./download/download').then(m => m.Download)
},
{
  path: 'login',
  loadComponent: () => import('./login/login').then(m => m.Login)
},
// A walk-in's own phone: no login, no guard (door QR, their ticket, their card).
{
  // A stylist's own commission card (their QR, owner 2026-11-14).
  path: 'kamisheni/:token',
  loadComponent: () => import('./public/staff-commission/staff-commission').then(m => m.StaffCommission)
},
{
  // The services QR: what this branch offers, prices, stylists.
  path: 'huduma/:token',
  loadComponent: () => import('./public/services-menu/services-menu').then(m => m.ServicesMenu)
},
{
  path: 'foleni/:token',
  loadComponent: () => import('./public/queue-join/queue-join').then(m => m.QueueJoin)
},
{
  path: 'tiketi/:token',
  loadComponent: () => import('./public/queue-ticket/queue-ticket').then(m => m.QueueTicket)
},
{
  path: 'kadi/:token',
  loadComponent: () => import('./public/customer-card/customer-card').then(m => m.CustomerCard)
},
// The salon TV on the wall, and one stylist's work - also no login.
{
  path: 'tv/:token',
  loadComponent: () => import('./public/salon-tv/salon-tv').then(m => m.SalonTv)
},
{
  path: 'mhudumu/:doorToken/:staffUid',
  loadComponent: () => import('./public/stylist-page/stylist-page').then(m => m.StylistPage)
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
        // The door queue (Foleni): walk-ins who joined by the door QR.
        path: 'saloonQueue',
        loadComponent:()=>import('./pos/saloon-queue/saloon-queue').then(m=>m.SaloonQueue)
      },
      {
        // Mashindano: the stylists' weekly board.
        path: 'saloonBoard',
        loadComponent:()=>import('./pos/saloon-board/saloon-board').then(m=>m.SaloonBoard)
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
      {
        // No guard: raising a question and reading the guidance are open to
        // every POS role.
        path: 'saloonSupport',
        loadComponent:()=>import('./pos/saloon-support/saloon-support').then(m=>m.SaloonSupport)
      },
      {
        path: 'saloonHelp',
        loadComponent:()=>import('./pos/saloon-help/saloon-help').then(m=>m.SaloonHelp)
      },

    ]
  },

];
