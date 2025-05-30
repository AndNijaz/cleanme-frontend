import { Component } from '@angular/core';
import { ContainerComponent } from '../../container/container.component';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  standalone: true,
})
export class FooterComponent {
  get currentYear(): number {
    return new Date().getFullYear();
  }
}
