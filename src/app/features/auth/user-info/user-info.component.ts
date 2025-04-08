import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputComponent } from '../../../shared/components/input/input.component';

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [FormsModule, InputComponent],
  templateUrl: './user-info.component.html',
})
export class UserInfoComponent {
  formName: string = '';
  formSurname: string = '';
  formPhoneNumber: string = '';
  formAddress: string = '';
  onSubmit() {}
}
