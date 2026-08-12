import {
  HTTP_INTERCEPTORS,
  HttpClientModule
} from '@angular/common/http';

import {
  NgModule
} from '@angular/core';

import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';

import {
  BrowserModule
} from '@angular/platform-browser';

import {
  BrowserAnimationsModule
} from '@angular/platform-browser/animations';

import {
  MatButtonModule
} from '@angular/material/button';

import {
  MatIconModule
} from '@angular/material/icon';

import {
  AppRoutingModule
} from './app-routing.module';

import {
  AppComponent
} from './app.component';

import {
  HomeComponent
} from './components/home/home.component';

import {
  NavbarComponent
} from './components/navbar/navbar.component';

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
  AuthInterceptor
} from './interceptors/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavbarComponent,
    MenuComponent,
    AdminLoginComponent,
    AdminInventoryComponent,
    InventoryViewComponent,
    InventoryHistoryComponent,
    InventoryManageComponent
  ],

  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    AppRoutingModule
  ],

  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],

  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }