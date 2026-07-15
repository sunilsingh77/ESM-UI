import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
  DashboardResponse,
  Department,
  Employee,
  EmployeeSkill,
  Skill,
} from '../../shared/components/models/api.models';

@Injectable({ providedIn: 'root' })
export class DataPrefetchService {
  private dashboard?: DashboardResponse;
  private departments?: Department[];
  private employees?: Employee[];
  private employeeSkills?: EmployeeSkill[];
  private skills?: Skill[];

  private api = inject(ApiService);

  getDashboard(): Observable<DashboardResponse> {
    if (this.dashboard) {
      return of(this.dashboard);
    }
    return this.api.getDashboard().pipe(tap((value) => (this.dashboard = value)));
  }

  getDepartments(): Observable<Department[]> {
    if (this.departments) {
      return of(this.departments);
    }
    return this.api.getDepartments().pipe(tap((value) => (this.departments = value)));
  }

  getEmployees(): Observable<Employee[]> {
    if (this.employees) {
      return of(this.employees);
    }
    return this.api.getEmployees().pipe(tap((value) => (this.employees = value)));
  }

  getEmployeeSkills(): Observable<EmployeeSkill[]> {
    if (this.employeeSkills) {
      return of(this.employeeSkills);
    }
    return this.api.getEmployeeSkills().pipe(tap((value) => (this.employeeSkills = value)));
  }

  getSkills(): Observable<Skill[]> {
    if (this.skills) {
      return of(this.skills);
    }
    return this.api.getSkills().pipe(tap((value) => (this.skills = value)));
  }

  clearCache(route: string): void {
    switch (route) {
      case '/home':
        this.dashboard = undefined;
        break;
      case '/departments':
        this.departments = undefined;
        break;
      case '/employees':
        this.employees = undefined;
        break;
      case '/employee-skills':
        this.employeeSkills = undefined;
        break;
      case '/skills':
        this.skills = undefined;
        break;
    }
  }
}
