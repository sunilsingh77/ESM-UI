import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { EmployeeSkill } from '../../../shared/components/models/api.models';

@Injectable({ providedIn: 'root' })
export class EmployeeSkillService {
  private readonly baseUrl = environment.apiUrl;

  private http = inject(HttpClient);

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
