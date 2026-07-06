import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { ApiError, Department } from '../../shared/models/api.models';
import { NavigationLoadService } from '../../core/services/navigation-load.service';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './departments.component.html'
})
export class DepartmentsComponent implements OnInit, OnDestroy {
  departments: Department[] = [];
  private destroy$ = new Subject<void>();
  form: Omit<Department, 'id'> = { name: '', description: '' };
  editingId?: number;
  error = '';

  constructor(private api: ApiService, private route: ActivatedRoute, private navigationLoad: NavigationLoadService) {}

  ngOnInit(): void {
    const resolved = this.route.snapshot.data['departments'] as Department[] | undefined;
    if (resolved) {
      this.departments = resolved;
    } else {
      this.load();
    }
    this.navigationLoad.routeChange$.pipe(takeUntil(this.destroy$)).subscribe((route) => {
      if (route === '/departments') {
        this.load();
      }
    });
  }

  load(): void {
    this.api.getDepartments().subscribe({
      next: (items) => this.departments = items,
      error: (err: ApiError) => this.error = err.message || 'Unable to load departments.'
    });
  }

  save(): void {
    const request = this.editingId
      ? this.api.updateDepartment(this.editingId, this.form)
      : this.api.createDepartment(this.form);

    request.subscribe({
      next: () => {
        this.reset();
        this.load();
      },
      error: (err: ApiError) => this.error = err.message || 'Unable to save department.'
    });
  }

  edit(item: Department): void {
    this.editingId = item.id;
    this.form = { name: item.name, description: item.description };
  }

  delete(id: number): void {
    this.api.deleteDepartment(id).subscribe({
      next: () => this.load(),
      error: (err: ApiError) => this.error = err.message || 'Unable to delete department.'
    });
  }

  reset(): void {
    this.editingId = undefined;
    this.form = { name: '', description: '' };
    this.error = '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
