import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { ApiError, Department, Employee } from '../../shared/models/api.models';
import { NavigationLoadService } from '../../core/services/navigation-load.service';

type EmployeeForm = Omit<Employee, 'id' | 'departmentName' | 'skills'>;

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employees.component.html'
})
export class EmployeesComponent implements OnInit, OnDestroy {
  employees: Employee[] = [];
  departments: Department[] = [];
  private destroy$ = new Subject<void>();
  form: EmployeeForm = this.emptyForm();
  editingId?: number;
  error = '';

  constructor(private api: ApiService, private route: ActivatedRoute, private navigationLoad: NavigationLoadService) {}

  ngOnInit(): void {
    const resolved = this.route.snapshot.data['employees'] as Employee[] | undefined;
    if (resolved) {
      this.employees = resolved;
    } else {
      this.load();
    }
    this.api.getDepartments().subscribe({ next: (items) => this.departments = items });
    this.navigationLoad.routeChange$.pipe(takeUntil(this.destroy$)).subscribe((route) => {
      if (route === '/employees') {
        this.load();
      }
    });
  }

  load(): void {
    this.api.getEmployees().subscribe({
      next: (items) => this.employees = items,
      error: (err: ApiError) => this.error = err.message || 'Unable to load employees.'
    });
  }

  save(): void {
    const request = this.editingId ? this.api.updateEmployee(this.editingId, {
      firstName: this.form.firstName,
      lastName: this.form.lastName,
      email: this.form.email,
      phoneNumber: this.form.phoneNumber,
      position: this.form.position,
      departmentId: Number(this.form.departmentId)
    }) : this.api.createEmployee({ ...this.form, departmentId: Number(this.form.departmentId) });

    request.subscribe({
      next: () => {
        this.reset();
        this.load();
      },
      error: (err: ApiError) => this.error = err.message || 'Unable to save employee.'
    });
  }

  edit(employee: Employee): void {
    this.editingId = employee.id;
    this.form = {
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phoneNumber: employee.phoneNumber,
      position: employee.position,
      departmentId: employee.departmentId,
      hireDate: employee.hireDate.substring(0, 10)
    };
  }

  delete(id: number): void {
    this.api.deleteEmployee(id).subscribe({
      next: () => this.load(),
      error: (err: ApiError) => this.error = err.message || 'Unable to delete employee.'
    });
  }

  reset(): void {
    this.editingId = undefined;
    this.form = this.emptyForm();
    this.error = '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private emptyForm(): EmployeeForm {
    return {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      position: '',
      departmentId: 0,
      hireDate: new Date().toISOString().substring(0, 10)
    };
  }
}
