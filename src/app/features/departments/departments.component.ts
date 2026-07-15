import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { NavigationLoadService } from '../../core/services/navigation-load.service';

import { ApiError, Department } from '../../shared/components/models/api.models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SearchBoxComponent } from '../../shared/components/search-box/search-box.component';
import { PageCardComponent } from '../../shared/components/page-card/page-card.component';
import { TableComponent } from '../../shared/components/table/table.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { NotificationService } from '../../core/services/notification.service';
import { DepartmentService } from './services/department.service';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    SearchBoxComponent,
    PageCardComponent,
    TableComponent,
    LoadingSpinnerComponent,
    ConfirmDialogComponent,
    EmptyStateComponent,
  ],
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.css'],
})
export class DepartmentsComponent implements OnInit, OnDestroy {
  private readonly notification = inject(NotificationService);
  departments: Department[] = [];
  searchText = '';
  filteredDepartments: Department[] = [];
  departmentForm!: FormGroup;
  editingId: number | null = null;

  /** Page loading */
  loading = false;
  /** Save/Update/Delete loading */
  saving = false;
  submitted = false;
  success = '';
  error = '';

  private destroy$ = new Subject<void>();

  private fb = inject(FormBuilder);
  private api = inject(DepartmentService);
  private route = inject(ActivatedRoute);
  private navigationLoad = inject(NavigationLoadService);

  ngOnInit(): void {
    this.initializeForm();

    const resolved = this.route.snapshot.data['departments'] as Department[];

    if (resolved && resolved.length > 0) {
      this.departments = resolved;
    } else {
      this.loadDepartments();
    }

    this.navigationLoad.routeChange$.pipe(takeUntil(this.destroy$)).subscribe((route) => {
      if (route === '/departments') {
        this.loadDepartments();
      }
    });
  }

  initializeForm(): void {
    this.departmentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],

      description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(250)]],
    });
  }

  get f() {
    return this.departmentForm.controls;
  }

  loadDepartments(): void {
    this.error = '';

    this.api.getDepartments().subscribe({
      next: (data) => {
        this.departments = [...data];
      },

      error: (error) => {
        this.notification.error(error.message);
      },
    });
  }

  save(): void {
    this.submitted = true;

    this.success = '';
    this.error = '';

    if (this.departmentForm.invalid) {
      this.departmentForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    const request = this.editingId
      ? this.api.updateDepartment(this.editingId, this.departmentForm.value)
      : this.api.createDepartment(this.departmentForm.value);

    request.subscribe({
      next: (result: any) => {
        if (this.editingId) {
          const index = this.departments.findIndex((d) => d.id === this.editingId);

          if (index > -1) {
            this.departments[index] = {
              id: this.editingId,
              ...this.departmentForm.value,
            };

            // Force Angular to detect the change
            this.departments = [...this.departments];
          }
        } else {
          // Add new row locally
          this.departments = [...this.departments, result];
        }

        this.success = this.editingId ? 'Department updated successfully.' : 'Department created successfully.';

        this.resetForm();

        this.saving = false;

        setTimeout(() => (this.success = ''), 3000);
      },

      error: (err: ApiError) => {
        this.saving = false;

        this.error = err.message || 'Unable to save department.';
      },
    });
  }

  edit(department: Department): void {
    this.editingId = department.id;
    this.departmentForm.patchValue({
      name: department.name,
      description: department.description,
    });
    this.submitted = false;
  }

  cancel(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.departmentForm.reset();

    this.departmentForm.markAsPristine();

    this.departmentForm.markAsUntouched();

    this.editingId = null;

    this.submitted = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();

    this.destroy$.complete();
  }
  public applyFilter(): void {
    const keyword = this.searchText.trim().toLowerCase();

    if (!keyword) {
      this.filteredDepartments = [...this.departments];
      return;
    }

    this.filteredDepartments = this.departments.filter(
      (x) => x.name.toLowerCase().includes(keyword) || x.description.toLowerCase().includes(keyword)
    );
  }

  showDeleteDialog = false;
  selectedDepartment: Department | null = null;

  public delete(department: Department): void {
    this.selectedDepartment = department;
    this.showDeleteDialog = true;
  }

  public confirmDelete(): void {
    if (!this.selectedDepartment) {
      return;
    }
    this.api.deleteDepartment(this.selectedDepartment.id).subscribe({
      next: () => {
        this.showDeleteDialog = false;
        this.selectedDepartment = null;
        this.loadDepartments();
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
