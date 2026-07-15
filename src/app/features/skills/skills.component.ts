import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { ApiError, Skill } from '../../shared/components/models/api.models';
import { NavigationLoadService } from '../../core/services/navigation-load.service';
import { SearchBoxComponent } from '../../shared/components/search-box/search-box.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { PageCardComponent } from '../../shared/components/page-card/page-card.component';
import { TableComponent } from '../../shared/components/table/table.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    SearchBoxComponent,
    PageCardComponent,
    TableComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css'],
})
export class SkillsComponent implements OnInit, OnDestroy {
  skills: Skill[] = [];
  filteredSkills: Skill[] = [];
  private destroy$ = new Subject<void>();
  form: Omit<Skill, 'id'> = { name: '', description: '', category: '' };
  editingId?: number;
  error = '';
  searchText = '';
  success = '';
  loading = false;

  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private navigationLoad = inject(NavigationLoadService);

  ngOnInit(): void {
    const resolved = this.route.snapshot.data['skills'] as Skill[] | undefined;
    if (resolved) {
      this.skills = resolved;
    } else {
      this.loadSkills();
    }
    this.navigationLoad.routeChange$.pipe(takeUntil(this.destroy$)).subscribe((route) => {
      if (route === '/skills') {
        this.loadSkills();
      }
    });
  }

  loadSkills(): void {
    this.api.getSkills().subscribe({
      next: (items) => (this.skills = items),
      error: (err: ApiError) => (this.error = err.message || 'Unable to load skills.'),
    });
  }

  save(): void {
    const request = this.editingId ? this.api.updateSkill(this.editingId, this.form) : this.api.createSkill(this.form);
    request.subscribe({
      next: () => {
        this.reset();
        this.loadSkills();
      },
      error: (err: ApiError) => (this.error = err.message || 'Unable to save skill.'),
    });
  }

  edit(skill: Skill): void {
    this.editingId = skill.id;
    this.form = { name: skill.name, description: skill.description, category: skill.category };
  }

  reset(): void {
    this.editingId = undefined;
    this.form = { name: '', description: '', category: '' };
    this.error = '';
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
    this.api.deleteSkill(this.selectedSkill.id).subscribe({
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
