import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ApiError, Skill } from '../../shared/models/api.models';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './skills.component.html'
})
export class SkillsComponent implements OnInit {
  skills: Skill[] = [];
  form: Omit<Skill, 'id'> = { name: '', description: '', category: '' };
  editingId?: number;
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.getSkills().subscribe({
      next: (items) => this.skills = items,
      error: (err: ApiError) => this.error = err.message || 'Unable to load skills.'
    });
  }

  save(): void {
    const request = this.editingId ? this.api.updateSkill(this.editingId, this.form) : this.api.createSkill(this.form);
    request.subscribe({
      next: () => {
        this.reset();
        this.load();
      },
      error: (err: ApiError) => this.error = err.message || 'Unable to save skill.'
    });
  }

  edit(skill: Skill): void {
    this.editingId = skill.id;
    this.form = { name: skill.name, description: skill.description, category: skill.category };
  }

  delete(id: number): void {
    this.api.deleteSkill(id).subscribe({
      next: () => this.load(),
      error: (err: ApiError) => this.error = err.message || 'Unable to delete skill.'
    });
  }

  reset(): void {
    this.editingId = undefined;
    this.form = { name: '', description: '', category: '' };
    this.error = '';
  }
}
