import { Routes } from '@angular/router';

import { LoginComponent } from './features/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AccountComponent } from './features/account/account.component';
import { DepartmentsComponent } from './features/departments/departments.component';
import { EmployeesComponent } from './features/employees/employees.component';
import { EmployeeSkillsComponent } from './features/employee-skills/employee-skills.component';
import { SkillsComponent } from './features/skills/skills.component';
import { ReportsComponent } from './features/reports/reports.component';

import { MainLayoutComponent } from './layouts/main-layout/main-layout';

import { AuthGuard } from './core/guards/auth.guard';
import { LoginRedirectGuard } from './core/guards/login-redirect.guard';
// import { RoleGuard } from './core/guards/role.guard';

import { DepartmentsResolver } from './core/resolvers/departments.resolver';
import { EmployeesResolver } from './core/resolvers/employees.resolver';
import { EmployeeSkillsResolver } from './core/resolvers/employee-skills.resolver';
import { SkillsResolver } from './core/resolvers/skills.resolver';

// Future
// import { NotFoundComponent } from './features/not-found/not-found.component';
// import { AccessDeniedComponent } from './features/access-denied/access-denied.component';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Login',
    component: LoginComponent,
    canActivate: [LoginRedirectGuard],
  },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],

    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        title: 'Dashboard',
        component: DashboardComponent,
      },

      {
        path: 'account',
        title: 'My Account',
        component: AccountComponent,
      },

      {
        path: 'departments',
        title: 'Departments',
        component: DepartmentsComponent,
        resolve: {
          departments: DepartmentsResolver,
        },

        // Future
        // canActivate: [RoleGuard],
        // data: {
        //   roles: ['Admin']
        // }
      },

      {
        path: 'employees',
        title: 'Employees',
        component: EmployeesComponent,
        resolve: {
          employees: EmployeesResolver,
        },
      },

      {
        path: 'employee-skills',
        title: 'Employee Skills',
        component: EmployeeSkillsComponent,
        resolve: {
          employeeSkills: EmployeeSkillsResolver,
        },
      },

      {
        path: 'skills',
        title: 'Skills',
        component: SkillsComponent,
        resolve: {
          skills: SkillsResolver,
        },
      },

      {
        path: 'reports',
        title: 'Reports',
        component: ReportsComponent,

        // Future
        // canActivate: [RoleGuard],
        // data: {
        //   roles: ['Admin']
        // }
      },
    ],
  },

  // Future
  /*
  {
      path: 'access-denied',
      title: 'Access Denied',
      component: AccessDeniedComponent
  },

  {
      path: '**',
      title: 'Page Not Found',
      component: NotFoundComponent
  }
  */

  {
    path: '**',
    redirectTo: 'home',
  },
];
