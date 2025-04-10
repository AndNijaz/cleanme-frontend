import { Component } from '@angular/core';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-availability',
  templateUrl: './availability.component.html',
  standalone: true,
  imports: [CheckboxModule, CalendarModule, FormsModule],
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
}
