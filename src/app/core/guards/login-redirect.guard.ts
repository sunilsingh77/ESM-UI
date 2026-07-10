import { inject, Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class LoginRedirectGuard implements CanActivate {
  private auth = inject(AuthService);
  private router = inject(Router);

  canActivate(): Observable<boolean | UrlTree> {
    if (!this.auth.isLoggedIn()) {
      return of(true);
    }

    return this.auth.validateToken().pipe(
      map((valid) => (valid ? this.router.createUrlTree(['/home']) : true)),
      catchError(() => {
        this.auth.logout();
        return of(true);
      })
    );
  }
}
