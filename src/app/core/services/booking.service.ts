import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';

// Interfaces for booking management
export interface Booking {
  rid: string;
  date: string;
  time: string;
  location: string;
  status: string;
  comment: string;
  cleanerName: string;
  clientName: string;
  clientPhone: string;
}

export interface UpdateReservationDto {
  cleanerId: string;
  date: string;
  time: string;
  location: string;
  status: string;
  comment: string;
}

export interface BookingProgress {
  rid: string;
  status: string;
  clientName: string;
  cleanerName: string;
  date: string;
  time: string;
  location: string;
  comment: string;
  duration: number;
  rate: number;
  estimatedCompletion?: Date;
  startTime?: Date;
  statusHistory: StatusHistoryItem[];
}

export interface StatusHistoryItem {
  status: string;
  timestamp: Date;
  duration?: string;
  description: string;
}

// Interfaces for booking creation
export interface BookingRequest {
  cleanerId: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  services: string[];
  specialInstructions?: string;
  totalPrice: number;
}

export interface BookingResponse {
  id: string;
  status: string;
  message: string;
  bookingDetails: BookingRequest;
}

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private readonly BASE_URL = `${environment['NG_APP_BASE_URL']}/reservation`;

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.storageService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  // === BOOKING MANAGEMENT ===

  /**
   * Get all bookings for the current user
   */
  getBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.BASE_URL}/all`, {
      headers: this.getAuthHeaders(),
    });
  }

  /**
   * Update reservation status
   */
  updateReservationStatus(
    reservationId: string,
    updateDto: UpdateReservationDto
  ): Observable<Booking> {
    return this.http.put<Booking>(
      `${this.BASE_URL}/${reservationId}`,
      updateDto,
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  /**
   * Get booking progress with status history
   */
  getBookingProgress(bookingId: string): Observable<BookingProgress> {
    return this.http
      .get<Booking>(`${this.BASE_URL}/${bookingId}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(map((booking) => this.transformToProgress(booking)));
  }

  // === BOOKING CREATION ===

  /**
   * Create a new booking
   */
  createBooking(booking: BookingRequest): Observable<BookingResponse> {
    console.log('Creating booking:', booking);

    // Send data in the exact format expected by CreateReservationDto
    const reservationData = {
      date: booking.date, // LocalDate format (YYYY-MM-DD)
      time: booking.time, // LocalTime format (HH:MM:SS or HH:MM)
      location: booking.location,
      status: 'PENDING', // ReservationStatus enum
      comment: booking.specialInstructions || '',
      cleanerID: booking.cleanerId, // UUID format
    };

    console.log('Sending reservation data to backend:', reservationData);

    return this.http.post<BookingResponse>(this.BASE_URL, reservationData, {
      headers: this.getAuthHeaders(),
    });
  }

  /**
   * Get available time slots for a cleaner on a specific date
   */
  getAvailableTimeSlots(cleanerId: string, date: string): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.BASE_URL}/booked-times/${cleanerId}?date=${date}`,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Calculate booking price based on hourly rate, duration, and services
   */
  calculatePrice(
    hourlyRate: number,
    duration: number,
    services: string[]
  ): number {
    let basePrice = hourlyRate * duration;

    // Add service-specific pricing
    services.forEach((service) => {
      switch (service.toLowerCase()) {
        case 'deep cleaning':
          basePrice += 20;
          break;
        case 'window cleaning':
          basePrice += 15;
          break;
        case 'carpet cleaning':
          basePrice += 25;
          break;
        case 'bathroom cleaning':
          basePrice += 10;
          break;
        case 'kitchen cleaning':
          basePrice += 15;
          break;
        default:
          break;
      }
    });

    return basePrice;
  }

  // === PRIVATE HELPER METHODS ===

  private transformToProgress(booking: Booking): BookingProgress {
    const statusHistory = this.generateStatusHistory(booking.status);

    return {
      rid: booking.rid,
      status: booking.status,
      clientName: booking.clientName,
      cleanerName: booking.cleanerName,
      date: booking.date,
      time: booking.time,
      location: booking.location,
      comment: booking.comment,
      duration: 3, // Default 3 hours - could be dynamic
      rate: 25, // Default rate - could be dynamic
      startTime:
        booking.status === 'ONGOING'
          ? this.getEstimatedStartTime(booking)
          : undefined,
      statusHistory: statusHistory,
    };
  }

  private generateStatusHistory(currentStatus: string): StatusHistoryItem[] {
    const now = new Date();
    const history: StatusHistoryItem[] = [];

    // Add completed statuses based on current status
    if (
      ['PENDING', 'CONFIRMED', 'ONGOING', 'FINISHED'].includes(currentStatus)
    ) {
      history.push({
        status: 'PENDING',
        timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
        description: 'Booking request submitted',
      });
    }

    if (['CONFIRMED', 'ONGOING', 'FINISHED'].includes(currentStatus)) {
      history.push({
        status: 'CONFIRMED',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        description: 'Cleaner confirmed the booking',
      });
    }

    if (['ONGOING', 'FINISHED'].includes(currentStatus)) {
      history.push({
        status: 'ONGOING',
        timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
        description: 'Cleaning service started',
      });
    }

    if (currentStatus === 'FINISHED') {
      history.push({
        status: 'FINISHED',
        timestamp: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
        description: 'Service completed successfully',
        duration: '2h 30m',
      });
    }

    return history;
  }

  private getEstimatedStartTime(booking: Booking): Date {
    // Estimate start time based on booking time
    const bookingDateTime = new Date(`${booking.date}T${booking.time}`);
    return bookingDateTime;
  }

  // === UTILITY METHODS ===

  /**
   * Get all available time slots (for UI purposes)
   */
  getAllTimeSlots(): string[] {
    return [
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
  }

  /**
   * Check if a time slot is available
   */
  isTimeSlotAvailable(timeSlot: string, bookedSlots: string[]): boolean {
    return !bookedSlots.includes(timeSlot);
  }

  /**
   * Format booking status for display
   */
  formatStatus(status: string): string {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'Pending Confirmation';
      case 'CONFIRMED':
        return 'Confirmed';
      case 'ONGOING':
        return 'In Progress';
      case 'FINISHED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  }
}
