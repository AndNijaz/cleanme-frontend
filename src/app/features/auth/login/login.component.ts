import { Component, DestroyRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, InputComponent, ButtonComponent, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  formEmail: string = '';
  formPassword: string = '';

  errorMessage: string = '';
  showPassword: boolean = false; // Dodano za prikaz lozinke

  constructor(
    private httpClient: HttpClient,
    private destroyRef: DestroyRef,
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.errorMessage = '';

    if (!this.formEmail.trim() || !this.formPassword.trim()) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    if (!this.isValidEmail(this.formEmail)) {
      this.errorMessage = 'Incorrect email address.';
      return;
    }

    if (this.formPassword.length < 6) {
      this.errorMessage = 'Incorrect password.';
      return;
    }

    const loginData = {
      email: this.formEmail.trim(),
      password: this.formPassword,
    };

    // console.log('Email:', this.formEmail);
    // console.log('Password:', this.formPassword);

    this.authService.login(loginData).subscribe({
      next: (res) => {
        this.authService.saveAuthData(res);

        if (res.userType === 'CLIENT') {
          this.router.navigate(['/dashboard/user']);
        } else {
          this.router.navigate(['/cleaner-post']);
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Login failed.';
      },
    });
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  private isValidEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }
}
