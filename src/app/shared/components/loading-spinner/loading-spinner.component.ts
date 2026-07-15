import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.css'],
})
export class LoadingSpinnerComponent {
  @Input()
  message = 'Loading...';

  @Input()
  fullHeight = false;
  readonly loading$ = inject(LoadingService).loading$;
}
