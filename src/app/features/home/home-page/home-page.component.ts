import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ContainerComponent } from '../../../shared/components/container/container.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { NavbarComponent } from '../../../shared/navbar/navbar/navbar.component';
import { HeroSectionComponent } from '../hero-section/hero-section.component';
import { CallToActionComponent } from '../call-to-action/call-to-action.component';
import { FooterComponent } from '../../../shared/footer/footer/footer.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    RouterModule,
    ButtonComponent,
    NavbarComponent,
    HeroSectionComponent,
    CallToActionComponent,
    FooterComponent,
  ],
  templateUrl: './home-page.component.html',
})
export class HomePageComponent {}
