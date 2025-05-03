import { Component, Input } from '@angular/core';
import { ContainerComponent } from '../../components/container/container.component';
import { ButtonComponent } from '../../components/button/button.component';
import { RouterModule } from '@angular/router';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [ContainerComponent, ButtonComponent, RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  standalone: true,
})
export class NavbarComponent {
  @Input() variant: 'default' | 'dashboard' = 'default';
}
