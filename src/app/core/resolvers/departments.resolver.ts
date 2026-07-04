import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../services/api.service';
import { Department } from '../../shared/models/api.models';

@Injectable({ providedIn: 'root' })
export class DepartmentsResolver implements Resolve<Department[]> {
  constructor(private api: ApiService) {}

  resolve(): Observable<Department[]> {
    return this.api.getDepartments().pipe(catchError(() => of([])));
  }
}
