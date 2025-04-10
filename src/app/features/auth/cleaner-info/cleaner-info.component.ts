import { Component } from '@angular/core';
import { InputComponent } from '../../../shared/components/input/input.component';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { ServiceCardComponent } from './service-card/service-card.component';
import { ServiceDescriptionCardComponent } from './service-description-card/service-description-card.component';
import { AvailabilityComponent } from './availability/availability.component';
import { CleanerInfoService } from '../../../core/services/cleaner-info.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cleaner-info',
  standalone: true,
  imports: [
    InputComponent,
    FormsModule,
    ButtonComponent,
    StepperModule,
    ButtonModule,
    CommonModule,
    ServiceCardComponent,
    ServiceDescriptionCardComponent,
    AvailabilityComponent,
  ],
  templateUrl: './cleaner-info.component.html',
})
export class CleanerInfoComponent {
  constructor(private router: Router) {}

  activeStep: number = 1;

  formPhone: string = '';
  formAddress: string = '';
  acceptPolicy: boolean = false;
  hourlyRate: number = 0;
  distance: number = 0;

  selectedServices: string[] = [];

  formCurrency: string = '0';
  formDistance: string = '0';

  services = [
    {
      src: 'icon-1.svg',
      text: 'Deep House Cleaning',
    },
    { src: 'icon-4.svg', text: 'Office Cleaning' },
    { src: 'icon-2.svg', text: 'Window Cleaning' },
    { src: 'icon-3.svg', text: 'Floor Cleaning' },
  ];

  handleServiceClicked(serviceName: string) {
    const index = this.selectedServices.indexOf(serviceName);

    if (index > -1) {
      this.selectedServices.splice(index, 1);
      this.descriptions = this.descriptions.filter(
        (d) => d.title !== serviceName
      );
    } else {
      this.selectedServices.push(serviceName);
      if (!this.descriptions.some((d) => d.title === serviceName)) {
        this.descriptions.push({ title: serviceName, description: '' });
      }
    }
  }

  activateCallback(step: number) {
    this.activeStep = step;
    if (this.validateStep(step)) {
      this.activeStep = step;
    } else {
      console.warn('Step validation failed. Cannot proceed.');
    }
  }

  descriptions: { title: string; description: string }[] = [];

  getIcon(title: string): string {
    const icons: Record<string, string> = {
      'Deep House Cleaning': 'icon-1.svg',
      'Office Cleaning': 'icon-4.svg',
      'Window Cleaning': 'icon-2.svg',
      'Floor Cleaning': 'icon-3.svg',
    };
    return icons[title] || 'default-icon.svg';
  }

  onNextStep() {
    if (this.validateStep(this.activeStep)) {
      this.activeStep++;
    } else {
      console.warn('Step validation failed. Cannot proceed.');
    }
  }

  onSubmit() {
    if (this.descriptions.length === 0) return;
    if (this.selectedServices.length === 0) return;
    if (this.formPhone.trim() === '') return;
    if (this.formAddress.trim() === '') return;
    if (+this.formCurrency <= 0) return;
    if (+this.formDistance <= 0) return;

    console.log('Form submitted with the following data:');
    console.log(this.descriptions);
    console.log('Selected services:', this.selectedServices);
    console.log('Phone:', this.formPhone);
    console.log('Address:', this.formAddress);
    console.log('Hourly Rate:', this.formCurrency);
    console.log('Distance:', this.formDistance);
    console.log('Accept Policy:', this.acceptPolicy);
    console.log('Selected services:', this.selectedServices);

    this.router.navigate(['/dashboard/cleaner']);
  }

  validateStep(step: number): boolean {
    switch (step) {
      case 1:
        // Step 1: At least 1 service selected
        if (this.selectedServices.length === 0) {
          alert('Please select at least one service.');
          return false;
        }
        return true;

      case 2:
        // Step 2: Each selected service must have a description
        if (this.descriptions.some((desc) => !desc.description.trim())) {
          alert('Please provide descriptions for all selected services.');
          return false;
        }
        return true;

      case 3:
        // Step 3: Availability validation
        // (Assuming you will add availability fields inside AvailabilityComponent and expose validation method)
        // For now, assume it’s always valid.
        return true;

      case 4:
        // Step 4: Phone, Address, Policy Acceptance, Hourly Rate, Distance
        if (!this.formPhone.trim() || !this.formAddress.trim()) {
          alert('Phone and Address are required.');
          return false;
        }
        if (!this.acceptPolicy) {
          alert('You must accept the Privacy Policy.');
          return false;
        }
        if (this.hourlyRate <= 0) {
          alert('Please enter a valid hourly rate.');
          return false;
        }
        if (this.distance <= 0) {
          alert('Please enter a valid distance.');
          return false;
        }
        return true;

      default:
        return true;
    }
  }
}
