import { Component } from '@angular/core';
import { ContainerComponent } from '../../../shared/components/container/container.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hero-section',
  imports: [ContainerComponent, ButtonComponent, RouterModule],
  templateUrl: './hero-section.component.html',
  standalone: true,
})
export class HeroSectionComponent {}
