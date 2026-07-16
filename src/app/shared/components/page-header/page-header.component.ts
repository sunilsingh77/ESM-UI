import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.css'],
})
export class PageHeaderComponent {
  @Input()
  icon = '';

  @Input({ required: true })
  title = '';

  @Input()
  subtitle = '';

  @Input()
  badge = '';

  @Input()
  showDivider = true;

  @Output()
  action = new EventEmitter<void>();
}
