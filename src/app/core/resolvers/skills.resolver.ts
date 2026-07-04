import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../services/api.service';
import { Skill } from '../../shared/models/api.models';

@Injectable({ providedIn: 'root' })
export class SkillsResolver implements Resolve<Skill[]> {
  constructor(private api: ApiService) {}

  resolve(): Observable<Skill[]> {
    return this.api.getSkills().pipe(catchError(() => of([])));
  }
}
