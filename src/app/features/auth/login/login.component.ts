import { Component, DestroyRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ValidationService } from '../../../core/services/validation.service';
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
    private validationService: ValidationService,
    private router: Router
  ) {}

  onSubmit() {
    this.errorMessage = '';

    // Use ValidationService for form validation
    const validationResult = this.validationService.validateLoginForm(
      this.formEmail,
      this.formPassword
    );

    if (!validationResult.isValid) {
      this.errorMessage =
        this.validationService.getFirstError(validationResult);
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
          this.router.navigate(['/user/dashboard']);
        } else {
          this.router.navigate(['/cleaner/dashboard']);
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
}
