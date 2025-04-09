import { Component } from '@angular/core';
import { InputComponent } from '../../../shared/components/input/input.component';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

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
  ],
  templateUrl: './cleaner-info.component.html',
  styles: [
    `
      .custom-separator {
        background-color: var(--color-deepblue-500) !important;
      }
    `,
  ],
})
export class CleanerInfoComponent {
  activeStep: number = 1;

  activateCallback(step: number) {
    this.activeStep = step;
    console.log(this.activeStep);
  }
  onSubmit() {}

  // activeStep: number = 1;

  name: string = '';
  email: string = '';
  password: string = '';

  option1: boolean = false;
  option2: boolean = false;
  option3: boolean = false;
  option4: boolean = false;

  onFinish() {
    console.log('Finished successfully! 🎉');
    // You can redirect or show a success toast here
  }
}
