import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { DashboardResponse, ApiError } from '../../shared/models/api.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  dashboard?: DashboardResponse;
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getDashboard().subscribe({
      next: (dashboard) => this.dashboard = dashboard,
      error: (err: ApiError) => this.error = err.message || 'Unable to load dashboard.'
    });
  }
}
