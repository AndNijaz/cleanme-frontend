import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-service-description-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './service-description-card.component.html',
})
export class ServiceDescriptionCardComponent {
  @Input() src!: string;
  @Input() title!: string;

  @Input() description!: string;
  @Output() descriptionChange = new EventEmitter<string>();

  onDescriptionChange(newValue: string) {
    this.description = newValue;
    this.descriptionChange.emit(newValue);
  }
}
