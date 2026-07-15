import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormsModule, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Subject } from 'rxjs';
import { NavigationLoadService } from '../../core/services/navigation-load.service';
import { forkJoin } from 'rxjs';
import { Employee, EmployeeSkill, Skill, ApiError } from '../../shared/components/models/api.models';
import { HttpErrorResponse } from '@angular/common/http';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SearchBoxComponent } from '../../shared/components/search-box/search-box.component';
import { PageCardComponent } from '../../shared/components/page-card/page-card.component';
import { TableComponent } from '../../shared/components/table/table.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { EmployeeSkillService } from './services/employee-skill.service';
import { EmployeeService } from '../employees/services/employee.service';
import { SkillService } from '../skills/services/skill.service';

@Component({
  selector: 'app-employee-skills',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    SearchBoxComponent,
    PageCardComponent,
    TableComponent,
    LoadingSpinnerComponent,
    ConfirmDialogComponent,
    EmptyStateComponent,
  ],
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
  private api = inject(EmployeeSkillService);
  private apiEmployee = inject(EmployeeService);
  private apiSkill = inject(SkillService);
  private route = inject(ActivatedRoute);
  private navigationLoad = inject(NavigationLoadService);

  constructor() {
    console.log('EmployeeSkillsComponent instance', this);
  }
  //==========================================================
  // OnInit
  //==========================================================

  ngOnInit() {
    this.buildForm();

    this.loadEmployeeSkill();
  }

  private loadEmployeeSkill(): void {
    this.error = '';
    forkJoin({
      employees: this.apiEmployee.getEmployees(),
      skills: this.apiSkill.getSkills(),
      employeeSkills: this.api.getEmployeeSkills(),
    }).subscribe({
      next: ({ employees, skills, employeeSkills }) => {
        this.employees = [...employees];
        console.log('After assignment', this.employees.length, this);
        console.log(this.employees);
        this.skills = [...skills];

        this.employeeSkills = [...employeeSkills];

        this.filteredEmployeeSkills = [...employeeSkills];
      },

      error: (err: HttpErrorResponse) => {
        this.handleError(err);
      },
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
  // Refresh
  //==========================================================

  refresh(): void {
    this.loadEmployeeSkill();
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
      employeeName: '',
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

        this.loadEmployeeSkill();

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
    this.clearMessages();
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
  public applyFilter(): void {
    const keyword = this.searchText.trim().toLowerCase();

    if (!keyword) {
      this.filteredEmployeeSkills = [...this.employeeSkills];
      return;
    }

    this.filteredEmployeeSkills = this.employeeSkills.filter(
      (x) => x.employeeName.toLowerCase().includes(keyword) || x.skillName.toLowerCase().includes(keyword)
    );
  }

  // Delete

  showDeleteDialog = false;
  selectedEmployeeSkill: EmployeeSkill | null = null;

  public delete(employeeSkill: EmployeeSkill): void {
    this.selectedEmployeeSkill = employeeSkill;
    this.showDeleteDialog = true;
  }

  public confirmDelete(): void {
    if (!this.selectedEmployeeSkill) {
      return;
    }
    this.api.deleteEmployeeSkill(this.selectedEmployeeSkill.id).subscribe({
      next: () => {
        this.showDeleteDialog = false;
        this.selectedEmployeeSkill = null;
        this.loadEmployeeSkill();
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
