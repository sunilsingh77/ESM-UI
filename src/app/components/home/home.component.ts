import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { DashboardResponse, ApiError, Employee, EmployeeSkill, Skill } from '../../shared/models/api.models';
import { NavigationLoadService } from '../../core/services/navigation-load.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit, OnDestroy {
  dashboard?: DashboardResponse;
  error = '';
  employees: Employee[] = [];
  skills: Skill[] = [];
  employeeSkills: EmployeeSkill[] = [];
  searchTerm = '';
  selectedEmployeeId = 0;
  seedMessage = '';
  private destroy$ = new Subject<void>();

  constructor(private api: ApiService, private route: ActivatedRoute, private navigationLoad: NavigationLoadService) {}

  ngOnInit(): void {
    const resolved = this.route.snapshot.data['dashboard'] as DashboardResponse | undefined;
    if (resolved) {
      this.dashboard = resolved;
    } else {
      this.api.getDashboard().subscribe({
        next: (dashboard) => this.dashboard = dashboard,
        error: (err: ApiError) => this.error = err.message || 'Unable to load dashboard.'
      });
    }

    // preload lists for search and summary
    this.api.getEmployees().subscribe({ next: (items) => this.employees = items });
    this.api.getSkills().subscribe({ next: (items) => this.skills = items });
    this.api.getEmployeeSkills().subscribe({ next: (items) => this.employeeSkills = items });

    this.navigationLoad.routeChange$.pipe(takeUntil(this.destroy$)).subscribe((route) => {
      if (route === '/home') {
        this.api.getDashboard().subscribe({
          next: (dashboard) => this.dashboard = dashboard,
          error: (err: ApiError) => this.error = err.message || 'Unable to load dashboard.'
        });
      }
    });
  }

  searchByName(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return;
    const found = this.employees.find(e => `${e.firstName} ${e.lastName}`.toLowerCase().includes(term));
    this.selectedEmployeeId = found ? found.id : 0;
  }

  seedDefaults(): void {
    this.seedMessage = 'Seeding default data...';

    // Load current data then create missing entities in sequence
    this.api.getDepartments().subscribe({
      next: (departments) => {
        const createDepartments = departments.length === 0;
        const createSkills = () => this.api.getSkills().subscribe({
          next: (skills) => {
            const needSkills = skills.length === 0;
            const createEmployees = () => this.api.getEmployees().subscribe({
              next: (employees) => {
                const needEmployees = employees.length === 0;
                const createEmployeeSkills = () => this.api.getEmployeeSkills().subscribe({
                  next: (es) => {
                    const needES = es.length === 0;
                    if (needES && employees.length > 0 && skills.length > 0) {
                      // simple mapping: give first employee first two skills
                      const payloads = [
                        { employeeId: employees[0].id, skillId: skills[0].id, proficiencyLevel: 'Intermediate', yearsOfExperience: 2, isPrimary: true },
                        { employeeId: employees[0].id, skillId: skills[1].id, proficiencyLevel: 'Beginner', yearsOfExperience: 1, isPrimary: false }
                      ];
                      let done = 0;
                      payloads.forEach(p => this.api.createEmployeeSkill(p as any).subscribe({ next: () => { done++; if (done === payloads.length) this.seedMessage = 'Seeding complete.'; }, error: () => this.seedMessage = 'Seeding encountered errors.' }));
                    } else {
                      this.seedMessage = 'Seeding complete.';
                    }
                  }, error: () => this.seedMessage = 'Unable to check employee skills.'
                });

                if (needEmployees && departments.length > 0) {
                  const deptId = departments[0].id;
                  const empPayload = { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', phoneNumber: '555-0100', position: 'Engineer', departmentId: deptId, hireDate: new Date().toISOString() };
                  this.api.createEmployee(empPayload as any).subscribe({ next: () => createEmployeeSkills(), error: () => this.seedMessage = 'Unable to create employees.' });
                } else {
                  createEmployeeSkills();
                }
              }, error: () => this.seedMessage = 'Unable to check employees.'
            });

            if (needSkills) {
              const skillPayloads = [
                { name: 'Angular', description: 'Frontend framework', category: 'Frontend' },
                { name: 'TypeScript', description: 'Typed JS', category: 'Frontend' }
              ];
              let done = 0;
              skillPayloads.forEach(s => this.api.createSkill(s as any).subscribe({ next: () => { done++; if (done === skillPayloads.length) createEmployees(); }, error: () => this.seedMessage = 'Unable to create skills.' }));
            } else {
              createEmployees();
            }
          }, error: () => this.seedMessage = 'Unable to check skills.'
        });

        if (createDepartments) {
          const deptPayloads = [
            { name: 'Engineering', description: 'Engineering team' },
            { name: 'HR', description: 'Human Resources' }
          ];
          let done = 0;
          deptPayloads.forEach(d => this.api.createDepartment(d as any).subscribe({ next: () => { done++; if (done === deptPayloads.length) createSkills(); }, error: () => this.seedMessage = 'Unable to create departments.' }));
        } else {
          createSkills();
        }
      }, error: () => this.seedMessage = 'Unable to check departments.'
    });
  }

  employeeSkillsForSelected(): EmployeeSkill[] {
    return this.employeeSkills.filter(es => es.employeeId === this.selectedEmployeeId);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
