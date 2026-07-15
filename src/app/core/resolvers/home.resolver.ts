import { inject, Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DashboardResponse } from '../../shared/components/models/api.models';
import { DashboardService } from '../../features/dashboard/services/dashboard.service';

@Injectable({ providedIn: 'root' })
export class HomeResolver implements Resolve<DashboardResponse> {
  private api = inject(DashboardService);

  resolve(): Observable<DashboardResponse> {
    return this.api.getDashboard().pipe(catchError(() => of({ message: '', email: '', roles: [] })));
  }
}
