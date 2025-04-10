import { Component, DestroyRef, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormsModule } from '@angular/forms';

import { ToggleButtonComponent } from '../../../shared/components/toggle-button/toggle-button.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    InputComponent,
    ButtonComponent,
    FormsModule,
    ToggleButtonComponent,
  ],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  formName: string = '';
  formSurname: string = '';
  formEmail: string = '';
  formPassword: string = '';
  formConfirmPassword: string = '';

  selectedProfileType: string = 'user';

  errorMessage: string = '';

  constructor(
    private httpClient: HttpClient,
    private destroyRef: DestroyRef,
    private router: Router
  ) {}

  onSubmit() {
    this.errorMessage = '';

    if (
      !this.formName.trim() ||
      !this.formSurname.trim() ||
      !this.formEmail.trim() ||
      !this.formPassword.trim() ||
      !this.formConfirmPassword.trim()
    ) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    if (!this.isValidEmail(this.formEmail)) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    if (this.formPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return;
    }

    if (this.formPassword !== this.formConfirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    console.log('Name:', this.formName);
    console.log('Surname:', this.formSurname);
    console.log('Email:', this.formEmail);
    console.log('Password:', this.formPassword);
    console.log('Confirm Password:', this.formConfirmPassword);

    console.log('User Type:', this.selectedProfileType);

    if (this.selectedProfileType === 'user') {
      this.router.navigate(['/register-post']);
    } else if (this.selectedProfileType === 'cleaner') {
      this.router.navigate(['/cleaner-post']);
    }
  }

  setSelectedProfileType(event: number) {
    if (event === 0) this.selectedProfileType = 'user';
    if (event === 1) this.selectedProfileType = 'cleaner';
  }

  private isValidEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }
}
