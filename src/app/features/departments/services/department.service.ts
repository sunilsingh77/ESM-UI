import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Department } from '../../../shared/components/models/api.models';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private readonly baseUrl = environment.apiUrl;

  private http = inject(HttpClient);

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
}
