import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LoginResponse } from '../../shared/components/models/api.models';

import { TokenStorageService } from './token-storage.service';
import { JwtPayload } from '../models/jwt-payload.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  //private readonly authenticatedSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
  private readonly authenticatedSubject = new BehaviorSubject<boolean>(false);
  public readonly authenticated$ = this.authenticatedSubject.asObservable();
  constructor() {
    this.authenticatedSubject.next(this.isAuthenticated());
  }
  public login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, {
        email,
        password,
      })
      .pipe(
        tap((response) => {
          this.storeTokens(response);

          this.authenticatedSubject.next(true);
        })
      );
  }

  public logout(): void {
    const refreshToken = this.tokenStorage.getRefreshToken();

    if (refreshToken) {
      this.http.post(`${this.apiUrl}/logout`, { refreshToken }).subscribe({
        error: () => {
          // Ignore logout API errors.
        },
      });
    }

    this.tokenStorage.clear();

    this.authenticatedSubject.next(false);
  }

  public refreshToken(): Observable<LoginResponse | null> {
    const refreshToken = this.tokenStorage.getRefreshToken();

    if (!refreshToken) {
      return of(null);
    }

    return this.http
      .post<LoginResponse>(`${this.apiUrl}/refresh`, {
        refreshToken,
      })
      .pipe(
        tap((response) => {
          this.storeTokens(response);
        })
      );
  }

  public validateToken(): Observable<boolean> {
    if (!this.isAuthenticated()) {
      return of(false);
    }

    return this.http.get<void>(`${this.apiUrl}/validate`).pipe(
      map(() => true),

      catchError(() => of(false))
    );
  }

  public isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  public getAccessToken(): string | null {
    return this.tokenStorage.getAccessToken();
  }
  public isAuthenticated(): boolean {
    return this.tokenStorage.hasAccessToken() && !this.isTokenExpired();
  }

  public getRefreshToken(): string | null {
    return this.tokenStorage.getRefreshToken();
  }

  public getUserName(): string {
    const payload = this.getTokenPayload();
    return payload?.unique_name ?? payload?.email ?? 'User';
  }

  public getUserRoles(): string[] {
    const payload = this.getTokenPayload();

    if (!payload?.role) {
      return [];
    }

    return Array.isArray(payload.role) ? payload.role : [payload.role];
  }
  public hasRole(role: string): boolean {
    return this.getUserRoles().includes(role);
  }

  public hasAnyRole(roles: string[]): boolean {
    return roles.some((role) => this.hasRole(role));
  }

  public getCurrentRole(): string | null {
    const roles = this.getUserRoles();

    return roles.length > 0 ? roles[0] : null;
  }

  private storeTokens(response: LoginResponse): void {
    if (!response?.accessToken) {
      return;
    }

    this.tokenStorage.saveTokens(
      response.accessToken,

      response.refreshToken
    );
  }

  private getTokenPayload(): JwtPayload | null {
    const token = this.getAccessToken();

    if (!token) {
      return null;
    }

    try {
      const payload = token.split('.')[1];

      const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');

      return JSON.parse(atob(normalizedPayload)) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  public isTokenExpired(): boolean {
    const payload = this.getTokenPayload();

    if (!payload?.exp) {
      return true;
    }

    const expiration = payload.exp * 1000;
    return Date.now() >= expiration;
  }
}
