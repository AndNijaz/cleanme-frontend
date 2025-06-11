import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ReservationRequest, Booking } from './models/reservation.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private readonly BASE_URL = `${environment['NG_APP_BASE_URL']}/reservation`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    let token: string | null = this.authService.getAuthData()?.token || null;

    if (!token) {
      token = localStorage.getItem('token');
    }

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  submitReservation(request: ReservationRequest): Observable<any> {
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

    return this.http
      .post(`${this.BASE_URL}`, backendPayload, { headers: this.getHeaders() })
      .pipe(
        catchError((error) => {
          throw error;
        })
      );
  }

  // === GET USER'S RESERVATIONS (for client dashboard) ===
  getUserReservations(): Observable<any[]> {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    // Add cache-busting headers to ensure fresh data
    const headers = this.getHeaders()
      .set('Cache-Control', 'no-cache, no-store, must-revalidate')
      .set('Pragma', 'no-cache')
      .set('Expires', '0')
      .set('If-None-Match', '*');

    return this.http.get<any[]>(`${this.BASE_URL}/all`, { headers }).pipe(
      catchError((error) => {
        return of([]); // Return empty array instead of throwing
      })
    );
  }

  // === GET BOOKED TIME SLOTS FOR SPECIFIC CLEANER AND DATE ===
  getBookedTimeSlots(cleanerId: string, date: string): Observable<string[]> {
    // Call real backend endpoint to get booked time slots
    return this.http
      .get<string[]>(
        `${this.BASE_URL}/booked-times/${cleanerId}?date=${date}`,
        {
          headers: this.getHeaders(),
        }
      )
      .pipe(
        catchError((error) => {
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
    return this.http
      .put<ReservationRequest>(`${this.BASE_URL}/${reservationId}`, updated, {
        headers: this.getHeaders(),
      })
      .pipe(
        catchError((error) => {
          throw error;
        })
      );
  }

  // === CANCEL RESERVATION (universal route) ===
  cancelReservation(reservationId: string): Observable<void> {
    // Real backend only
    return this.http.delete<void>(`${this.BASE_URL}/${reservationId}`);
  }

  // === UPDATE RESERVATION STATUS BY CLEANER (specific endpoint for cleaners) ===
  updateReservationStatusByCleaner(
    reservationId: string,
    status: string,
    cleanerId: string
  ): Observable<any> {
    // Try cleaner-specific endpoint first
    const cleanerUpdateData = {
      status: status,
      cleanerID: cleanerId,
    };

    const cleanerEndpoint = `${environment['NG_APP_BASE_URL']}/cleaners/${cleanerId}/reservations/${reservationId}/status`;

    return this.http
      .put<any>(cleanerEndpoint, cleanerUpdateData, {
        headers: this.getHeaders(),
      })
      .pipe(
        catchError((error) => {
          // Fallback to the general endpoint with proper typing
          return this.updateReservationStatus(reservationId, {
            status: status as any,
          });
        })
      );
  }
}
