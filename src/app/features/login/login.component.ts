import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiError } from '../../shared/models/api.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  email = 'sunilsingh77@gmail.com';
  password = 'Sanjiv@#$857';
  error = '';
  isSubmitting = false;
  isValidating = false;

  private auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.isValidating = true;
      this.auth.validateToken().subscribe(
        (valid) => {
          this.isValidating = false;
          if (valid) {
            this.router.navigateByUrl('/home');
          } else {
            this.auth.logout();
          }
        },
        () => {
          this.isValidating = false;
          this.auth.logout();
        }
      );
    }
  }

  submit() {
    this.error = '';
    this.isSubmitting = true;
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigateByUrl('/home');
      },
      error: (err: ApiError) => {
        this.isSubmitting = false;
        this.error = err.message || 'Login failed. Please check your email and password.';
      },
    });
  }
}
