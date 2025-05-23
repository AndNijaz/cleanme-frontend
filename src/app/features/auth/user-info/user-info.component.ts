import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [FormsModule, InputComponent, ButtonComponent],
  templateUrl: './user-info.component.html',
})
export class UserInfoComponent {
  constructor(private router: Router) {}

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

    this.router.navigate(['/dashboard/user']);
  }
}
