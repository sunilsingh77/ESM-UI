import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent {
  navItems = [
    { label: 'Home', route: '/home' },
    { label: 'Account', route: '/account' },
    { label: 'Departments', route: '/departments' },
    { label: 'Employees', route: '/employees' },
    { label: 'Employee Skills', route: '/employee-skills' },
    { label: 'Skills', route: '/skills' },
  ];

  mobileMenuOpen = false;

  constructor(public auth: AuthService, private router: Router) {}

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
