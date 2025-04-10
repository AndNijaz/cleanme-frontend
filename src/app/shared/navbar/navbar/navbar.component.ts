import { Component } from '@angular/core';
import { ContainerComponent } from '../../components/container/container.component';
import { ButtonComponent } from '../../components/button/button.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [ContainerComponent, ButtonComponent, RouterModule],
  templateUrl: './navbar.component.html',
  standalone: true,
})
export class NavbarComponent {}
