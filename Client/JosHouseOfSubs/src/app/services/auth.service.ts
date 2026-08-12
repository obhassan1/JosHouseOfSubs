import {
  HttpClient
} from '@angular/common/http';

import {
  Injectable
} from '@angular/core';

import {
  Observable,
  tap
} from 'rxjs';

import {
  environment
} from '../../environments/environment';

export type StaffRole =
  'staff' |
  'super_admin';

interface LoginResponse {
  token: string;
  role: StaffRole;
  username: string;
  expiresInSeconds: number;
}

interface TokenPayload {
  sub?: string;
  role?: StaffRole;
  exp?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly storageKey =
    'jos-staff-token';

  private readonly oldStorageKey =
    'jos-admin-token';

  private readonly loginUrl =
    `${environment.apiUrl}/admin/login`;

  constructor(
    private readonly http: HttpClient
  ) { }

  login(
    username: string,
    password: string
  ): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      this.loginUrl,
      {
        username,
        password
      }
    ).pipe(
      tap(({ token }) => {
        localStorage.setItem(
          this.storageKey,
          token
        );

        localStorage.removeItem(
          this.oldStorageKey
        );
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(
      this.storageKey
    );
  }

  getPayload(): TokenPayload | null {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    try {
      return JSON.parse(
        atob(token.split('.')[1])
      ) as TokenPayload;
    } catch (_error) {
      return null;
    }
  }

  isAuthenticated(): boolean {
    const payload = this.getPayload();

    if (
      !payload ||
      typeof payload.exp !== 'number' ||
      payload.exp * 1000 <= Date.now()
    ) {
      this.logout();
      return false;
    }

    return [
      'staff',
      'super_admin'
    ].includes(
      String(payload.role)
    );
  }

  isSuperAdmin(): boolean {
    return (
      this.isAuthenticated() &&
      this.getPayload()?.role ===
        'super_admin'
    );
  }

  getRole(): StaffRole | null {
    return this.isAuthenticated()
      ? this.getPayload()?.role || null
      : null;
  }

  logout(): void {
    localStorage.removeItem(
      this.storageKey
    );

    localStorage.removeItem(
      this.oldStorageKey
    );
  }
}