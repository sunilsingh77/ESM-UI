import { Component, EventEmitter, Input, Output } from '@angular/core';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search-box',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.css'],
})
export class SearchBoxComponent {
  @Input()
  placeholder = 'Search...';

  @Input()
  value = '';

  @Output()
  valueChange = new EventEmitter<string>();

  @Output()
  search = new EventEmitter<void>();

  public onInput(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.value = input.value;

    this.valueChange.emit(this.value);
  }

  public onSearch(): void {
    this.search.emit();
  }

  public clear(): void {
    this.value = '';

    this.valueChange.emit('');

    this.search.emit();
  }
}
