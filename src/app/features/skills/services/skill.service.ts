import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Skill } from '../../../shared/components/models/api.models';

@Injectable({ providedIn: 'root' })
export class SkillService {
  private readonly baseUrl = environment.apiUrl;

  private http = inject(HttpClient);

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
}
