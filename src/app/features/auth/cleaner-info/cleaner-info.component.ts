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
import { Router } from '@angular/router';
import { LineErrorComponent } from './line-error/line-error.component';
import { AuthService } from '../../../core/services/auth.service';
import {
  PREDEFINED_SERVICES,
  ServiceType,
} from '../../../shared/constants/services.constant';

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
  constructor(private router: Router, private authService: AuthService) {}

  @ViewChild('availabilityComp') availabilityComp!: AvailabilityComponent;

  availabilityData: any[] = [];

  activeStep: number = 1;

  hourlyRate: number = 0;
  distance: number = 0;

  selectedServices: string[] = [];

  formCurrency: string = '0';
  formDistance: string = '0';

  services = PREDEFINED_SERVICES.map((service) => ({
    src: service.icon,
    text: service.name,
  }));

  step1Error: string = '';
  step2Error: string = '';
  step3Error: string = '';
  step4Error: string = '';

  isSubmitting: boolean = false;

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
    const service = PREDEFINED_SERVICES.find((s) => s.name === title);
    return service?.icon || 'default-icon.svg';
  }

  onNextStep() {
    if (this.validateStep(this.activeStep)) {
      // If moving from step 3, capture the availability data
      if (this.activeStep === 3 && this.availabilityComp) {
        this.availabilityData =
          this.availabilityComp.getFormattedAvailability();
      }
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

    this.isSubmitting = true;

    // Get latest availability data to ensure we have the most up-to-date version
    if (this.availabilityComp) {
      this.availabilityData = this.availabilityComp.getFormattedAvailability();
    }

    const authData = this.authService.getAuthData();
    if (!authData || !authData.userId) {
      console.error('No authenticated user found');
      this.isSubmitting = false;
      return;
    }

    const cleanerId = authData.userId;

    const request = {
      cleanerId: cleanerId!,
      servicesOffered: this.selectedServices.join(', '),
      hourlyRate: +this.formCurrency,
      availability: this.availabilityData,
      bio: this.descriptions.map((d) => `${d.title}: ${d.description}`),
    };

    console.log('📤 Submitting cleaner setup request:', request);

    this.authService.setupCleaner(request).subscribe({
      next: () => {
        console.log('✅ Cleaner setup completed successfully');
        // Show success message before redirect
        setTimeout(() => {
          this.router.navigate(['/cleaner/dashboard']);
        }, 1500);
      },
      error: (err) => {
        console.error('❌ Cleaner setup failed:', err);
        this.isSubmitting = false;
        // Show user-friendly error message
        alert('Setup failed. Please try again or contact support.');
      },
    });
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
        this.step3Error = '';
        if (this.availabilityComp && !this.availabilityComp.isValid()) {
          this.step3Error =
            'Please set valid availability for all selected days.';
          valid = false;
        } else if (this.availabilityComp) {
          // Update availability data when validating
          this.availabilityData =
            this.availabilityComp.getFormattedAvailability();

          // Ensure at least one day is selected
          if (this.availabilityData.length === 0) {
            this.step3Error =
              'Please select at least one day and set valid time range.';
            valid = false;
          }
        }
        break;
      case 4:
        this.step4Error = '';
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
