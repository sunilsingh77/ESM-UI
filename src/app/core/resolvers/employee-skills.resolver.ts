import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../services/api.service';
import { EmployeeSkill } from '../../shared/models/api.models';

@Injectable({ providedIn: 'root' })
export class EmployeeSkillsResolver implements Resolve<EmployeeSkill[]> {
  constructor(private api: ApiService) {}

  resolve(): Observable<EmployeeSkill[]> {
    return this.api.getEmployeeSkills().pipe(catchError(() => of([])));
  }
}
