import { Injectable } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { LoginResponse } from '../../shared/models/api.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = 'http://localhost:5137/api/auth';
  private loggedInSubject = new BehaviorSubject<boolean>(this.hasStoredToken());
  loggedIn$ = this.loggedInSubject.asObservable();

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: object) {}

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.api}/login`, { email, password })
      .pipe(tap(res => {
        this.storeAuthTokens(res);
        this.loggedInSubject.next(true);
      }));
  }

  logout() {
    const rt = this.getRefreshToken();
    if (rt) {
      this.http.post(`${this.api}/logout`, { refreshToken: rt }).subscribe();
    }
    if (this.isBrowser()) {
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
    }
    this.loggedInSubject.next(false);
  }

  validateToken(): Observable<boolean> {
    const token = this.getAccessToken();
    if (!token) {
      return of(false);
    }

    return this.http.get<void>(`${this.api}/validate`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  private storeAuthTokens(response: any) {
    const accessToken = response?.accessToken || response?.AccessToken || response?.access_token || response?.token;
    const refreshToken = response?.refreshToken || response?.RefreshToken || response?.refresh_token;
    if (!this.isBrowser() || !accessToken) {
      return;
    }

    sessionStorage.setItem('access_token', accessToken);
    if (refreshToken) {
      sessionStorage.setItem('refresh_token', refreshToken);
    }
  }

  private hasStoredToken() {
    return this.isBrowser() && !!sessionStorage.getItem('access_token');
  }

  getAccessToken() {
    if (!this.isBrowser()) {
      return null;
    }
    return sessionStorage.getItem('access_token');
  }

  getRefreshToken() {
    if (!this.isBrowser()) {
      return null;
    }
    return sessionStorage.getItem('refresh_token');
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
    if (!rt) return of(null);
    return this.http.post<LoginResponse>(`${this.api}/refresh`, { refreshToken: rt })
      .pipe(tap(res => {
        if (this.isBrowser()) {
          sessionStorage.setItem('access_token', res.accessToken);
          sessionStorage.setItem('refresh_token', res.refreshToken);
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
