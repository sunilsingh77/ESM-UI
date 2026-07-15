import { inject, Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Employee } from '../../shared/components/models/api.models';
import { EmployeeService } from '../../features/employees/services/employee.service';

@Injectable({ providedIn: 'root' })
export class EmployeesResolver implements Resolve<Employee[]> {
  private api = inject(EmployeeService);

  resolve(): Observable<Employee[]> {
    return this.api.getEmployees().pipe(catchError(() => of([])));
  }
}
