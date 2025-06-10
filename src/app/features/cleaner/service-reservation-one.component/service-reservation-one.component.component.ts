import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservationService } from '../../../core/services/reservation.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReservationRequest } from '../../../core/services/models/reservation.model';

@Component({
  selector: 'app-service-reservation-one.component',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './service-reservation-one.component.component.html',
})
export class ServiceReservationOneComponentComponent {
  selectedDate: string = '';
  selectedTimes: string[] = [];
  location: string = '';
  comment: string = '';

  dates: { date: string; label: string; monthLabel: string }[] = [];
  currentDatePage = 0;
  datesPerPage = 7;

  timeSlots: string[] = [];
  currentTimePage = 0;
  timesPerPage = 15;

  formError: string = '';
  successMessage: string = '';

  cleanerId: string = '';
  bookedTimeSlots: Set<string> = new Set();

  constructor(
    private router: Router,
    private reservationService: ReservationService,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.cleanerId = this.route.snapshot.paramMap.get('id') || '';

    if (!this.cleanerId) {
      this.formError = 'Invalid cleaner ID. Please try again.';
      return;
    }

    console.log(
      '🔧 Initializing reservation component for cleaner ID:',
      this.cleanerId
    );

    this.generateDates(365);
    this.generateTimeSlots();

    // Set the selected date first, then load booked time slots
    if (this.dates.length > 0) {
      this.selectedDate = this.dates[0].date;
      console.log('📅 Initial selected date set to:', this.selectedDate);

      // Small delay to ensure everything is properly initialized
      setTimeout(() => {
        this.loadBookedTimeSlots();
      }, 100);
    }
  }

  isTimeSelected(time: string): boolean {
    return this.selectedTimes.includes(time);
  }

  isTimeBooked(time: string): boolean {
    return this.bookedTimeSlots.has(time);
  }

  loadBookedTimeSlots() {
    if (!this.cleanerId || !this.selectedDate) {
      console.log('Cannot load booked time slots - missing data:', {
        cleanerId: this.cleanerId,
        selectedDate: this.selectedDate,
      });
      this.bookedTimeSlots = new Set();
      return;
    }

    console.log('Loading booked time slots for:', {
      cleanerId: this.cleanerId,
      selectedDate: this.selectedDate,
    });

    this.reservationService
      .getBookedTimeSlots(this.cleanerId, this.selectedDate)
      .subscribe({
        next: (bookedTimes) => {
          this.bookedTimeSlots = new Set(bookedTimes);
          console.log('✅ Successfully loaded booked time slots:', bookedTimes);
        },
        error: (err) => {
          console.error('❌ Failed to load booked time slots:', err);
          this.bookedTimeSlots = new Set();
        },
      });
  }

  generateDates(totalDays: number) {
    const today = new Date();
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      this.dates.push({
        date: d.toISOString().split('T')[0],
        label: `${d.toLocaleDateString('en-US', {
          weekday: 'short',
        })} ${d.getDate()}`,
        monthLabel: d.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        }),
      });
    }
  }

  get pagedDates() {
    const start = this.currentDatePage * this.datesPerPage;
    return this.dates.slice(start, start + this.datesPerPage);
  }

  get currentMonthLabel(): string {
    const visible = this.pagedDates;
    return visible.length > 0 ? visible[0].monthLabel : '';
  }

  prevDatePage() {
    if (this.currentDatePage > 0) this.currentDatePage--;
  }

  nextDatePage() {
    const max = Math.ceil(this.dates.length / this.datesPerPage) - 1;
    if (this.currentDatePage < max) this.currentDatePage++;
  }

  generateTimeSlots() {
    for (let h = 8; h < 20; h++) {
      for (let m = 0; m < 60; m += 30) {
        this.timeSlots.push(
          `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
        );
      }
    }
  }

  get pagedTimes() {
    const start = this.currentTimePage * this.timesPerPage;
    return this.timeSlots.slice(start, start + this.timesPerPage);
  }

  nextTimePage() {
    const max = Math.ceil(this.timeSlots.length / this.timesPerPage) - 1;
    if (this.currentTimePage < max) this.currentTimePage++;
  }

  prevTimePage() {
    if (this.currentTimePage > 0) this.currentTimePage--;
  }

  selectDate(date: string) {
    this.selectedDate = date;
    this.formError = '';
    this.successMessage = '';
    this.selectedTimes = [];
    this.loadBookedTimeSlots();
  }

  selectTime(time: string) {
    // Don't allow selection of booked times
    if (this.isTimeBooked(time)) {
      return;
    }

    const index = this.timeSlots.indexOf(time);

    if (this.selectedTimes.length === 0) {
      // First time selection
      this.selectedTimes.push(time);
    } else {
      // Check if we're extending an existing selection
      const lastIndex = this.timeSlots.indexOf(
        this.selectedTimes[this.selectedTimes.length - 1]
      );
      const firstIndex = this.timeSlots.indexOf(this.selectedTimes[0]);

      // Allow consecutive time slot selection
      if (index === lastIndex + 1) {
        // Extending forward
        this.selectedTimes.push(time);
      } else if (index === firstIndex - 1) {
        // Extending backward
        this.selectedTimes.unshift(time);
      } else {
        // Non-consecutive selection - start new selection
        this.selectedTimes = [time];
      }
    }

    this.formError = '';
    this.successMessage = '';
  }

  submitReservation() {
    this.formError = '';

    if (
      !this.selectedDate ||
      this.selectedTimes.length === 0 ||
      !this.location.trim()
    ) {
      this.formError = 'Please complete all required fields.';
      return;
    }

    const authData = this.authService.getAuthData();
    if (!authData?.userId) {
      this.formError = 'Please log in to make a reservation.';
      return;
    }

    const reservationPayload: ReservationRequest = {
      userId: authData.userId,
      cleanerId: this.cleanerId,
      date: this.selectedDate,
      times: this.selectedTimes,
      location: this.location.trim(),
      comment: this.comment.trim(),
      status: 'PENDING',
    };

    this.reservationService.submitReservation(reservationPayload).subscribe({
      next: (res) => {
        this.successMessage = 'Reservation created successfully!';
        this.selectedTimes = [];
        this.location = '';
        this.comment = '';
        // Reload booked time slots to reflect the new booking
        this.loadBookedTimeSlots();
        setTimeout(() => {
          this.router.navigate(['/user/reservations']);
        }, 2000);
      },
      error: (err) => {
        console.error('Reservation Error:', err);
        this.formError = 'Something went wrong. Please try again.';
      },
    });
  }
}
