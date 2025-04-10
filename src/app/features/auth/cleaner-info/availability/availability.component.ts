import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-availability',
  templateUrl: './availability.component.html',
  standalone: true,
  imports: [CheckboxModule, DatePickerModule, FormsModule, ReactiveFormsModule],
})
export class AvailabilityComponent {
  days = [
    { name: 'Monday', selected: true, from: new Date(), to: new Date() },
    { name: 'Tuesday', selected: false, from: null, to: null },
    { name: 'Wednesday', selected: false, from: null, to: null },
    { name: 'Thursday', selected: false, from: null, to: null },
    { name: 'Friday', selected: true, from: null, to: null },
    { name: 'Saturday', selected: true, from: null, to: null },
    { name: 'Sunday', selected: true, from: null, to: null },
  ];

  /**
   * Validates that for each selected day a valid "from" and "to" date is provided.
   */
  isValid(): boolean {
    for (const day of this.days) {
      if (day.selected) {
        if (!day.from || !day.to) {
          return false;
        }
      }
    }
    return true;
  }
}
