import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { MenuComponent } from './components/menu/menu.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { AdminInventoryComponent } from './components/admin-inventory/admin-inventory.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', component: HomeComponent, title: "Jo's House of Subs" },
  { path: 'menu', component: MenuComponent, title: "Menu | Jo's House of Subs" },
  { path: 'staff/login', component: AdminLoginComponent, title: "Staff Sign In | Jo's House of Subs" },
  {
    path: 'staff/inventory',
    component: AdminInventoryComponent,
    canActivate: [AuthGuard],
    title: "Menu & Inventory | Jo's House of Subs"
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    anchorScrolling: 'enabled',
    scrollPositionRestoration: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }