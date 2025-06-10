import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';

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

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  getBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/reservation/all`, {
      headers: this.getAuthHeaders(),
    });
  }

  updateReservationStatus(
    reservationId: string,
    updateDto: UpdateReservationDto
  ): Observable<Booking> {
    return this.http.put<Booking>(
      `${this.apiUrl}/reservation/${reservationId}`,
      updateDto,
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  getBookingProgress(bookingId: string): Observable<BookingProgress> {
    // For now, transform regular booking data into progress format
    return this.http
      .get<Booking>(`${this.apiUrl}/reservation/${bookingId}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(map((booking) => this.transformToProgress(booking)));
  }

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

    // Add completed statuses
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
}
