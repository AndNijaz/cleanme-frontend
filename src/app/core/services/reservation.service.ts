import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, timer } from 'rxjs';
import { tap, catchError, retry, map } from 'rxjs/operators';
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
    // First try to get token from auth service, then fallback to localStorage
    let token: string | null = this.authService.getAuthData()?.token || null;
    if (!token) {
      token = localStorage.getItem('token');
    }

    console.log(
      '🔑 Getting headers with token:',
      token ? 'Present' : 'Missing'
    );

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    } else {
      console.warn('⚠️ No authentication token found!');
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
  getUserReservations(): Observable<any[]> {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    console.log(`🔄 Fetching user reservations for userId: ${userId}`);
    console.log(`🔑 Token present: ${token ? 'Yes' : 'No'}`);
    console.log(`🔗 API URL: ${this.BASE_URL}/all`);

    // Add cache-busting headers to ensure fresh data
    const headers = this.getHeaders()
      .set('Cache-Control', 'no-cache, no-store, must-revalidate')
      .set('Pragma', 'no-cache')
      .set('Expires', '0')
      .set('If-None-Match', '*');

    console.log('📤 Request headers:', headers.keys());

    return this.http.get<any[]>(`${this.BASE_URL}/all`, { headers }).pipe(
      tap((reservations) => {
        console.log('📥 Raw API response:', reservations);
        console.log('✅ Total reservations received:', reservations.length);

        // Log first few to see structure
        if (reservations.length > 0) {
          console.log('📋 First reservation sample:', reservations[0]);
        }
      }),
      catchError((error) => {
        console.error('❌ Error fetching reservations:', error);
        console.error('❌ Error status:', error.status);
        console.error('❌ Error message:', error.message);
        return of([]); // Return empty array instead of throwing
      })
    );
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

  // === UPDATE RESERVATION STATUS BY CLEANER (specific endpoint for cleaners) ===
  updateReservationStatusByCleaner(
    reservationId: string,
    status: string,
    cleanerId: string
  ): Observable<any> {
    console.log('🔄 Cleaner updating reservation status:', {
      reservationId,
      status,
      cleanerId,
    });

    // Try cleaner-specific endpoint first
    const cleanerUpdateData = {
      status: status,
      cleanerID: cleanerId,
    };

    const cleanerEndpoint = `${environment['NG_APP_BASE_URL']}/cleaners/${cleanerId}/reservations/${reservationId}/status`;
    console.log('🔗 Cleaner update URL:', cleanerEndpoint);

    return this.http
      .put<any>(cleanerEndpoint, cleanerUpdateData, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap((response) =>
          console.log('✅ Cleaner update reservation success:', response)
        ),
        catchError((error) => {
          console.error(
            '❌ Cleaner update failed, trying general endpoint:',
            error
          );

          // Fallback to the general endpoint with proper typing
          return this.updateReservationStatus(reservationId, {
            status: status as any,
          });
        })
      );
  }
}
