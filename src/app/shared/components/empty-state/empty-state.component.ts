import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.css'],
})
export class EmptyStateComponent {
  @Input()
  icon = 'bi bi-folder-x';

  @Input()
  title = 'No Records Found';

  @Input()
  description = 'There is no data available.';
}
