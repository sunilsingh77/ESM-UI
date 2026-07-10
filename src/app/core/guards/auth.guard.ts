import { inject, Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private auth = inject(AuthService);
  private router = inject(Router);

  canActivate(): Observable<boolean | UrlTree> {
    if (!this.auth.isLoggedIn()) {
      return of(this.router.createUrlTree(['/login']));
    }

    return this.auth.validateToken().pipe(
      map((valid) => (valid ? true : this.router.createUrlTree(['/login']))),
      catchError(() => {
        this.auth.logout();
        return of(this.router.createUrlTree(['/login']));
      })
    );
  }
}
