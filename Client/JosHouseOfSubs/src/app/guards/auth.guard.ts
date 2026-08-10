import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  canActivate(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean {
    // Public for now. Replace this when the admin/authentication module is added.
    return true;
  }
}
