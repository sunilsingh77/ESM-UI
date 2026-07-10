import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AccountComponent } from './features/account/account.component';
import { DepartmentsComponent } from './features/departments/departments.component';
import { EmployeesComponent } from './features/employees/employees.component';
import { EmployeeSkillsComponent } from './features/employee-skills/employee-skills.component';
import { SkillsComponent } from './features/skills/skills.component';
import { LoginRedirectGuard } from './core/guards/login-redirect.guard';
import { AuthGuard } from './core/guards/auth.guard';
import { HomeResolver } from './core/resolvers/home.resolver';
import { DepartmentsResolver } from './core/resolvers/departments.resolver';
import { EmployeesResolver } from './core/resolvers/employees.resolver';
import { EmployeeSkillsResolver } from './core/resolvers/employee-skills.resolver';
import { SkillsResolver } from './core/resolvers/skills.resolver';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';
import { ReportsComponent } from './features/reports/reports.component';

export const routes: Routes = [

  {
    path: 'login',
    component: LoginComponent,
    canActivate: [LoginRedirectGuard]
  },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [

      {
        path: 'home',
        component: DashboardComponent,
        resolve: { dashboard: HomeResolver }
      },

      {
        path: 'account',
        component: AccountComponent
      },

      {
        path: 'departments',
        component: DepartmentsComponent,
        resolve: { departments: DepartmentsResolver }
      },

      {
        path: 'employees',
        component: EmployeesComponent,
        resolve: { employees: EmployeesResolver }
      },

      {
        path: 'employee-skills',
        component: EmployeeSkillsComponent,
        resolve: { employeeSkills: EmployeeSkillsResolver }
      },

      {
        path: 'skills',
        component: SkillsComponent,
        resolve: { skills: SkillsResolver }
      },


      {
        path: 'reports',
        component: ReportsComponent,
        //resolve: { reports: ReportsComponent }
      },


      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }

    ]
  },

  {
    path: '**',
    redirectTo: 'home'
  }

];