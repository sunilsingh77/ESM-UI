import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, Subject } from 'rxjs';
import {
  DashboardResponse,
  ApiError,
  Employee,
  EmployeeSkill,
  Skill,
  Department,
} from '../../shared/components/models/api.models';
import { NavigationLoadService } from '../../core/services/navigation-load.service';
import { SearchBoxComponent } from '../../shared/components/search-box/search-box.component';

import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { DashboardService } from './services/dashboard.service';
import { EmployeeService } from '../employees/services/employee.service';
import { SkillService } from '../skills/services/skill.service';
import { DepartmentService } from '../departments/services/department.service';
import { EmployeeSkillService } from '../employee-skills/services/employee-skill.service';
import { PageCardComponent } from '../../shared/components/page-card/page-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SearchBoxComponent, LoadingSpinnerComponent, PageCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  dashboard?: DashboardResponse;
  error = '';
  employees: Employee[] = [];
  skills: Skill[] = [];
  employeeSkills: EmployeeSkill[] = [];
  searchTerm = '';
  selectedEmployeeId = 0;
  loading = false;
  seedMessage = '';
  departments: Department[] = [];
  private destroy$ = new Subject<void>();

  private api = inject(DashboardService);
  private apiEmployee = inject(EmployeeService);
  private apiSkill = inject(SkillService);
  private apiDepartment = inject(DepartmentService);
  private apiEmployeeSkill = inject(EmployeeSkillService);
  private route = inject(ActivatedRoute);
  private navigationLoad = inject(NavigationLoadService);
  private initialized = false;

  constructor() {
    console.log('Dashboard Constructor');
  }

  ngOnInit(): void {
    console.log('Dashboard OnInit');
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
    console.log('Dashboard Destroy');
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
    console.log('loadDashboardData called');

    this.loading = true;

    forkJoin({
      employees: this.apiEmployee.getEmployees(),
      departments: this.apiDepartment.getDepartments(),
      skills: this.apiSkill.getSkills(),
      employeeSkills: this.apiEmployeeSkill.getEmployeeSkills(),
    }).subscribe({
      next: (result) => {
        console.log('API returned');

        console.log('Employees:', result.employees.length);
        console.log('Departments:', result.departments.length);
        console.log('Skills:', result.skills.length);
        console.log('EmployeeSkills:', result.employeeSkills.length);

        this.employees = result.employees;
        this.departments = result.departments;
        this.skills = result.skills;
        this.employeeSkills = result.employeeSkills;

        setTimeout(() => {
          console.log('1 second later:', this.employees.length);
        }, 1000);
        console.log('Assigned Employees:', this.employees.length);

        this.loading = false;
      },

      error: (err) => {
        console.error('Dashboard Load Error', err);
        this.loading = false;
      },
    });
  }
  private loadDashboard(): void {
    this.api.getDashboard().subscribe({
      next: (dashboard) => {
        this.dashboard = dashboard;
      },
      error: (err: ApiError) => {
        this.error = err.message || 'Unable to load dashboard.';
      },
    });
  }
  private reloadDashboard(): void {
    //this.loadDashboard();
    this.loadDashboardData();
  }
}
