import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import {
  Booking,
  Reservation,
  ReservationRequest,
} from './models/reservation.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly BASE_URL = `${environment['NG_APP_BASE_URL']}/reservation`;

  constructor(private http: HttpClient, private authService: AuthService) {}

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

  submitReservation(request: ReservationRequest): Observable<any> {
    console.log('Submitting reservation request:', request);

    // Convert times array to single time string (take first time or join them)
    const timeString = request.times.length > 0 ? request.times[0] : '09:00';

    // Format the payload to match backend CreateReservationDto
    const backendPayload = {
      date: request.date, // Backend will parse this to LocalDate
      time: timeString, // Backend expects single time as string, will parse to LocalTime
      location: request.location,
      status: request.status || 'PENDING', // Backend expects ReservationStatus enum
      comment: request.comment,
      cleanerID: request.cleanerId, // Backend expects cleanerID, not cleanerId
    };

    console.log('Backend payload:', backendPayload);

    return this.http
      .post(`${this.BASE_URL}`, backendPayload, { headers: this.getHeaders() })
      .pipe(
        tap((response) => console.log('Reservation success:', response)),
        catchError((error) => {
          console.error('Reservation error:', error);
          throw error;
        })
      );
  }

  // === GET USER'S RESERVATIONS (for client dashboard) ===
  getUserReservations(): Observable<Reservation[]> {
    console.log(`${this.BASE_URL}/all`);
    return this.http.get<Reservation[]>(`${this.BASE_URL}/all`);
  }

  // === GET BOOKED TIME SLOTS FOR SPECIFIC CLEANER AND DATE ===
  getBookedTimeSlots(cleanerId: string, date: string): Observable<string[]> {
    console.log(
      `Fetching booked time slots for cleaner ${cleanerId} on ${date}`
    );

    // Call real backend endpoint to get booked time slots
    return this.http
      .get<string[]>(
        `${this.BASE_URL}/booked-times/${cleanerId}?date=${date}`,
        {
          headers: this.getHeaders(),
        }
      )
      .pipe(
        tap((bookedTimes) =>
          console.log('Booked times from backend:', bookedTimes)
        ),
        catchError((error) => {
          console.error('Error fetching booked time slots:', error);
          // Fallback to empty array if backend fails
          return of([]);
        })
      );
  }

  // === GET BOOKINGS FOR CLEANER (for cleaner dashboard) ===
  getCleanerBookings(cleanerId: string): Observable<Booking[]> {
    // Use the correct cleaner endpoint that exists in the backend
    return this.http.get<Booking[]>(
      `${environment['NG_APP_BASE_URL']}/cleaners/${cleanerId}/reservations`,
      {
        headers: this.getHeaders(),
      }
    );
  }

  // === UPDATE RESERVATION STATUS (accept/decline by cleaner) ===
  updateReservationStatus(
    reservationId: string,
    updated: Partial<ReservationRequest>
  ): Observable<ReservationRequest> {
    console.log('🔄 Updating reservation status:', reservationId, updated);
    console.log('🔗 PUT URL:', `${this.BASE_URL}/${reservationId}`);
    console.log('🔑 Headers:', this.getHeaders());

    return this.http
      .put<ReservationRequest>(`${this.BASE_URL}/${reservationId}`, updated, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap((response) =>
          console.log('✅ Update reservation success:', response)
        ),
        catchError((error) => {
          console.error('❌ Update reservation error:', error);
          console.error('❌ Error status:', error.status);
          console.error('❌ Error message:', error.message);
          console.error('❌ Error details:', error.error);
          throw error;
        })
      );
  }

  // === CANCEL RESERVATION (universal route) ===
  cancelReservation(reservationId: string): Observable<void> {
    // 🟢 Real backend only
    return this.http.delete<void>(`${this.BASE_URL}/${reservationId}`);
  }
}
