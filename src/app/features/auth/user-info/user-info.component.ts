import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './user-info.component.html',
})
export class UserInfoComponent {
  onSubmit() {}
}
