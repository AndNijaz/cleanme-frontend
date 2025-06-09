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
    return `cursor-pointer bg-gradient-to-r from-[#FFD749] to-[#FFD749] text-black font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl hover:brightness-105 transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 ${this.class}`;
  }
}
