import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ApiError, RegisterRequest } from '../../shared/models/api.models';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account.component.html',
})
export class AccountComponent {
  form: RegisterRequest = { email: '', userName: '', password: '', roles: ['Employee'] };
  availableRoles = ['Employee', 'Manager', 'Admin'];
  message = '';
  error = '';

  private api = inject(ApiService);

  toggleRole(role: string, checked: boolean): void {
    this.form.roles = checked
      ? Array.from(new Set([...this.form.roles, role]))
      : this.form.roles.filter((item) => item !== role);
  }

  register(): void {
    this.message = '';
    this.error = '';
    this.api.registerUser(this.form).subscribe({
      next: () => {
        this.message = 'User registered successfully.';
        this.form = { email: '', userName: '', password: '', roles: ['Employee'] };
      },
      error: (err: ApiError) => (this.error = err.message || 'Unable to register user.'),
    });
  }
}
