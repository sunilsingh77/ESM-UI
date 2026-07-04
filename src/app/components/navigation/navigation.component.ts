import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnDestroy {
  navItems = [
    { label: 'Home', route: '/home' },
    { label: 'Account', route: '/account' },
    { label: 'Departments', route: '/departments' },
    { label: 'Employees', route: '/employees' },
    { label: 'Employee Skills', route: '/employee-skills' },
    { label: 'Skills', route: '/skills' },
  ];

  mobileMenuOpen = false;
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(public auth: AuthService, private router: Router) {
    router.events.pipe(filter((event): event is NavigationStart | NavigationEnd | NavigationCancel | NavigationError =>
      event instanceof NavigationStart ||
      event instanceof NavigationEnd ||
      event instanceof NavigationCancel ||
      event instanceof NavigationError
    ), takeUntil(this.destroy$)).subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.loading = true;
      } else {
        this.loading = false;
      }
    });
  }

  get currentRoute(): string {
    return this.router.url;
  }

  get showNavigation(): boolean {
    const route = this.currentRoute.split('?')[0].split('#')[0];
    return route !== '/login';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  navigateWithPrefetch(route: string, event: Event): void {
    event.preventDefault();
    if (this.currentRoute === route) {
      return;
    }

    this.router.navigateByUrl(route);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
