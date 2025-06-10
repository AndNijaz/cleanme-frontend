import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CleanerService } from '../../../core/services/cleaner-service.service';
import { AuthService } from '../../../core/services/auth.service';

interface DaySchedule {
  from: string;
  to: string;
}

interface WeeklyAvailability {
  [day: string]: DaySchedule;
}

@Component({
  selector: 'app-cleaner-availability',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cleaner-availability.component.html',
})
export class CleanerAvailabilityComponent implements OnInit {
  daysOfWeek = [
    { key: 'Monday', name: 'Monday' },
    { key: 'Tuesday', name: 'Tuesday' },
    { key: 'Wednesday', name: 'Wednesday' },
    { key: 'Thursday', name: 'Thursday' },
    { key: 'Friday', name: 'Friday' },
    { key: 'Saturday', name: 'Saturday' },
    { key: 'Sunday', name: 'Sunday' },
  ];

  timeOptions = [
    '06:00',
    '06:30',
    '07:00',
    '07:30',
    '08:00',
    '08:30',
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
    '17:30',
    '18:00',
    '18:30',
    '19:00',
    '19:30',
    '20:00',
    '20:30',
    '21:00',
    '21:30',
    '22:00',
  ];

  availability: WeeklyAvailability = {};
  hourlyRate: number = 25;

  initialLoading = true;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  private cleanerId: string = '';

  constructor(
    private cleanerService: CleanerService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.initializeData();
  }

  private initializeData() {
    const authData = this.authService.getAuthData();
    if (!authData?.userId) {
      this.errorMessage = 'Authentication required. Please log in again.';
      this.initialLoading = false;
      return;
    }

    this.cleanerId = authData.userId;
    this.loadCurrentAvailability();
  }

  private loadCurrentAvailability() {
    this.cleanerService.getCleanerPublicProfile(this.cleanerId).subscribe({
      next: (profile: any) => {
        // Parse availability - assuming it comes as array of {day: {from, to}} objects
        if (profile.availability && Array.isArray(profile.availability)) {
          this.availability = {};
          profile.availability.forEach((dayAvail: any) => {
            const dayName = Object.keys(dayAvail)[0];
            const schedule = dayAvail[dayName];
            if (schedule && schedule.from && schedule.to) {
              this.availability[dayName] = {
                from: schedule.from,
                to: schedule.to,
              };
            }
          });
        }

        this.hourlyRate = profile.hourlyRate || 25;
        this.initialLoading = false;
      },
      error: (error) => {
        console.error('Error loading cleaner availability:', error);
        this.errorMessage =
          'Failed to load your current schedule. You can still set it up.';
        this.initialLoading = false;
      },
    });
  }

  isDayActive(day: string): boolean {
    return !!this.availability[day];
  }

  toggleDay(day: string) {
    if (this.availability[day]) {
      delete this.availability[day];
    } else {
      this.availability[day] = {
        from: '09:00',
        to: '17:00',
      };
    }
    this.clearMessages();
  }

  getStartTime(day: string): string {
    return this.availability[day]?.from || '09:00';
  }

  getEndTime(day: string): string {
    return this.availability[day]?.to || '17:00';
  }

  updateStartTime(day: string, event: any) {
    const time = event.target.value;
    if (this.availability[day]) {
      this.availability[day].from = time;

      // Auto-adjust end time if start time is after end time
      const startMinutes = this.timeToMinutes(time);
      const endMinutes = this.timeToMinutes(this.availability[day].to);

      if (startMinutes >= endMinutes) {
        const newEndTime = this.minutesToTime(startMinutes + 60); // Add 1 hour
        this.availability[day].to = newEndTime;
      }
    }
    this.clearMessages();
  }

  updateEndTime(day: string, event: any) {
    const time = event.target.value;
    if (this.availability[day]) {
      this.availability[day].to = time;

      // Auto-adjust start time if end time is before start time
      const startMinutes = this.timeToMinutes(this.availability[day].from);
      const endMinutes = this.timeToMinutes(time);

      if (endMinutes <= startMinutes) {
        const newStartTime = this.minutesToTime(endMinutes - 60); // Subtract 1 hour
        this.availability[day].from = newStartTime;
      }
    }
    this.clearMessages();
  }

  getFormattedHours(day: string): string {
    if (!this.availability[day]) return '';
    return `${this.availability[day].from} - ${this.availability[day].to}`;
  }

  // Quick action methods
  setWeekdaySchedule() {
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    weekdays.forEach((day) => {
      this.availability[day] = { from: '09:00', to: '17:00' };
    });

    // Clear weekends
    delete this.availability['Saturday'];
    delete this.availability['Sunday'];

    this.clearMessages();
  }

  setFullWeekSchedule() {
    this.daysOfWeek.forEach((day) => {
      this.availability[day.key] = { from: '08:00', to: '18:00' };
    });
    this.clearMessages();
  }

  clearAllSchedule() {
    this.availability = {};
    this.clearMessages();
  }

  // Summary methods
  getActiveDaysCount(): number {
    return Object.keys(this.availability).length;
  }

  getTotalHours(): number {
    let totalMinutes = 0;

    Object.values(this.availability).forEach((schedule) => {
      const startMinutes = this.timeToMinutes(schedule.from);
      const endMinutes = this.timeToMinutes(schedule.to);
      totalMinutes += endMinutes - startMinutes;
    });

    return Math.round(totalMinutes / 60);
  }

  getWeeklyEarningPotential(): string {
    const totalHours = this.getTotalHours();
    const potential = totalHours * this.hourlyRate;
    return `${potential} BAM`;
  }

  // Utility methods
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}`;
  }

  saveAvailability() {
    if (Object.keys(this.availability).length === 0) {
      this.errorMessage = 'Please set availability for at least one day.';
      return;
    }

    // Validate that all schedules have valid times
    for (const [day, schedule] of Object.entries(this.availability)) {
      const startMinutes = this.timeToMinutes(schedule.from);
      const endMinutes = this.timeToMinutes(schedule.to);

      if (endMinutes <= startMinutes) {
        this.errorMessage = `Invalid schedule for ${day}. End time must be after start time.`;
        return;
      }
    }

    this.isLoading = true;
    this.clearMessages();

    // Convert availability to the format expected by the backend
    const availabilityArray = Object.entries(this.availability).map(
      ([day, schedule]) => ({
        [day]: {
          from: schedule.from,
          to: schedule.to,
        },
      })
    );

    // Use the cleaner update endpoint
    const request = {
      availability: availabilityArray,
      // Don't send servicesOffered or bio - keep existing
    };

    this.authService.updateCleaner(this.cleanerId, request).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Availability updated successfully!';
        setTimeout(() => (this.successMessage = ''), 5000);
      },
      error: (error) => {
        console.error('Error updating availability:', error);
        this.isLoading = false;
        this.errorMessage = 'Failed to update availability. Please try again.';
      },
    });
  }

  private clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
