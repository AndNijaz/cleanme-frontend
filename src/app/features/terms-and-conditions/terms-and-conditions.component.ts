import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {ButtonComponent} from '../../shared/components/button/button.component';

@Component({
  selector: 'app-terms-and-conditions',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './terms-and-conditions.component.html',
})
export class TermsAndConditionsComponent {
  constructor(private router: Router) {}

  goBackToRegister() {
    this.router.navigate(['/register']);
  }
}
