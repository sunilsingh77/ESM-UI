import { inject, Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../services/api.service';
import { EmployeeSkill } from '../../shared/components/models/api.models';

@Injectable({ providedIn: 'root' })
export class EmployeeSkillsResolver implements Resolve<EmployeeSkill[]> {
  private api = inject(ApiService);

  resolve(): Observable<EmployeeSkill[]> {
    return this.api.getEmployeeSkills().pipe(catchError(() => of([])));
  }
}
