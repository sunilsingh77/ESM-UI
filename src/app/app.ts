import { Component, signal } from '@angular/core';
import {
  Router,
  RouterOutlet,
  NavigationEnd
} from '@angular/router';
import { filter } from 'rxjs/operators';

import { FooterComponent } from './shared/components/footer/footer.component';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
 imports: [
    CommonModule,
    RouterOutlet
],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  protected readonly title = signal('employee-skills-client');

  // Controls visibility of Navigation & Footer
  showNavigation = false;

  constructor(private router: Router) {

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {

        this.showNavigation = this.router.url !== '/login';

      });

  }
}