import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ApiError, Department, Employee } from '../../shared/components/models/api.models';
import { NavigationLoadService } from '../../core/services/navigation-load.service';
import { SearchBoxComponent } from '../../shared/components/search-box/search-box.component';
import { PageCardComponent } from '../../shared/components/page-card/page-card.component';
import { TableComponent } from '../../shared/components/table/table.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmployeeService } from './services/employee.service';
import { DepartmentService } from '../departments/services/department.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SearchBoxComponent,
    PageCardComponent,
    TableComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
    PageHeaderComponent,
  ],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css'],
})
export class EmployeesComponent implements OnInit, OnDestroy {
  employees: Employee[] = [];
  departments: Department[] = [];
  private destroy$ = new Subject<void>();
  private fb = inject(FormBuilder);
  employeeForm!: FormGroup;
  submitted = false;
  editingId?: number;
  saving = false;
  error = '';
  loading = false;
  success = '';
  searchText = '';
  private employeeService = inject(EmployeeService);
  private departmentService = inject(DepartmentService);
  private route = inject(ActivatedRoute);
  private navigationLoad = inject(NavigationLoadService);
  filteredEmployees: Employee[] = [];

  ngOnInit(): void {
    this.createForm();
    const resolved = this.route.snapshot.data['employees'] as Employee[] | undefined;
    if (resolved) {
      this.employees = [...resolved];
      this.filteredEmployees = [...resolved];
    } else {
      this.loadEmployees();
    }
    this.departmentService.getDepartments().subscribe({ next: (items) => (this.departments = items) });
    this.navigationLoad.routeChange$.pipe(takeUntil(this.destroy$)).subscribe((route) => {
      if (route === '/employees') {
        this.loadEmployees();
      }
    });
  }

  private createForm(): void {
    this.employeeForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      position: ['', Validators.required],
      departmentId: [0, [Validators.required, Validators.min(1)]],
      hireDate: [new Date().toISOString().substring(0, 10), Validators.required],
    });
  }

  loadEmployees(): void {
    this.loading = true;

    this.employeeService.getEmployees().subscribe({
      next: (items) => {
        this.employees = [...items];
        this.filteredEmployees = [...items];
        this.loading = false;
      },

      error: (err) => {
        this.loading = false;
        this.error = err.message;
      },
    });
  }

  save(): void {
    this.submitted = true;
    this.error = '';
    this.success = '';

    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }
    this.saving = true;
    const employee = this.employeeForm.getRawValue();

    const request = this.editingId
      ? this.employeeService.updateEmployee(this.editingId, {
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          phoneNumber: employee.phoneNumber,
          position: employee.position,
          departmentId: Number(employee.departmentId),
        })
      : this.employeeService.createEmployee({
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          phoneNumber: employee.phoneNumber,
          position: employee.position,
          departmentId: Number(employee.departmentId),
          hireDate: employee.hireDate,
        });

    request.subscribe({
      next: () => {
        this.success = this.editingId ? 'Employee updated successfully.' : 'Employee created successfully.';

        this.reset();
        this.loadEmployees();
        this.applyFilter();
        this.saving = false;
      },
      error: (err: ApiError) => {
        this.error = err.message || 'Unable to save employee.';
        this.saving = false;
      },
    });
  }

  edit(employee: Employee): void {
    this.editingId = employee.id;
    this.employeeForm.patchValue({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phoneNumber: employee.phoneNumber,
      position: employee.position,
      departmentId: employee.departmentId,
      hireDate: employee.hireDate.substring(0, 10),
    });
  }

  reset(): void {
    this.editingId = undefined;
    this.submitted = false;
    this.error = '';
    this.success = '';

    this.employeeForm.reset({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      position: '',
      departmentId: 0,
      hireDate: new Date().toISOString().substring(0, 10),
    });
  }
  get f(): FormGroup['controls'] {
    return this.employeeForm.controls;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public applyFilter(): void {
    const keyword = this.searchText.trim().toLowerCase();

    if (!keyword) {
      this.filteredEmployees = [...this.employees];
      return;
    }

    this.filteredEmployees = this.employees.filter(
      (x) => x.firstName.toLowerCase().includes(keyword) || x.lastName.toLowerCase().includes(keyword)
    );
  }

  showDeleteDialog = false;
  selectedEmployee: Employee | null = null;

  public delete(employee: Employee): void {
    this.selectedEmployee = employee;
    this.showDeleteDialog = true;
  }

  public confirmDelete(): void {
    if (!this.selectedEmployee) {
      return;
    }
    this.employeeService.deleteEmployee(this.selectedEmployee.id).subscribe({
      next: () => {
        this.showDeleteDialog = false;
        this.selectedEmployee = null;
        this.employees = this.employees.filter((x) => x.id !== this.selectedEmployee!.id);
        this.filteredEmployees = [...this.employees];
      },
      error: () => {
        this.showDeleteDialog = false;
      },
    });
  }

  cancelDelete(): void {
    this.showDeleteDialog = false;
  }

  addEmployee(): void {
    this.reset();
  }
}
