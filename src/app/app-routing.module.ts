import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginRedirectGuard } from './core/guards/login-redirect.guard';
import { HomeComponent } from './components/home/home.component';
import { AccountComponent } from './components/account/account.component';
import { DepartmentsComponent } from './components/departments/departments.component';
import { EmployeesComponent } from './components/employees/employees.component';
import { EmployeeSkillsComponent } from './components/employee-skills/employee-skills.component';
import { SkillsComponent } from './components/skills/skills.component';
import { HomeResolver } from './core/resolvers/home.resolver';
import { DepartmentsResolver } from './core/resolvers/departments.resolver';
import { EmployeesResolver } from './core/resolvers/employees.resolver';
import { EmployeeSkillsResolver } from './core/resolvers/employee-skills.resolver';
import { SkillsResolver } from './core/resolvers/skills.resolver';

const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [LoginRedirectGuard] },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard], resolve: { dashboard: HomeResolver } },
  { path: 'account', component: AccountComponent, canActivate: [AuthGuard] },
  { path: 'departments', component: DepartmentsComponent, canActivate: [AuthGuard], resolve: { departments: DepartmentsResolver } },
  { path: 'employees', component: EmployeesComponent, canActivate: [AuthGuard], resolve: { employees: EmployeesResolver } },
  { path: 'employee-skills', component: EmployeeSkillsComponent, canActivate: [AuthGuard], resolve: { employeeSkills: EmployeeSkillsResolver } },
  { path: 'skills', component: SkillsComponent, canActivate: [AuthGuard], resolve: { skills: SkillsResolver } },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
