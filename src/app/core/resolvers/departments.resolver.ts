import { inject, Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Department } from '../../shared/components/models/api.models';
import { DepartmentService } from '../../features/departments/services/department.service';

@Injectable({ providedIn: 'root' })
export class DepartmentsResolver implements Resolve<Department[]> {
  private api = inject(DepartmentService);

  resolve(): Observable<Department[]> {
    return this.api.getDepartments().pipe(catchError(() => of([])));
  }
}
