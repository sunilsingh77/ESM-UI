import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-card.component.html',
  styleUrls: ['./page-card.component.css'],
})
export class PageCardComponent {
  @Input()
  title = '';

  @Input()
  subtitle = '';

  @Input()
  icon = '';

  @Input()
  badge: string | number | null = null;

  @Input()
  showHeader = true;

  @Input()
  showDivider = true;

  @Input()
  hover = false;
}
