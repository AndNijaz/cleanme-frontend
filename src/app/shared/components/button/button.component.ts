import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-button',

  standalone: true,

  imports: [],
  templateUrl: './button.component.html',
})
export class ButtonComponent {
  @Input() type?: string;
  @Input() class?: string;
  @Output() clicked = new EventEmitter<void>();

  handleClick() {
    this.clicked.emit();
  }

  get getClass() {
    return `bg-gradient-to-r from-[#FFD749] to-[#FFD749] text-black font-medium py-2 px-6 rounded-full shadow-md hover:brightness-105 ${this.class}`;
  }
}
