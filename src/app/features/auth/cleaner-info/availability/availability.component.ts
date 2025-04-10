import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';

interface AvailabilityDay {
  name: string;
  shortName: string;
  selected: boolean;
  from: Date | null;
  to: Date | null;
}

@Component({
  selector: 'app-availability',
  templateUrl: './availability.component.html',
  standalone: true,
  imports: [CheckboxModule, DatePickerModule, FormsModule, ReactiveFormsModule],
})
export class AvailabilityComponent {
  days: AvailabilityDay[] = [
    {
      name: 'Monday',
      shortName: 'mon',
      selected: true,
      from: new Date(),
      to: new Date(),
    },
    {
      name: 'Tuesday',
      shortName: 'tue',
      selected: false,
      from: null,
      to: null,
    },
    {
      name: 'Wednesday',
      shortName: 'wed',
      selected: false,
      from: null,
      to: null,
    },
    {
      name: 'Thursday',
      shortName: 'thu',
      selected: false,
      from: null,
      to: null,
    },
    { name: 'Friday', shortName: 'fri', selected: true, from: null, to: null },
    {
      name: 'Saturday',
      shortName: 'sat',
      selected: true,
      from: null,
      to: null,
    },
    { name: 'Sunday', shortName: 'sun', selected: true, from: null, to: null },
  ];

  @Output() availabilityChange = new EventEmitter<any[]>();

  constructor() {}

  // Emit changes whenever a value changes
  onTimeChange(): void {
    this.updateFormattedAvailability();
  }

  // Return formatted availability data
  getFormattedAvailability(): any[] {
    const formatted = this.days
      .filter((day) => day.selected && day.from && day.to)
      .map((day) => {
        const fromTime = this.formatTimeString(day.from);
        const toTime = this.formatTimeString(day.to);

        const dayObj: any = {};
        dayObj[day.shortName] = { from: fromTime, to: toTime };

        return dayObj;
      });

    return formatted;
  }

  // Format Date object to time string (HH:MM)
  private formatTimeString(date: Date | null): string {
    if (!date) return '';
    return (
      date.getHours().toString().padStart(2, '0') +
      ':' +
      date.getMinutes().toString().padStart(2, '0')
    );
  }

  // Update and emit formatted availability
  updateFormattedAvailability(): void {
    const formattedData = this.getFormattedAvailability();
    this.availabilityChange.emit(formattedData);
  }

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
