import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { ApiService } from '../../core/services/api.service';
import { NavigationLoadService } from '../../core/services/navigation-load.service';

import { ApiError, Department } from '../../shared/models/api.models';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.css'],
})
export class DepartmentsComponent implements OnInit, OnDestroy {
  departments: Department[] = [];

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

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private route: ActivatedRoute,
    private navigationLoad: NavigationLoadService,
  ) {}

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

  console.log('Loading departments...');

  this.loading = true;
  this.error = '';

  this.api.getDepartments().subscribe({

    next: (data) => {


    this.departments = [...data];

    console.log('loading before:', this.loading);

    this.loading = false;

    console.log('loading after:', this.loading);

    },

    error: (err) => {

      console.error('Load failed:', err);

      this.loading = false;

      this.error = err.message || 'Unable to load departments.';

    }

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

        // Update existing row locally
        const index = this.departments.findIndex(d => d.id === this.editingId);

        if (index > -1) {

          this.departments[index] = {
            id: this.editingId,
            ...this.departmentForm.value
          };

          // Force Angular to detect the change
          this.departments = [...this.departments];
        }

      } else {

        // Add new row locally
        this.departments = [
          ...this.departments,
          result
        ];

      }

      this.success = this.editingId
        ? 'Department updated successfully.'
        : 'Department created successfully.';

      this.resetForm();

      this.saving = false;

      setTimeout(() => this.success = '', 3000);

    },

    error: (err: ApiError) => {

      this.saving = false;

      this.error = err.message || 'Unable to save department.';

    }

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

  delete(id: number): void {
    if (!confirm('Delete this department?')) {
      return;
    }

    this.saving = true;

    this.api.deleteDepartment(id).subscribe({
      next: () => {
        this.success = 'Department deleted successfully.';

        this.loadDepartments();
      },

      error: (err: ApiError) => {
        this.error = err.message || 'Unable to delete department.';
      },

      complete: () => {
        this.saving = false;

        setTimeout(() => {
          this.success = '';
        }, 3000);
      },
    });
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
}
