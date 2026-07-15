import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { DashboardResponse } from '../../../shared/components/models/api.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly baseUrl = environment.apiUrl;

  private http = inject(HttpClient);

  getDashboard() {
    return this.http.get<DashboardResponse>(`${this.baseUrl}/home/dashboard`);
  }
}
