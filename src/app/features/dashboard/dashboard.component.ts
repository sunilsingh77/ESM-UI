import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, Subject } from 'rxjs';
import {
  ApiError,
  Employee,
  EmployeeSkill,
  Skill,
  Department,
  DashboardResponse,
} from '../../shared/components/models/api.models';
import { NavigationLoadService } from '../../core/services/navigation-load.service';
import { SearchBoxComponent } from '../../shared/components/search-box/search-box.component';

import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

import { EmployeeService } from '../employees/services/employee.service';
import { SkillService } from '../skills/services/skill.service';
import { DepartmentService } from '../departments/services/department.service';
import { EmployeeSkillService } from '../employee-skills/services/employee-skill.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DashboardService } from './services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SearchBoxComponent, LoadingSpinnerComponent, PageHeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  error = '';
  employees: Employee[] = [];
  skills: Skill[] = [];
  employeeSkills: EmployeeSkill[] = [];
  searchTerm = '';
  selectedEmployeeId = 0;
  loading = false;

  departments: Department[] = [];
  private destroy$ = new Subject<void>();

  private apiEmployee = inject(EmployeeService);
  private apiSkill = inject(SkillService);
  private apiDepartment = inject(DepartmentService);
  private apiEmployeeSkill = inject(EmployeeSkillService);
  private dashboardService = inject(DashboardService);
  private navigationLoad = inject(NavigationLoadService);
  dashboard?: DashboardResponse;
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.reloadDashboard();
  }

  searchByName(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.selectedEmployeeId = 0;
      this.filteredEmployeeSkills = [];
      return;
    }
    const employee = this.employees.find((x) => `${x.firstName} ${x.lastName}`.toLowerCase().includes(term));
    this.selectedEmployeeId = employee ? employee.id : 0;
    this.updateSelectedEmployeeSkills();
  }

  filteredEmployeeSkills: EmployeeSkill[] = [];
  updateSelectedEmployeeSkills(): void {
    this.filteredEmployeeSkills = this.employeeSkills.filter((x) => x.employeeId === this.selectedEmployeeId);
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  refreshDashboard(): void {
    this.reloadDashboard();
  }
  clearSelection(): void {
    this.searchTerm = '';
    this.selectedEmployeeId = 0;
    this.filteredEmployeeSkills = [];
  }
  private loadDashboardData(): void {
    this.loading = true;

    forkJoin({
      employees: this.apiEmployee.getEmployees(),
      departments: this.apiDepartment.getDepartments(),
      skills: this.apiSkill.getSkills(),
      employeeSkills: this.apiEmployeeSkill.getEmployeeSkills(),
    }).subscribe({
      next: (result) => {
        this.employees = [...result.employees];
        this.departments = [...result.departments];
        this.skills = [...result.skills];
        this.employeeSkills = [...result.employeeSkills];
        this.updateSelectedEmployeeSkills();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Dashboard Load Error', err);
        this.loading = false;
      },
    });
  }
  private loadDashboard(): void {
    this.dashboardService.getDashboard().subscribe({
      next: (dashboard) => {
        this.dashboard = dashboard;
      },
      error: (err: ApiError) => {
        this.error = err.message || 'Unable to load dashboard.';
      },
    });
  }
  private reloadDashboard(): void {
    this.loadDashboardData();
  }
}
