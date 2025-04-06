import { Component, DestroyRef, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [InputComponent, ButtonComponent, FormsModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent implements OnInit {
  formName: string = '';
  formSurname: string = '';
  formEmail: string = '';
  formPassword: string = '';
  formConfirmPassword: string = '';

  constructor(private httpClient: HttpClient, private destroyRef: DestroyRef) {}

  ngOnInit() {
    const subscription = this.httpClient
      .get('https://randomuser.me/api/')
      .subscribe({
        next: (resData) => {
          console.log(resData);
        },
      });

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

  onSubmit() {
    console.log('Name:', this.formName);
    console.log('Surname:', this.formSurname);
    console.log('Email:', this.formEmail);
    console.log('Password:', this.formPassword);
    console.log('Confirm Password:', this.formConfirmPassword);
  }
}
