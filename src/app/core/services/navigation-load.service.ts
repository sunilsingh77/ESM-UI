import { inject, Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NavigationLoadService {
  private router = inject(Router);
  routeChange$ = new Subject<string>();

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.routeChange$.next(event.urlAfterRedirects);
      });
  }
}
