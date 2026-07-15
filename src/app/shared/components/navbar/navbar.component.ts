import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

export interface MenuItem {
  label: string;
  route: string;
  icon?: string;
  roles?: string[];
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  public auth = inject(AuthService);
  private router = inject(Router);

  // Menu definition
  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      route: '/home',
      icon: 'bi-speedometer2',
      roles: ['Admin', 'Manager', 'Employee'],
    },
    {
      label: 'Employees',
      route: '/employees',
      icon: 'bi-people',
      roles: ['Admin', 'Manager'],
    },
    {
      label: 'Departments',
      route: '/departments',
      icon: 'bi-diagram-3',
      roles: ['Admin'],
    },
    {
      label: 'Skills',
      route: '/skills',
      icon: 'bi-award',
      roles: ['Admin', 'Manager', 'Employee'],
    },
    {
      label: 'Employee Skills',
      route: '/employee-skills',
      icon: 'bi-award',
      roles: ['Admin'],
    },
    {
      label: 'Reports',
      route: '/reports',
      icon: 'bi-file-earmark-bar-graph',
      roles: ['Admin', 'Manager'],
    },
  ];

  // Return only menus allowed for the logged-in user
  get visibleMenuItems(): MenuItem[] {
    /*
    const roles = this.auth.getUserRoles();
    return this.menuItems.filter(item =>
      !item.roles || item.roles.some(role => roles.includes(role))
    );
    */

    return this.menuItems;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
