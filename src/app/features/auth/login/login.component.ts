import { Component, DestroyRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [InputComponent, ButtonComponent, FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  formEmail: string = '';
  formPassword: string = '';

  errorMessage: string = '';
  showPassword: boolean = false; // Dodano za prikaz lozinke

  constructor(private httpClient: HttpClient, private destroyRef: DestroyRef) {}

  onSubmit() {
    this.errorMessage = '';

    if (!this.formEmail.trim() || !this.formPassword.trim()) {
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

    //console.log('Email:', this.formEmail);
    //console.log('Password:', this.formPassword);

    // Backend login request ide ovdje
    // this.httpClient.post('/api/login', { email: this.formEmail, password: this.formPassword }).subscribe(...)
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  private isValidEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }
}
