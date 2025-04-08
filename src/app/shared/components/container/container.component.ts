import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-container',
  standalone: true,
  imports: [],
  templateUrl: './container.component.html',
})
export class ContainerComponent {
  @Input() class?: string;

  get baseClass() {
    return `w-full px-4 sm:px-6 md:px-8 mx-auto max-w-7xl ${this.class}`;
  }
}

