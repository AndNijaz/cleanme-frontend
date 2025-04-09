import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [FormsModule, InputComponent, ButtonComponent],
  templateUrl: './user-info.component.html',
})
export class UserInfoComponent {
  formName: string = '';
  formSurname: string = '';
  formPhoneNumber: string = '';
  formAddress: string = '';
  acceptPolicy: boolean = false;

  onSubmit() {
    console.log(this.formName);
    console.log(this.formSurname);
    console.log(this.formPhoneNumber);
    console.log(this.formAddress);
    console.log(this.acceptPolicy);
  }
}
