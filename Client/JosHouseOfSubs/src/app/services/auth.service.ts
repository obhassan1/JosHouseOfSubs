import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

interface LoginResponse {
  token: string;
  expiresInSeconds: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'jos-admin-token';
  private readonly loginUrl = `${environment.apiUrl}/admin/login`;

  constructor(private readonly http: HttpClient) { }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.loginUrl, { username, password }).pipe(
      tap(({ token }) => localStorage.setItem(this.storageKey, token))
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.storageKey);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as { exp?: number };
      return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now();
    } catch (_error) {
      this.logout();
      return false;
    }
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
  }
}