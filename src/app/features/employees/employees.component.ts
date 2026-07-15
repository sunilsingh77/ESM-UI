import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ApiError, Department, Employee } from '../../shared/components/models/api.models';
import { NavigationLoadService } from '../../core/services/navigation-load.service';
import { SearchBoxComponent } from '../../shared/components/search-box/search-box.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { PageCardComponent } from '../../shared/components/page-card/page-card.component';
import { TableComponent } from '../../shared/components/table/table.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmployeeService } from './services/employee.service';
import { DepartmentService } from '../departments/services/department.service';

type EmployeeForm = Omit<Employee, 'id' | 'departmentName' | 'skills'>;

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    SearchBoxComponent,
    PageCardComponent,
    TableComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css'],
})
export class EmployeesComponent implements OnInit, OnDestroy {
  employees: Employee[] = [];
  departments: Department[] = [];
  private destroy$ = new Subject<void>();
  form: EmployeeForm = this.emptyForm();
  editingId?: number;
  error = '';
  loading = false;
  success = '';
  searchText = '';
  private api = inject(EmployeeService);
  private apiDepartment = inject(DepartmentService);
  private route = inject(ActivatedRoute);
  private navigationLoad = inject(NavigationLoadService);
  filteredEmployees: Employee[] = [];
  ngOnInit(): void {
    const resolved = this.route.snapshot.data['employees'] as Employee[] | undefined;
    if (resolved) {
      this.employees = resolved;
    } else {
      this.loadEmployees();
    }
    this.apiDepartment.getDepartments().subscribe({ next: (items) => (this.departments = items) });
    this.navigationLoad.routeChange$.pipe(takeUntil(this.destroy$)).subscribe((route) => {
      if (route === '/employees') {
        this.loadEmployees();
      }
    });
  }

  loadEmployees(): void {
    this.api.getEmployees().subscribe({
      next: (items) => (this.employees = items),
      error: (err: ApiError) => (this.error = err.message || 'Unable to load employees.'),
    });
  }

  save(): void {
    const request = this.editingId
      ? this.api.updateEmployee(this.editingId, {
          firstName: this.form.firstName,
          lastName: this.form.lastName,
          email: this.form.email,
          phoneNumber: this.form.phoneNumber,
          position: this.form.position,
          departmentId: Number(this.form.departmentId),
        })
      : this.api.createEmployee({ ...this.form, departmentId: Number(this.form.departmentId) });

    request.subscribe({
      next: () => {
        this.reset();
        this.loadEmployees();
      },
      error: (err: ApiError) => (this.error = err.message || 'Unable to save employee.'),
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
      hireDate: employee.hireDate.substring(0, 10),
    };
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
      hireDate: new Date().toISOString().substring(0, 10),
    };
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
    this.api.deleteEmployee(this.selectedEmployee.id).subscribe({
      next: () => {
        this.showDeleteDialog = false;
        this.selectedEmployee = null;
        this.loadEmployees();
      },
      error: () => {
        this.showDeleteDialog = false;
      },
    });
  }

  cancelDelete(): void {
    this.showDeleteDialog = false;
  }
}
