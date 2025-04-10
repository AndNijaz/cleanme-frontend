import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-service-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-card.component.html',
})
export class ServiceCardComponent {
  @Input() src!: string; // Icon source
  @Input() text!: string; // Text to display
  @Input() class?: string;
  @Input() selected: boolean = false;

  @Output() cardClicked = new EventEmitter<string>(); // Emits the text when clicked

  onClick() {
    this.cardClicked.emit(this.text);
  }
}
