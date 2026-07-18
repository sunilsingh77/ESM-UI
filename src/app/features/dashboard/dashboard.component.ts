import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { forkJoin, Subject, takeUntil } from 'rxjs';

import { EmployeeService } from '../employees/services/employee.service';
import { DepartmentService } from '../departments/services/department.service';
import { SkillService } from '../skills/services/skill.service';
import { EmployeeSkillService } from '../employee-skills/services/employee-skill.service';

import { SearchBoxComponent } from '../../shared/components/search-box/search-box.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ApiError, Department, Employee, EmployeeSkill, Skill } from '../../shared/components/models/api.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SearchBoxComponent, LoadingSpinnerComponent, PageHeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  employees: Employee[] = [];
  departments: Department[] = [];
  skills: Skill[] = [];
  employeeSkills: EmployeeSkill[] = [];

  filteredEmployeeSkills: EmployeeSkill[] = [];

  searchTerm = '';
  selectedEmployeeId = 0;

  loading = false;
  error = '';

  private readonly destroy$ = new Subject<void>();

  private readonly employeeService = inject(EmployeeService);
  private readonly departmentService = inject(DepartmentService);
  private readonly skillService = inject(SkillService);
  private readonly employeeSkillService = inject(EmployeeSkillService);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  refreshDashboard(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      employees: this.employeeService.getEmployees(),
      departments: this.departmentService.getDepartments(),
      skills: this.skillService.getSkills(),
      employeeSkills: this.employeeSkillService.getEmployeeSkills(),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.employees = [...result.employees];
          this.departments = [...result.departments];
          this.skills = [...result.skills];
          this.employeeSkills = [...result.employeeSkills];

          this.updateSelectedEmployeeSkills();

          this.loading = false;

          this.cdr.detectChanges();
        },

        error: (err: ApiError) => {
          this.loading = false;

          this.error = err.message || 'Unable to load dashboard data.';
        },
      });
  }

  searchByName(): void {
    const keyword = this.searchTerm.trim().toLowerCase();

    if (!keyword) {
      this.clearSelection();

      return;
    }

    const employee = this.employees.find((x) => `${x.firstName} ${x.lastName}`.toLowerCase().includes(keyword));

    this.selectedEmployeeId = employee?.id ?? 0;

    this.updateSelectedEmployeeSkills();
  }

  onEmployeeChange(): void {
    this.updateSelectedEmployeeSkills();
  }

  private updateSelectedEmployeeSkills(): void {
    if (this.selectedEmployeeId === 0) {
      this.filteredEmployeeSkills = [];

      return;
    }

    this.filteredEmployeeSkills = this.employeeSkills.filter((x) => x.employeeId === this.selectedEmployeeId);
  }

  clearSelection(): void {
    this.searchTerm = '';

    this.selectedEmployeeId = 0;

    this.filteredEmployeeSkills = [];
  }

  get employeeCount(): number {
    return this.employees.length;
  }

  get departmentCount(): number {
    return this.departments.length;
  }

  get skillCount(): number {
    return this.skills.length;
  }

  get employeeSkillCount(): number {
    return this.employeeSkills.length;
  }

  get primarySkills(): number {
    return this.employeeSkills.filter((x) => x.isPrimary).length;
  }

  get employeesWithoutSkills(): number {
    return this.employees.filter((employee) => !this.employeeSkills.some((skill) => skill.employeeId === employee.id))
      .length;
  }

  get averageSkillsPerEmployee(): number {
    if (!this.employees.length) {
      return 0;
    }

    return Number((this.employeeSkills.length / this.employees.length).toFixed(1));
  }
  get selectedEmployee(): Employee | undefined {
    return this.employees.find((x) => x.id === this.selectedEmployeeId);
  }
}
