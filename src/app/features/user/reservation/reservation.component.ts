import { Component, OnInit } from '@angular/core';
import { UserBookingsComponent } from '../user-bookings/user-bookings.component';
import {
  Booking,
  BookingService,
} from '../../../core/services/bookings.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { ReservationService } from '../../../core/services/reservation.service';

@Component({
  selector: 'app-reservation',
  imports: [UserBookingsComponent, CommonModule],
  templateUrl: './reservation.component.html',
  standalone: true,
})
export class ReservationComponent implements OnInit {
  bookings: Booking[] = [];
  isLoading = true;

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    this.reservationService.getUserBookings().subscribe({
      next: (data) => {
        this.bookings = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching bookings:', err);
        this.isLoading = false;
      },
    });
  }
}
