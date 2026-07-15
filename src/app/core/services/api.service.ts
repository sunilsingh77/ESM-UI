import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Department,
  Employee,
  EmployeeSkill,
  DashboardResponse,
  RegisterRequest,
  Skill,
} from '../../shared/components/models/api.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = 'https://localhost:7093/api';

  private http = inject(HttpClient);

  getDashboard() {
    return this.http.get<DashboardResponse>(`${this.baseUrl}/home/dashboard`);
  }

  registerUser(request: RegisterRequest) {
    return this.http.post(`${this.baseUrl}/account/register`, request);
  }

  getDepartments() {
    return this.http.get<Department[]>(`${this.baseUrl}/departments`);
  }

  createDepartment(request: Omit<Department, 'id'>) {
    return this.http.post<Department>(`${this.baseUrl}/departments`, request);
  }

  updateDepartment(id: number, request: Omit<Department, 'id'>) {
    return this.http.put(`${this.baseUrl}/departments/${id}`, request);
  }

  deleteDepartment(id: number) {
    return this.http.delete(`${this.baseUrl}/departments/${id}`);
  }

  getSkills() {
    return this.http.get<Skill[]>(`${this.baseUrl}/skills`);
  }

  createSkill(request: Omit<Skill, 'id'>) {
    return this.http.post<Skill>(`${this.baseUrl}/skills`, request);
  }

  updateSkill(id: number, request: Omit<Skill, 'id'>) {
    return this.http.put(`${this.baseUrl}/skills/${id}`, request);
  }

  deleteSkill(id: number) {
    return this.http.delete(`${this.baseUrl}/skills/${id}`);
  }

  getEmployees() {
    return this.http.get<Employee[]>(`${this.baseUrl}/employees`);
  }

  createEmployee(request: Omit<Employee, 'id' | 'departmentName' | 'skills'>) {
    return this.http.post<Employee>(`${this.baseUrl}/employees`, request);
  }

  updateEmployee(id: number, request: Omit<Employee, 'id' | 'departmentName' | 'hireDate' | 'skills'>) {
    return this.http.put(`${this.baseUrl}/employees/${id}`, request);
  }

  deleteEmployee(id: number) {
    return this.http.delete(`${this.baseUrl}/employees/${id}`);
  }

  getEmployeeSkills() {
    return this.http.get<EmployeeSkill[]>(`${this.baseUrl}/employeeskills`);
  }

  createEmployeeSkill(request: Omit<EmployeeSkill, 'id' | 'skillName' | 'acquiredDate'>) {
    return this.http.post<EmployeeSkill>(`${this.baseUrl}/employeeskills`, request);
  }

  updateEmployeeSkill(
    id: number,
    request: Pick<EmployeeSkill, 'proficiencyLevel' | 'yearsOfExperience' | 'isPrimary'>
  ) {
    return this.http.put(`${this.baseUrl}/employeeskills/${id}`, request);
  }

  deleteEmployeeSkill(id: number) {
    return this.http.delete(`${this.baseUrl}/employeeskills/${id}`);
  }
}
