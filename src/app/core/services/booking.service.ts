import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReservationRequest } from './models/reservation.model';

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

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  createBooking(booking: BookingRequest): Observable<BookingResponse> {
    // Get userId from localStorage (set during login)
    const userId = localStorage.getItem('userId') || '';

    // Convert to the format expected by the existing reservation service
    const reservationRequest: ReservationRequest = {
      userId: userId,
      cleanerId: booking.cleanerId,
      date: booking.date,
      times: [booking.time],
      location: booking.location,
      comment: booking.specialInstructions || '',
      status: 'PENDING',
    };

    console.log('Creating booking:', reservationRequest);

    return this.http.post<BookingResponse>(
      `${this.BASE_URL}`,
      {
        date: reservationRequest.date,
        time: reservationRequest.times[0],
        location: reservationRequest.location,
        status: reservationRequest.status,
        comment: reservationRequest.comment,
        cleanerID: reservationRequest.cleanerId,
      },
      { headers: this.getHeaders() }
    );
  }

  getAvailableTimeSlots(cleanerId: string, date: string): Observable<string[]> {
    const allTimeSlots = [
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

    return this.http
      .get<string[]>(
        `${this.BASE_URL}/booked-times/${cleanerId}?date=${date}`,
        { headers: this.getHeaders() }
      )
      .pipe
      // Transform to return available slots instead of booked ones
      // This would need to be implemented based on your backend response
      ();
  }

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
        default:
          break;
      }
    });

    return basePrice;
  }
}
