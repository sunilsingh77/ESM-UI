import { inject, Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private readonly authService = inject(AuthService);

  private readonly router = inject(Router);

  public canActivate(): Observable<boolean | UrlTree> {
    if (!this.authService.isAuthenticated()) {
      return of(this.router.createUrlTree(['/login']));
    }

    return this.authService.validateToken().pipe(
      map((valid) => {
        if (valid) {
          return true;
        }

        this.authService.logout();

        return this.router.createUrlTree(['/login']);
      }),

      catchError(() => {
        this.authService.logout();

        return of(this.router.createUrlTree(['/login']));
      })
    );
  }
}
