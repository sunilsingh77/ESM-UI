import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Employee } from '../../../shared/components/models/api.models';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly baseUrl = environment.apiUrl;

  private http = inject(HttpClient);

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
}
