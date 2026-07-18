import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  // User Information
  userName = 'Sunil Singh';
  userRole = 'HR Administrator';

  ngOnInit(): void {
    this.loadUser();
  }

  private loadUser(): void {
    const name = localStorage.getItem('userName');
    const role = localStorage.getItem('userRole');

    if (name) {
      this.userName = name;
    } else {
      this.userName = this.authService.getUserName() ?? 'N/A';
    }

    if (role) {
      this.userRole = role;
    } else {
      this.userRole = this.authService.getUserRoles().join(', ');
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    this.authService.logout();
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    this.router.navigate(['/login']);
  }
}
