import { Component } from '@angular/core';
import { PageCardComponent } from '../../shared/components/page-card/page-card.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-reports',
  imports: [PageCardComponent, PageHeaderComponent],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css',
})
export class ReportsComponent {}
