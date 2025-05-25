import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [],
  templateUrl: './card.component.html',
})
export class CardComponent {
  @Input() class?: string;

  get baseClass() {
    return `bg-white p-6 rounded-4xl shadow-lg w-full z-10 relative ${this.class}`;
  }
}
