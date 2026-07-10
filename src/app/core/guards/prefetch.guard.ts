import { inject, Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { DataPrefetchService } from '../services/data-prefetch.service';

@Injectable({ providedIn: 'root' })
export class PrefetchGuard implements CanActivate {
  private prefetch = inject(DataPrefetchService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const path = state.url;

    let data$;
    switch (path) {
      case '/home':
        data$ = this.prefetch.getDashboard();
        break;
      case '/departments':
        data$ = this.prefetch.getDepartments();
        break;
      case '/employees':
        data$ = this.prefetch.getEmployees();
        break;
      case '/employee-skills':
        data$ = this.prefetch.getEmployeeSkills();
        break;
      case '/skills':
        data$ = this.prefetch.getSkills();
        break;
      default:
        return new Observable((observer) => {
          observer.next(true);
          observer.complete();
        });
    }

    return new Observable((observer) => {
      const obs$ = data$ as Observable<unknown>;
      obs$.subscribe({
        next: () => {
          observer.next(true);
          observer.complete();
        },
        error: () => {
          observer.next(true);
          observer.complete();
        },
      });
    });
  }
}
