import { Component } from '@angular/core';
import { ContainerComponent } from '../../../shared/components/container/container.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hero-section',
  imports: [ContainerComponent, RouterModule],
  templateUrl: './hero-section.component.html',
  standalone: true,
})
export class HeroSectionComponent {}
