import { Component, OnInit, OnDestroy, inject } from '@angular/core';

import { CommonModule } from '@angular/common';

import { ReactiveFormsModule, FormBuilder, FormsModule, FormGroup, Validators } from '@angular/forms';

import { ActivatedRoute } from '@angular/router';

import { Subject, takeUntil } from 'rxjs';

import { ApiService } from '../../core/services/api.service';
import { NavigationLoadService } from '../../core/services/navigation-load.service';

import { Employee, EmployeeSkill, Skill, ApiError } from '../../shared/models/api.models';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-employee-skills',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './employee-skills.component.html',
  styleUrls: ['./employee-skills.component.css'],
})
export class EmployeeSkillsComponent implements OnInit, OnDestroy {
  //==========================================================
  // Collections
  //==========================================================

  employeeSkills: EmployeeSkill[] = [];

  filteredEmployeeSkills: EmployeeSkill[] = [];

  employees: Employee[] = [];

  skills: Skill[] = [];
  //==========================================================
  // Form
  //==========================================================

  employeeSkillForm!: FormGroup;

  submitted = false;

  editingId?: number;

  //==========================================================
  // UI State
  //==========================================================

  loading = false;

  saving = false;

  success = '';

  error = '';

  searchText = '';

  //==========================================================
  // RxJS
  //==========================================================

  private destroy$ = new Subject<void>();

  //==========================================================
  // Constructor
  //==========================================================

  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private navigationLoad = inject(NavigationLoadService);
  //==========================================================
  // OnInit
  //==========================================================

  ngOnInit(): void {
    this.buildForm();

    this.loadMasters();

    const resolved = this.route.snapshot.data['employeeSkills'] as EmployeeSkill[] | undefined;

    if (resolved) {
      this.employeeSkills = resolved;

      this.filteredEmployeeSkills = [...resolved];
    } else {
      this.loadEmployeeSkills();
    }

    this.navigationLoad.routeChange$.pipe(takeUntil(this.destroy$)).subscribe((route) => {
      if (route === '/employee-skills') {
        this.loadEmployeeSkills();
      }
    });
  }
  //==========================================================
  // Build Form
  //==========================================================

  private buildForm(): void {
    this.employeeSkillForm = this.fb.group({
      employeeId: [null, Validators.required],

      skillId: [null, Validators.required],

      proficiencyLevel: ['Beginner', Validators.required],

      yearsOfExperience: [0, [Validators.required, Validators.min(0), Validators.max(50)]],

      isPrimary: [false],
    });
  }
  //==========================================================
  // Getter
  //==========================================================

  get f() {
    return this.employeeSkillForm.controls;
  }
  //==========================================================
  // Load Master Data
  //==========================================================

  private loadMasters(): void {
    this.api.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
      },
    });

    this.api.getSkills().subscribe({
      next: (data) => {
        this.skills = data;
      },
    });
  }

  //==========================================================
  // Load Employee Skills
  //==========================================================

  loadEmployeeSkills(): void {
    this.loading = true;
    this.error = '';

    this.api.getEmployeeSkills().subscribe({
      next: (data) => {
        this.employeeSkills = data;
        this.filteredEmployeeSkills = [...data];

        this.loading = false;
      },

      error: (err: ApiError) => {
        this.loading = false;

        this.error = err.message || 'Unable to load employee skills.';
      },
    });
  }

  //==========================================================
  // Refresh
  //==========================================================

  refresh(): void {
    this.loadEmployeeSkills();
  }

  load(): void {
    this.api.getEmployeeSkills().subscribe({
      next: (items) => {
        this.employeeSkills = items;
      },

      error: (err: ApiError) => {
        this.error = err.message || 'Unable to load employee skills.';
      },
    });
  }

  //==========================================================
  // Save
  //==========================================================

  save(): void {
    this.submitted = true;

    this.success = '';
    this.error = '';

    if (this.employeeSkillForm.invalid) {
      return;
    }

    this.saving = true;

    const payload = {
      employeeId: Number(this.f['employeeId'].value),
      skillId: Number(this.f['skillId'].value),
      proficiencyLevel: this.f['proficiencyLevel'].value,
      yearsOfExperience: Number(this.f['yearsOfExperience'].value),
      isPrimary: this.f['isPrimary'].value,
    };

    const request = this.editingId
      ? this.api.updateEmployeeSkill(this.editingId, payload)
      : this.api.createEmployeeSkill(payload);

    request.subscribe({
      next: () => {
        this.saving = false;

        this.success = this.editingId ? 'Employee Skill updated successfully.' : 'Employee Skill created successfully.';

        this.cancel();

        this.loadEmployeeSkills();

        this.clearSuccess();
      },

      error: (err: ApiError) => {
        this.saving = false;

        this.error = err.message || 'Unable to save employee skill.';
      },
    });
  }

  //==========================================================
  // Edit
  //==========================================================

  edit(item: EmployeeSkill): void {
    this.success = '';
    this.error = '';

    this.editingId = item.id;

    this.employeeSkillForm.patchValue({
      employeeId: item.employeeId,

      skillId: item.skillId,

      proficiencyLevel: item.proficiencyLevel,

      yearsOfExperience: item.yearsOfExperience,

      isPrimary: item.isPrimary,
    });

    window.scrollTo({
      top: 0,

      behavior: 'smooth',
    });
  }

  //==========================================================
  // Delete
  //==========================================================

  delete(id: number): void {
    if (!confirm('Are you sure you want to delete this Employee Skill?')) {
      return;
    }

    this.success = '';
    this.error = '';

    this.loading = true;

    this.api.deleteEmployeeSkill(id).subscribe({
      next: () => {
        this.loading = false;

        this.success = 'Employee Skill deleted successfully.';

        this.loadEmployeeSkills();

        this.clearSuccess();
      },

      error: (err: ApiError) => {
        this.loading = false;

        this.error = err.message || 'Unable to delete employee skill.';
      },
    });
  }
  //==========================================================
  // Cancel
  //==========================================================

  cancel(): void {
    this.submitted = false;

    this.editingId = undefined;

    this.employeeSkillForm.reset({
      employeeId: null,

      skillId: null,

      proficiencyLevel: 'Beginner',

      yearsOfExperience: 0,

      isPrimary: false,
    });
  }
  //==========================================================
  // Search
  //==========================================================

  filter(event: Event): void {
    const keyword = (event.target as HTMLInputElement).value.trim().toLowerCase();

    if (!keyword) {
      this.filteredEmployeeSkills = [...this.employeeSkills];
      return;
    }

    this.filteredEmployeeSkills = this.employeeSkills.filter(
      (item) =>
        this.employeeName(item.employeeId).toLowerCase().includes(keyword) ||
        item.skillName.toLowerCase().includes(keyword) ||
        item.proficiencyLevel.toLowerCase().includes(keyword)
    );
  }

  //==========================================================
  // Employee Name
  //==========================================================

  employeeName(employeeId: number): string {
    const employee = this.employees.find((x) => x.id === employeeId);
    if (!employee) {
      return '-';
    }
    return `${employee.firstName} ${employee.lastName}`;
  }
  //==========================================================
  // Skill Name
  //==========================================================

  skillName(skillId: number): string {
    const skill = this.skills.find((x) => x.id === skillId);

    return skill ? skill.name : '-';
  }

  //==========================================================
  // Primary Skill Badge
  //==========================================================

  getPrimarySkillText(value: boolean): string {
    return value ? 'Yes' : 'No';
  }

  //==========================================================
  // Track By
  //==========================================================

  trackById(index: number, item: EmployeeSkill): number {
    return item.id;
  }

  //==========================================================
  // Clear Messages
  //==========================================================

  clearMessages(): void {
    this.success = '';

    this.error = '';
  }
  //==========================================================
  // Reset Form
  //==========================================================

  private resetForm(): void {
    this.employeeSkillForm.reset({
      employeeId: null,

      skillId: null,

      proficiencyLevel: 'Beginner',

      yearsOfExperience: 0,

      isPrimary: false,
    });

    this.submitted = false;

    this.editingId = undefined;
  }
  //==========================================================
  // Auto Hide Messages
  //==========================================================

  private clearSuccess(): void {
    if (!this.success) {
      return;
    }

    setTimeout(() => {
      this.success = '';
    }, 3000);
  }

  private clearError(): void {
    if (!this.error) {
      return;
    }

    setTimeout(() => {
      this.error = '';
    }, 5000);
  }
  //==========================================================
  // Loading Helpers
  //==========================================================

  private startLoading(): void {
    this.loading = true;

    this.clearMessages();
  }

  private stopLoading(): void {
    this.loading = false;
  }

  private startSaving(): void {
    this.saving = true;

    this.clearMessages();
  }

  private stopSaving(): void {
    this.saving = false;
  }
  //==========================================================
  // API Error Handler
  //==========================================================

  private handleError(error: HttpErrorResponse): void {
    this.loading = false;
    this.saving = false;
    this.success = '';
    this.error = error?.message || 'An unexpected error occurred. Please try again.';
    this.clearError();
  }
  //==========================================================
  // Success Handler
  //==========================================================
  private showSuccess(message: string): void {
    this.error = '';
    this.success = message;
    this.clearSuccess();
  }

  //==========================================================
  // Destroy
  //==========================================================

  ngOnDestroy(): void {
    this.destroy$.next();

    this.destroy$.complete();
  }
}
