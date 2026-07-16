import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-action-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './action-toolbar.component.html',
  styleUrls: ['./action-toolbar.component.css'],
})
export class ActionToolbarComponent {
  @Input()
  searchText = '';

  @Input()
  placeholder = 'Search...';

  @Input()
  buttonText = '';

  @Input()
  buttonIcon = 'bi-plus-circle';

  @Input()
  showButton = true;

  @Input()
  showSearch = true;

  @Input()
  buttonClass = 'btn btn-primary';

  @Output()
  searchTextChange = new EventEmitter<string>();

  @Output()
  add = new EventEmitter<void>();

  onSearch(value: string): void {
    this.searchText = value;
    this.searchTextChange.emit(value);
  }

  onAdd(): void {
    this.add.emit();
  }
}
