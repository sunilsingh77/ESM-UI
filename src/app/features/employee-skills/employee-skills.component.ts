import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { ApiError, Employee, EmployeeSkill, Skill } from '../../shared/models/api.models';
import { NavigationLoadService } from '../../core/services/navigation-load.service';

type EmployeeSkillForm = Omit<EmployeeSkill, 'id' | 'skillName' | 'acquiredDate'>;

@Component({
  selector: 'app-employee-skills',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-skills.component.html',
  styleUrls: ['./employee-skills.component.css'],
})
export class EmployeeSkillsComponent implements OnInit, OnDestroy {
  employeeSkills: EmployeeSkill[] = [];
  private destroy$ = new Subject<void>();
  employees: Employee[] = [];
  skills: Skill[] = [];
  form: EmployeeSkillForm = this.emptyForm();
  editingId?: number;
  error = '';

  constructor(private api: ApiService, private route: ActivatedRoute, private navigationLoad: NavigationLoadService) {}

  ngOnInit(): void {
    const resolved = this.route.snapshot.data['employeeSkills'] as EmployeeSkill[] | undefined;
    if (resolved) {
      this.employeeSkills = resolved;
    } else {
      this.load();
    }
    this.api.getEmployees().subscribe({ next: (items) => this.employees = items });
    this.api.getSkills().subscribe({ next: (items) => this.skills = items });
    this.navigationLoad.routeChange$.pipe(takeUntil(this.destroy$)).subscribe((route) => {
      if (route === '/employee-skills') {
        this.load();
      }
    });
  }

  load(): void {
    this.api.getEmployeeSkills().subscribe({
      next: (items) => this.employeeSkills = items,
      error: (err: ApiError) => this.error = err.message || 'Unable to load employee skills.'
    });
  }

  save(): void {
    const payload = {
      ...this.form,
      employeeId: Number(this.form.employeeId),
      skillId: Number(this.form.skillId),
      yearsOfExperience: Number(this.form.yearsOfExperience)
    };
    const request = this.editingId
      ? this.api.updateEmployeeSkill(this.editingId, payload)
      : this.api.createEmployeeSkill(payload);

    request.subscribe({
      next: () => {
        this.reset();
        this.load();
      },
      error: (err: ApiError) => this.error = err.message || 'Unable to save employee skill.'
    });
  }

  edit(item: EmployeeSkill): void {
    this.editingId = item.id;
    this.form = {
      employeeId: item.employeeId,
      skillId: item.skillId,
      proficiencyLevel: item.proficiencyLevel,
      yearsOfExperience: item.yearsOfExperience,
      isPrimary: item.isPrimary
    };
  }

  delete(id: number): void {
    this.api.deleteEmployeeSkill(id).subscribe({
      next: () => this.load(),
      error: (err: ApiError) => this.error = err.message || 'Unable to delete employee skill.'
    });
  }

  employeeName(id: number): string {
    const employee = this.employees.find((item) => item.id === id);
    return employee ? `${employee.firstName} ${employee.lastName}` : `Employee #${id}`;
  }

  reset(): void {
    this.editingId = undefined;
    this.form = this.emptyForm();
    this.error = '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private emptyForm(): EmployeeSkillForm {
    return {
      employeeId: 0,
      skillId: 0,
      proficiencyLevel: 'Beginner',
      yearsOfExperience: 0,
      isPrimary: false
    };
  }
}
