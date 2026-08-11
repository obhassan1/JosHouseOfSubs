import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();
    const isAdminRequest = request.url.includes('/admin/');
    const isLoginRequest = request.url.endsWith('/admin/login');
    const authenticatedRequest = token && isAdminRequest && !isLoginRequest
      ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : request;

    return next.handle(authenticatedRequest).pipe(
      catchError((error: { status?: number }) => {
        if (error.status === 401 && isAdminRequest && !isLoginRequest) {
          this.authService.logout();
          void this.router.navigate(['/staff/login']);
        }

        return throwError(() => error);
      })
    );
  }
}