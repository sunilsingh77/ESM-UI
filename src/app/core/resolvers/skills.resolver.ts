import { inject, Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Skill } from '../../shared/components/models/api.models';
import { SkillService } from '../../features/skills/services/skill.service';

@Injectable({ providedIn: 'root' })
export class SkillsResolver implements Resolve<Skill[]> {
  private api = inject(SkillService);

  resolve(): Observable<Skill[]> {
    return this.api.getSkills().pipe(catchError(() => of([])));
  }
}
