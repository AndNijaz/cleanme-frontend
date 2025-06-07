import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { HeroSectionComponent } from '../hero-section/hero-section.component';
import { FooterComponent } from '../../../shared/components/toggle-button/footer/footer.component';
import { HowItWorksComponent } from '../how-it-works/how-it-works.component';
import { WhyChooseComponent } from '../why-choose/why-choose.component';
import { TestimonialsComponent } from '../testimonials/testimonials.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    RouterModule,
    NavbarComponent,
    HeroSectionComponent,
    FooterComponent,
    HowItWorksComponent,
    WhyChooseComponent,
    TestimonialsComponent,
  ],
  templateUrl: './home-page.component.html',
})
export class HomePageComponent {}
