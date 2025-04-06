import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-toggle-button',
  standalone: true,
  imports: [],
  templateUrl: './toggle-button.component.html',
})
export class ToggleButtonComponent {
  @Input({ required: true }) options: string[] = ['', ''];
  @Input() selectedOption?: number = 0;
  @Output() toggleUserType = new EventEmitter<number>();

  setSelectOption(option: number): void {
    this.selectedOption = option;
    this.toggleUserType.emit(this.selectedOption);
  }
}
