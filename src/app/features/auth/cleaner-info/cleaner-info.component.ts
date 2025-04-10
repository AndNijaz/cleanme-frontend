import { Component, ViewChild } from '@angular/core';
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
import { LineErrorComponent } from './line-error/line-error.component';

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
    LineErrorComponent,
  ],
  templateUrl: './cleaner-info.component.html',
})
export class CleanerInfoComponent {
  constructor(private router: Router) {}

  @ViewChild(AvailabilityComponent) availabilityComp!: AvailabilityComponent;

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

  step1Error: string = '';
  step2Error: string = '';
  step3Error: string = '';
  step4Error: string = '';

  handleServiceClicked(serviceName: string) {
    this.step1Error = '';
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

  activateCallback(targetStep: number) {
    // Validate all steps leading up to the target step.
    for (let step = 1; step < targetStep; step++) {
      if (!this.validateStep(step)) {
        alert(`Please complete step ${step} before proceeding.`);
        return;
      }
    }
    this.activeStep = targetStep;
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
  onPreviousStep() {
    this.activeStep--;
  }

  onSubmit() {
    if (!this.validateStep(4)) return;

    const availabilityData = this.availabilityComp?.days || [];
    console.log('Availability:', availabilityData);

    console.log('Form submitted with the following data:');
    console.log(this.descriptions);
    console.log('Selected services:', this.selectedServices);
    console.log('Phone:', this.formPhone);
    console.log('Address:', this.formAddress);
    console.log('Hourly Rate:', this.formCurrency);
    console.log('Distance:', this.formDistance);
    console.log('Accept Policy:', this.acceptPolicy);
    console.log('Selected services:', this.selectedServices);
    console.log('Availability:', availabilityData);

    this.router.navigate(['/dashboard/cleaner']);
  }

  validateStep(step: number): boolean {
    let valid = true;

    // Reset the error for the step before running validations.
    switch (step) {
      case 1:
        this.step1Error = '';
        if (this.selectedServices.length === 0) {
          this.step1Error = 'Please select at least one service.';
          valid = false;
        }
        break;
      case 2:
        this.step2Error = '';
        if (this.descriptions.some((desc) => !desc.description.trim())) {
          this.step2Error =
            'Please provide descriptions for all selected services.';
          valid = false;
        }
        break;
      case 3:
        if (this.availabilityComp && !this.availabilityComp.isValid()) {
          this.step3Error =
            'Please set valid availability for all selected days.';
          valid = false;
        }
        break;
      case 4:
        this.step4Error = '';
        if (!this.formPhone.trim() || !this.formAddress.trim()) {
          this.step4Error = 'Phone and Address are required.';
          valid = false;
        }
        if (!this.acceptPolicy) {
          this.step4Error +=
            (this.step4Error ? ' ' : '') +
            'You must accept the Privacy Policy.';
          valid = false;
        }
        if (+this.formCurrency <= 0) {
          this.step4Error +=
            (this.step4Error ? ' ' : '') + 'Please enter a valid hourly rate.';
          valid = false;
        }
        if (+this.formDistance <= 0) {
          this.step4Error +=
            (this.step4Error ? ' ' : '') + 'Please enter a valid distance.';
          valid = false;
        }
        break;
      default:
        break;
    }

    return valid;
  }
}
