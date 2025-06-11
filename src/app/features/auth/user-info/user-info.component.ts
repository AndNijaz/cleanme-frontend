import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [FormsModule, InputComponent, ButtonComponent],
  templateUrl: './user-info.component.html',
})
export class UserInfoComponent {
  constructor(private router: Router, private authService: AuthService) {}

  @ViewChildren(InputComponent) inputs!: QueryList<InputComponent>;
  @ViewChild('registerForm') registerForm!: NgForm;

  formName: string = '';
  formSurname: string = '';
  formPhoneNumber: string = '';
  formAddress: string = '';

  onSubmit() {
    if (this.registerForm) {
      this.registerForm.control.markAllAsTouched();
    }

    if (this.inputs) {
      this.inputs.forEach((input) => input.markAsTouched());
    }

    if (!this.registerForm.valid) {
      return;
    }

    console.log(this.formName);
    console.log(this.formSurname);
    console.log(this.formPhoneNumber);
    console.log(this.formAddress);

    const role = this.authService.getUserRole();
    if (role === 'CLIENT') {
      this.router.navigate(['/user/dashboard']);
    } else if (role === 'CLEANER') {
      this.router.navigate(['/cleaner/dashboard']);
    } else {
      // Default fallback to user dashboard
      this.router.navigate(['/user/dashboard']);
    }
  }
}
