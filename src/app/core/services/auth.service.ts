import { Injectable } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, PLATFORM_ID } from '@angular/core';
import { tap } from 'rxjs/operators';
import { LoginResponse } from '../../shared/models/api.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = 'http://localhost:5137/api/auth';

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: object) {}

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.api}/login`, { email, password })
      .pipe(tap(res => {
        if (this.isBrowser()) {
          localStorage.setItem('access_token', res.accessToken);
          localStorage.setItem('refresh_token', res.refreshToken);
        }
      }));
  }

  logout() {
    const rt = this.getRefreshToken();
    if (rt) {
      this.http.post(`${this.api}/logout`, { refreshToken: rt }).subscribe();
    }
    if (this.isBrowser()) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  getAccessToken() {
    if (!this.isBrowser()) {
      return null;
    }
    return localStorage.getItem('access_token');
  }

  getRefreshToken() {
    if (!this.isBrowser()) {
      return null;
    }
    return localStorage.getItem('refresh_token');
  }

  getUserName(): string {
    const payload = this.getTokenPayload();
    return payload?.['unique_name'] || payload?.['email'] || 'User';
  }

  getUserRoles(): string[] {
    const payload = this.getTokenPayload();
    const roleClaim = payload?.['role'] || payload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    if (Array.isArray(roleClaim)) {
      return roleClaim;
    }
    return roleClaim ? [roleClaim] : [];
  }

  getUserRoleLabel(): string {
    return this.getUserRoles().join(', ') || 'User';
  }

  refresh() {
    const rt = this.getRefreshToken();
    if (!rt) return null;
    return this.http.post<LoginResponse>(`${this.api}/refresh`, { refreshToken: rt })
      .pipe(tap(res => {
        if (this.isBrowser()) {
          localStorage.setItem('access_token', res.accessToken);
          localStorage.setItem('refresh_token', res.refreshToken);
        }
      }));
  }

  isLoggedIn() {
    return !!this.getAccessToken();
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private getTokenPayload(): Record<string, any> | null {
    const token = this.getAccessToken();
    if (!token) {
      return null;
    }

    try {
      const payload = token.split('.')[1];
      const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(normalizedPayload));
    } catch {
      return null;
    }
  }
}
