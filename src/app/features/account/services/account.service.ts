import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { RegisterRequest } from '../../../shared/components/models/api.models';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly baseUrl = environment.apiUrl;

  private http = inject(HttpClient);

  registerUser(request: RegisterRequest) {
    return this.http.post(`${this.baseUrl}/account/register`, request);
  }
}
