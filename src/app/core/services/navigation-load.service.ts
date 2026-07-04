import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NavigationLoadService {
  routeChange$ = new Subject<string>();

  constructor(router: Router) {
    router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe((event) => {
      this.routeChange$.next(event.urlAfterRedirects);
    });
  }
}
