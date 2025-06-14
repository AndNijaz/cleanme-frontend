import {
  Component,
  DestroyRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ValidationService } from '../../../core/services/validation.service';
import { ToggleButtonComponent } from '../../../shared/components/toggle-button/toggle-button.component';
import { RegisterRequest } from '../../../core/services/models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    InputComponent,
    ButtonComponent,
    FormsModule,
    ToggleButtonComponent,
    RouterLink,
  ],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  constructor(
    private httpClient: HttpClient,
    private destroyRef: DestroyRef,
    private router: Router,
    private authService: AuthService,
    private validationService: ValidationService
  ) {}

  @ViewChildren(InputComponent) inputs!: QueryList<InputComponent>;
  @ViewChild('registerForm') registerForm!: NgForm;

  formName: string = '';
  formSurname: string = '';
  formEmail: string = '';
  formAddress: string = '';
  formPhoneNumber: string = '';
  formPassword: string = '';
  formConfirmPassword: string = '';

  selectedProfileType: string = 'user';

  errorMessage: string = '';
  showPassword: boolean = false;

  submitted = false;

  selectedImageUrl: string | null = null;

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.submitted = true;

    if (this.registerForm) {
      this.registerForm.control.markAllAsTouched();
      this.registerForm.control.markAsDirty();
    }

    this.inputs.forEach((input) => input.markAsTouched());

    this.errorMessage = '';

    // Use ValidationService for form validation
    const validationResult = this.validationService.validateRegistrationForm({
      firstName: this.formName,
      lastName: this.formSurname,
      email: this.formEmail,
      address: this.formAddress,
      phoneNumber: this.formPhoneNumber,
      password: this.formPassword,
      confirmPassword: this.formConfirmPassword,
    });

    if (!validationResult.isValid) {
      this.errorMessage =
        this.validationService.getFirstError(validationResult);
      return;
    }

    const registerData: RegisterRequest = {
      firstName: this.formName.trim(),
      lastName: this.formSurname.trim(),
      email: this.formEmail.trim(),
      address: this.formAddress.trim(),
      phoneNumber: this.formPhoneNumber.trim(),
      password: this.formPassword,
      userType: this.selectedProfileType === 'user' ? 'CLIENT' : 'CLEANER',
    };

    //console.log(registerData);

    this.authService.register(registerData).subscribe({
      next: (res) => {
        this.authService.saveAuthData(res);
        console.log(res);

        if (res.userType === 'CLIENT') {
          // Clients can go directly to dashboard or to post-registration
          this.router.navigate(['/user/dashboard']);
        } else {
          // Cleaners MUST complete post-registration setup
          this.router.navigate(['/cleaner-post']);
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Registration failed.';
      },
    });

    // NOTE: selectedImageUrl trenutno se koristi samo za prikaz preview slike.
    // Kada se bude spajalo sa backendom, potrebno je:
    // 1. uploadati na storage (Heroku??) i čuvati URL u bazi.
  }

  setSelectedProfileType(event: number) {
    if (event === 0) this.selectedProfileType = 'user';
    if (event === 1) this.selectedProfileType = 'cleaner';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImageUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
}
