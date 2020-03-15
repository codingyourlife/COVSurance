import { Routes } from '@angular/router'
import { AdminLayoutComponent } from './shared/components/layouts/admin-layout/admin-layout.component'

export const rootRouterConfig: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: 'home',
        loadChildren: () =>
          import('./views/home/home.module').then(m => m.HomeModule),
        data: { title: 'Home' },
      },
    ],
  },
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: 'insure',
        loadChildren: () =>
          import('./views/insure/insure.module').then(m => m.InsureModule),
        data: { title: 'Insure', breadcrumb: 'Insure' },
      },
    ],
  },
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: 'invest',
        loadChildren: () =>
          import('./views/invest/invest.module').then(m => m.InvestModule),
        data: { title: 'Invest', breadcrumb: 'INVEST' },
      },
    ],
  },
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: 'account',
        loadChildren: () =>
          import('./views/account/account.module').then(m => m.AccountModule),
        data: { title: 'Invest', breadcrumb: 'INVEST' },
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'sessions/404',
  },
]
