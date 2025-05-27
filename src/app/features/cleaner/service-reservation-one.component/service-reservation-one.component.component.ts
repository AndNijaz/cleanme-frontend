import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import {
  ReservationRequest,
  ReservationService,
} from '../../../core/services/reservation.service';

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
  currentTimePage = 2;
  timesPerPage = 10;

  formError: string = '';
  successMessage: string = '';

  constructor(
    private router: Router,
    private reservationService: ReservationService
  ) {}

  ngOnInit() {
    this.generateDates(365); // generate 1 year ahead
    this.generateTimeSlots();

    this.selectedDate = this.dates[0].date;
    // this.selectedTime = this.timeSlots[0];
  }

  isTimeSelected(time: string): boolean {
    return this.selectedTimes.includes(time);
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
    for (let h = 0; h < 24; h++) {
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
  }

  selectTime(time: string) {
    const index = this.timeSlots.indexOf(time);

    if (this.selectedTimes.length === 0) {
      this.selectedTimes.push(time);
    } else {
      const lastIndex = this.timeSlots.indexOf(
        this.selectedTimes[this.selectedTimes.length - 1]
      );
      const firstIndex = this.timeSlots.indexOf(this.selectedTimes[0]);

      if (index === lastIndex + 1) {
        this.selectedTimes.push(time);
      } else if (index === firstIndex - 1) {
        this.selectedTimes.unshift(time);
      } else {
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

    const reservationPayload: ReservationRequest = {
      cleanerId: 'mock-cleaner-id', // ✅ Replace with real ID if available via route or context
      date: this.selectedDate,
      times: this.selectedTimes,
      location: this.location,
      comment: this.comment,
    };

    this.reservationService.submitReservation(reservationPayload).subscribe({
      next: (res) => {
        if (res.success) {
          this.router.navigate(['/user/reservations']);
        } else {
          this.formError = 'Failed to submit reservation. Please try again.';
        }
      },
      error: (err) => {
        console.error('Reservation Error:', err);
        this.formError = 'Something went wrong. Please try again.';
      },
    });
  }
}
