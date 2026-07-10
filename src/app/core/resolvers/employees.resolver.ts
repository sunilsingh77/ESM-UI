import { inject, Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../services/api.service';
import { Employee } from '../../shared/models/api.models';

@Injectable({ providedIn: 'root' })
export class EmployeesResolver implements Resolve<Employee[]> {
  private api = inject(ApiService);

  resolve(): Observable<Employee[]> {
    return this.api.getEmployees().pipe(catchError(() => of([])));
  }
}
