import { NgModule } from '@angular/core';

import {
  RouterModule,
  Routes
} from '@angular/router';

import {
  HomeComponent
} from './components/home/home.component';

import {
  MenuComponent
} from './components/menu/menu.component';

import {
  AdminLoginComponent
} from './components/admin-login/admin-login.component';

import {
  AdminInventoryComponent
} from './components/admin-inventory/admin-inventory.component';

import {
  InventoryHistoryComponent
} from './components/inventory-history/inventory-history.component';

import {
  InventoryManageComponent
} from './components/inventory-manage/inventory-manage.component';

import {
  InventoryViewComponent
} from './components/inventory-view/inventory-view.component';

import {
  AuthGuard
} from './guards/auth.guard';

import {
  SuperAdminGuard
} from './guards/super-admin.guard';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: "Jo's House of Subs"
  },
  {
    path: 'menu',
    component: MenuComponent,
    title: "Menu | Jo's House of Subs"
  },
  {
    path: 'staff/login',
    component: AdminLoginComponent,
    title: "Staff Sign In | Jo's House of Subs"
  },
  {
    path: 'staff/inventory',
    component: InventoryViewComponent,
    canActivate: [AuthGuard],
    title: "Inventory | Jo's House of Subs"
  },
  {
    path: 'staff/inventory/history',
    component: InventoryHistoryComponent,
    canActivate: [AuthGuard],
    title: "Inventory History | Jo's House of Subs"
  },
  {
    path: 'staff/inventory/manage',
    component: InventoryManageComponent,
    canActivate: [SuperAdminGuard],
    title: "Manage Inventory | Jo's House of Subs"
  },
  {
    path: 'staff/menu',
    component: AdminInventoryComponent,
    canActivate: [SuperAdminGuard],
    title: "Manage Menu | Jo's House of Subs"
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      anchorScrolling: 'enabled',
      scrollPositionRestoration: 'enabled'
    })
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }