import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {
  CleanerService,
  PublicCleanerProfile,
} from '../../../core/services/cleaner-service.service';
import { ReviewService } from '../../../core/services/review.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { AuthService } from '../../../core/services/auth.service';
import { Review } from '../../../core/services/models/review.model';
import { ReservationRequest } from '../../../core/services/models/reservation.model';

@Component({
  selector: 'app-cleaner-public-profile',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, MatIconModule],
  templateUrl: './cleaner-public-profile.component.html',
  styles: [
    `
      .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: #cbd5e1 #f1f5f9;
      }

      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }

      .custom-scrollbar::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 3px;
      }

      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;
      }

      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }
    `,
  ],
})
export class CleanerPublicProfileComponent implements OnInit {
  cleaner: (PublicCleanerProfile & { id: string }) | null = null;
  allCleanerReviews: Review[] = [];
  averageRating: number = 0;

  // Reservation form properties
  selectedDate: string = '';
  selectedTimes: string[] = [];
  location: string = '';
  comment: string = '';

  dates: { date: string; label: string; monthLabel: string }[] = [];
  currentDatePage = 0;
  datesPerPage = 7;

  timeSlots: string[] = [];
  currentTimePage = 0;
  timesPerPage = 15; // Increased from 10 to 15

  formError: string = '';
  successMessage: string = '';

  bookedTimeSlots: Set<string> = new Set(); // Track booked time slots

  constructor(
    private route: ActivatedRoute,
    private cleanerService: CleanerService,
    private reviewService: ReviewService,
    private reservationService: ReservationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const cleanerId = this.route.snapshot.paramMap.get('id');
    if (cleanerId) {
      this.initializeReservationForm(); // Set up dates first
      this.loadCleanerProfile(cleanerId); // Then load cleaner (will trigger loadBookedTimeSlots)
      this.loadCleanerReviews(cleanerId);
    }
  }

  // Load cleaner profile data
  loadCleanerProfile(cleanerId: string) {
    this.cleanerService.getCleanerCardById(cleanerId).subscribe({
      next: (data: any) => {
        this.cleaner = { ...data, id: cleanerId };
        console.log('✅ Cleaner profile loaded:', this.cleaner);
        console.log('📅 Selected date at cleaner load:', this.selectedDate);

        // Force load booked time slots with a small delay to ensure everything is ready
        setTimeout(() => {
          console.log('🔄 FORCED loadBookedTimeSlots after cleaner load');
          this.loadBookedTimeSlots();
        }, 100);

        // Also try immediately
        if (this.selectedDate) {
          console.log(
            '🔄 IMMEDIATE loadBookedTimeSlots from cleaner profile load'
          );
          this.loadBookedTimeSlots();
        }
      },
      error: (error: any) => {
        console.error('Failed to load cleaner profile:', error);
      },
    });
  }

  // Load cleaner reviews
  loadCleanerReviews(cleanerId: string) {
    this.reviewService.getReviewsForCleaner(cleanerId).subscribe({
      next: (reviews) => {
        this.allCleanerReviews = reviews;
        this.calculateAverageRating();
        console.log('Reviews loaded:', reviews);
      },
      error: (error) => {
        console.error('Failed to load reviews:', error);
        this.allCleanerReviews = [];
      },
    });
  }

  // Initialize reservation form
  initializeReservationForm() {
    this.generateDates(365);
    this.generateTimeSlots();
    if (this.dates.length > 0) {
      this.selectedDate = this.dates[0].date;
      console.log('📅 Initial date set to:', this.selectedDate);
      console.log('👤 Cleaner available at date set:', !!this.cleaner?.id);
      // Load booked time slots if cleaner is already loaded
      if (this.cleaner?.id) {
        console.log(
          '🔄 Triggering loadBookedTimeSlots from date initialization'
        );
        this.loadBookedTimeSlots();
      } else {
        console.log('⚠️ No cleaner available yet when date set');
      }
    }
  }

  // Calculate average rating
  calculateAverageRating() {
    if (this.allCleanerReviews.length === 0) {
      this.averageRating = 0;
      return;
    }

    const totalRating = this.allCleanerReviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    this.averageRating =
      Math.round((totalRating / this.allCleanerReviews.length) * 100) / 100;
  }

  // Load booked time slots for current date
  loadBookedTimeSlots() {
    if (!this.cleaner?.id || !this.selectedDate) {
      console.log('❌ Cannot load booked slots - missing data:', {
        cleanerId: this.cleaner?.id,
        selectedDate: this.selectedDate,
        hasCleanerObject: !!this.cleaner,
        cleanerData: this.cleaner,
      });
      return;
    }

    console.log('🔄 CALLING BACKEND for booked time slots:', {
      cleanerId: this.cleaner.id,
      selectedDate: this.selectedDate,
      url: `reservation/booked-times/${this.cleaner.id}?date=${this.selectedDate}`,
    });

    this.reservationService
      .getBookedTimeSlots(this.cleaner.id, this.selectedDate)
      .subscribe({
        next: (bookedTimes) => {
          console.log('✅ BACKEND RESPONSE - Raw booked times:', bookedTimes);
          console.log(
            '📊 Response type:',
            typeof bookedTimes,
            'Length:',
            bookedTimes?.length
          );

          // Handle different time formats from backend
          const normalizedTimes = bookedTimes.map((time) => {
            if (typeof time === 'string') {
              // If it's "HH:MM:SS", convert to "HH:MM"
              if (time.includes(':') && time.split(':').length === 3) {
                return time.substring(0, 5); // "10:30:00" -> "10:30"
              }
              return time; // Already in "HH:MM" format
            }
            return String(time);
          });

          this.bookedTimeSlots = new Set(normalizedTimes);
          console.log(
            '🚫 FINAL disabled time slots:',
            Array.from(this.bookedTimeSlots)
          );
          console.log('🎯 Testing specific times:');
          console.log('  - 08:00 disabled?', this.isTimeBooked('08:00'));
          console.log('  - 08:30 disabled?', this.isTimeBooked('08:30'));
          console.log('  - 09:00 disabled?', this.isTimeBooked('09:00'));

          // Force Angular to detect changes
          console.log('🔄 Forcing change detection...');
        },
        error: (error) => {
          console.error('❌ BACKEND ERROR loading booked time slots:', error);
          console.error(
            '📋 Full error object:',
            JSON.stringify(error, null, 2)
          );
          this.bookedTimeSlots = new Set(); // Clear on error
        },
      });
  }

  // Generate dates for the next 365 days
  generateDates(days: number) {
    this.dates = [];
    const today = new Date();
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dateString = date.toISOString().split('T')[0];
      const monthLabel = date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
      const label = date.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
      });

      this.dates.push({ date: dateString, label, monthLabel });
    }
  }

  // Generate time slots from 8 AM to 8 PM
  generateTimeSlots() {
    this.timeSlots = [];
    for (let hour = 8; hour <= 19; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute
          .toString()
          .padStart(2, '0')}`;
        this.timeSlots.push(timeString);
      }
    }
  }

  // Get current page of dates
  get pagedDates() {
    const startIndex = this.currentDatePage * this.datesPerPage;
    return this.dates.slice(startIndex, startIndex + this.datesPerPage);
  }

  // Get current page of time slots
  get pagedTimeSlots() {
    const startIndex = this.currentTimePage * this.timesPerPage;
    return this.timeSlots.slice(startIndex, startIndex + this.timesPerPage);
  }

  // Get current month label
  get currentMonthLabel() {
    if (this.pagedDates.length > 0) {
      return this.pagedDates[0].monthLabel;
    }
    return '';
  }

  // Navigation methods
  prevDatePage() {
    if (this.currentDatePage > 0) {
      this.currentDatePage--;
    }
  }

  nextDatePage() {
    if ((this.currentDatePage + 1) * this.datesPerPage < this.dates.length) {
      this.currentDatePage++;
    }
  }

  prevTimePage() {
    if (this.currentTimePage > 0) {
      this.currentTimePage--;
    }
  }

  nextTimePage() {
    if (
      (this.currentTimePage + 1) * this.timesPerPage <
      this.timeSlots.length
    ) {
      this.currentTimePage++;
    }
  }

  // Select date
  selectDate(date: string) {
    console.log('Selecting date:', date);
    this.selectedDate = date;
    this.selectedTimes = []; // Clear selected times when date changes
    this.loadBookedTimeSlots(); // Load booked slots for new date
  }

  // Check if time is booked
  isTimeBooked(time: string): boolean {
    return this.bookedTimeSlots.has(time);
  }

  // Toggle time selection
  toggleTimeSelection(time: string) {
    if (this.isTimeBooked(time)) {
      return; // Don't allow selection of booked times
    }

    const index = this.selectedTimes.indexOf(time);
    if (index > -1) {
      // Remove time if already selected
      this.selectedTimes.splice(index, 1);
    } else {
      // Add time if not selected
      this.selectedTimes.push(time);
      this.selectedTimes.sort(); // Keep times sorted
    }
  }

  // Check if time is selected
  isTimeSelected(time: string): boolean {
    return this.selectedTimes.includes(time);
  }

  // Submit reservation
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

    console.log('Submitting reservation with data:', {
      selectedDate: this.selectedDate,
      selectedTimes: this.selectedTimes,
      location: this.location,
      comment: this.comment,
      cleanerId: this.cleaner?.id,
    });

    const reservationPayload: ReservationRequest = {
      userId: this.authService.getAuthData()?.userId || 'mock-user-id',
      cleanerId: this.cleaner?.id || '',
      date: this.selectedDate,
      times: this.selectedTimes,
      location: this.location.trim(),
      comment: this.comment.trim(),
      status: 'PENDING',
    };

    console.log('Final reservation payload:', reservationPayload);

    this.reservationService.submitReservation(reservationPayload).subscribe({
      next: (res) => {
        console.log('Reservation success response:', res);
        this.successMessage = 'Reservation created successfully!';
        // Reset form
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
        console.error('Reservation Error Details:', err);
        this.formError = 'Something went wrong. Please try again.';
      },
    });
  }
}
