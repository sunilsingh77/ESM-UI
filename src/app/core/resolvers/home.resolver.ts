import { inject, Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../services/api.service';
import { DashboardResponse } from '../../shared/components/models/api.models';

@Injectable({ providedIn: 'root' })
export class HomeResolver implements Resolve<DashboardResponse> {
  private api = inject(ApiService);

  resolve(): Observable<DashboardResponse> {
    return this.api.getDashboard().pipe(catchError(() => of({ message: '', email: '', roles: [] })));
  }
}
