import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  BookingService,
  BookingRequest,
} from '../../../core/services/booking.service';
import { ReservationService } from '../../../core/services/reservation.service';

interface Cleaner {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  specialties: string[];
}

@Component({
  selector: 'app-booking-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-modal.component.html',
  styleUrl: './booking-modal.component.css',
})
export class BookingModalComponent implements OnInit {
  @Input() cleaner: Cleaner | null = null;
  @Input() isOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() bookingComplete = new EventEmitter<any>();

  // Form data
  bookingForm = {
    date: '',
    time: '',
    duration: 2,
    location: '',
    services: [] as string[],
    specialInstructions: '',
  };

  availableTimeSlots: string[] = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
  ];

  bookedTimeSlots: string[] = [];
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private bookingService: BookingService,
    private reservationService: ReservationService
  ) {}

  ngOnInit() {
    // Set minimum date to today
    this.bookingForm.date = new Date().toISOString().split('T')[0];
  }

  get availableServices(): string[] {
    return (
      this.cleaner?.specialties || [
        'House Cleaning',
        'Deep Cleaning',
        'Window Cleaning',
        'Carpet Cleaning',
      ]
    );
  }

  get totalPrice(): number {
    if (!this.cleaner) return 0;
    return this.bookingService.calculatePrice(
      this.cleaner.hourlyRate,
      this.bookingForm.duration,
      this.bookingForm.services
    );
  }

  get availableTimesForDate(): string[] {
    return this.availableTimeSlots.filter(
      (time) => !this.bookedTimeSlots.includes(time)
    );
  }

  onDateChange() {
    if (this.cleaner && this.bookingForm.date) {
      this.loadBookedTimeSlots();
    }
  }

  loadBookedTimeSlots() {
    if (!this.cleaner || !this.bookingForm.date) return;

    this.reservationService
      .getBookedTimeSlots(this.cleaner.id, this.bookingForm.date)
      .subscribe({
        next: (bookedTimes) => {
          this.bookedTimeSlots = bookedTimes;
          // Reset time selection if currently selected time is now booked
          if (
            this.bookingForm.time &&
            bookedTimes.includes(this.bookingForm.time)
          ) {
            this.bookingForm.time = '';
          }
        },
        error: (error) => {
          console.error('Error loading booked time slots:', error);
          this.bookedTimeSlots = [];
        },
      });
  }

  onServiceToggle(service: string, event: any) {
    if (event.target.checked) {
      this.bookingForm.services.push(service);
    } else {
      const index = this.bookingForm.services.indexOf(service);
      if (index > -1) {
        this.bookingForm.services.splice(index, 1);
      }
    }
  }

  isFormValid(): boolean {
    return !!(
      this.bookingForm.date &&
      this.bookingForm.time &&
      this.bookingForm.location &&
      this.bookingForm.services.length > 0 &&
      this.cleaner
    );
  }

  submitBooking() {
    if (!this.isFormValid() || !this.cleaner) {
      this.error = 'Please fill in all required fields';
      return;
    }

    this.loading = true;
    this.error = null;

    const bookingRequest: BookingRequest = {
      cleanerId: this.cleaner.id,
      date: this.bookingForm.date,
      time: this.bookingForm.time,
      duration: this.bookingForm.duration,
      location: this.bookingForm.location,
      services: this.bookingForm.services,
      specialInstructions: this.bookingForm.specialInstructions,
      totalPrice: this.totalPrice,
    };

    this.bookingService.createBooking(bookingRequest).subscribe({
      next: (response) => {
        console.log('Booking created successfully:', response);
        this.loading = false;
        this.bookingComplete.emit(response);
        this.resetForm();
        this.close();
      },
      error: (error) => {
        console.error('Booking error:', error);
        this.loading = false;
        this.error =
          error.error?.message || 'Failed to create booking. Please try again.';
      },
    });
  }

  resetForm() {
    this.bookingForm = {
      date: new Date().toISOString().split('T')[0],
      time: '',
      duration: 2,
      location: '',
      services: [],
      specialInstructions: '',
    };
    this.error = null;
  }

  close() {
    this.closeModal.emit();
  }

  // Close modal when clicking outside
  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  getStarArray(rating: number): boolean[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= Math.floor(rating));
    }
    return stars;
  }
}
