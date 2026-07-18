import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { NavigationLoadService } from '../../core/services/navigation-load.service';
import { SearchBoxComponent } from '../../shared/components/search-box/search-box.component';
import { PageCardComponent } from '../../shared/components/page-card/page-card.component';
import { TableComponent } from '../../shared/components/table/table.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { SkillService } from './services/skill.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ApiError, Skill } from '../../shared/components/models/api.models';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SearchBoxComponent,
    PageCardComponent,
    TableComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
    PageHeaderComponent,
  ],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css'],
})
export class SkillsComponent implements OnInit, OnDestroy {
  skills: Skill[] = [];
  saving = false;
  filteredSkills: Skill[] = [];
  private destroy$ = new Subject<void>();
  skillForm!: FormGroup;
  private fb = inject(FormBuilder);
  editingId?: number;
  error = '';
  searchText = '';
  success = '';
  loading = false;
  submitted = false;
  private skillService = inject(SkillService);
  private route = inject(ActivatedRoute);
  private navigationLoad = inject(NavigationLoadService);

  ngOnInit(): void {
    // Initialize Reactive Form
    this.skillForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      category: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
    });

    // Load data from resolver
    const resolved = this.route.snapshot.data['skills'] as Skill[] | undefined;

    if (resolved) {
      this.skills = [...resolved];
      this.filteredSkills = [...resolved];
    } else {
      this.loadSkills();
    }

    // Reload when navigating back to Skills page
    this.navigationLoad.routeChange$.pipe(takeUntil(this.destroy$)).subscribe((route) => {
      if (route === '/skills') {
        this.loadSkills();
      }
    });
  }
  get f(): FormGroup['controls'] {
    return this.skillForm.controls;
  }

  private loadSkills(): void {
    this.loading = true;
    this.error = '';

    this.skillService.getSkills().subscribe({
      next: (items) => {
        this.skills = [...items];
        this.applyFilter(); // Keeps search results after reload
        this.loading = false;
      },
      error: (err: ApiError) => {
        this.loading = false;
        this.error = err.message || 'Unable to load skills.';
      },
    });
  }
  save(): void {
    this.submitted = true;
    this.error = '';
    this.success = '';

    if (this.skillForm.invalid) {
      this.skillForm.markAllAsTouched();
      return;
    }

    this.saving = true;

    const request = this.editingId
      ? this.skillService.updateSkill(this.editingId, this.skillForm.value)
      : this.skillService.createSkill(this.skillForm.value);

    request.subscribe({
      next: () => {
        this.success = this.editingId ? 'Skill updated successfully.' : 'Skill created successfully.';

        this.reset();
        this.loadSkills();

        this.saving = false;

        setTimeout(() => {
          this.success = '';
        }, 3000);
      },

      error: (err: ApiError) => {
        this.saving = false;
        this.error = err.message || 'Unable to save skill.';
      },
    });
  }

  edit(skill: Skill): void {
    this.editingId = skill.id;
    this.skillForm.patchValue({
      name: skill.name,
      category: skill.category,
      description: skill.description,
    });
  }

  reset(): void {
    this.editingId = undefined;
    this.submitted = false;
    this.success = '';
    this.error = '';

    this.skillForm.reset({
      name: '',
      category: '',
      description: '',
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public applyFilter(): void {
    const keyword = this.searchText.trim().toLowerCase();

    if (!keyword) {
      this.filteredSkills = [...this.skills];
      return;
    }

    this.filteredSkills = this.skills.filter(
      (x) => x.name.toLowerCase().includes(keyword) || x.description.toLowerCase().includes(keyword)
    );
  }

  showDeleteDialog = false;
  selectedSkill: Skill | null = null;

  public delete(skill: Skill): void {
    this.selectedSkill = skill;
    this.showDeleteDialog = true;
  }

  public confirmDelete(): void {
    if (!this.selectedSkill) {
      return;
    }
    this.skillService.deleteSkill(this.selectedSkill.id).subscribe({
      next: () => {
        this.showDeleteDialog = false;
        this.selectedSkill = null;
        this.loadSkills();
      },
      error: () => {
        this.showDeleteDialog = false;
      },
    });
  }

  cancelDelete(): void {
    this.showDeleteDialog = false;
  }
}
