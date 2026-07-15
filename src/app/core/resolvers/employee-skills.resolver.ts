import { inject, Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EmployeeSkill } from '../../shared/components/models/api.models';
import { EmployeeSkillService } from '../../features/employee-skills/services/employee-skill.service';

@Injectable({ providedIn: 'root' })
export class EmployeeSkillsResolver implements Resolve<EmployeeSkill[]> {
  private api = inject(EmployeeSkillService);

  resolve(): Observable<EmployeeSkill[]> {
    return this.api.getEmployeeSkills().pipe(catchError(() => of([])));
  }
}
