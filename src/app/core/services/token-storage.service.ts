import { inject, Injectable, PLATFORM_ID } from '@angular/core';

import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class TokenStorageService {
  private readonly platformId = inject(PLATFORM_ID);

  private readonly accessTokenKey = 'access_token';

  private readonly refreshTokenKey = 'refresh_token';

  private get browserStorage(): Storage | null {
    return isPlatformBrowser(this.platformId) ? sessionStorage : null;
  }

  public getAccessToken(): string | null {
    return this.browserStorage?.getItem(this.accessTokenKey) ?? null;
  }

  public saveAccessToken(token: string): void {
    this.browserStorage?.setItem(this.accessTokenKey, token);
  }

  public getRefreshToken(): string | null {
    return this.browserStorage?.getItem(this.refreshTokenKey) ?? null;
  }

  public saveRefreshToken(token: string): void {
    this.browserStorage?.setItem(this.refreshTokenKey, token);
  }

  public saveTokens(accessToken: string, refreshToken: string): void {
    this.saveAccessToken(accessToken);

    this.saveRefreshToken(refreshToken);
  }

  public hasAccessToken(): boolean {
    return !!this.getAccessToken();
  }

  public clear(): void {
    this.browserStorage?.removeItem(this.accessTokenKey);

    this.browserStorage?.removeItem(this.refreshTokenKey);
  }
}
