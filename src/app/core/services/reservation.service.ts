import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import {
  Booking,
  Reservation,
  ReservationRequest,
} from './models/reservation.model';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly BASE_URL = 'http://localhost:8080/reservation';

  constructor(private http: HttpClient, private authService: AuthService) {}

  submitReservation(
    request: Omit<Reservation, 'id' | 'cleanerName'>
  ): Observable<{ success: boolean }> {
    const newReservation: Reservation = {
      ...request,
      id: crypto.randomUUID(),
      cleanerName: 's', // <- helper method
      times: request.times, // optional format
    };

    return of({ success: true }).pipe(
      delay(500),
      tap(() =>
        console.log('%c✅ Reservation saved:', 'color: green', newReservation)
      )
    );
  }

  // === GET USER'S RESERVATIONS (for client dashboard) ===
  getUserReservations(): Observable<Reservation[]> {
    console.log(`${this.BASE_URL}/all`);
    return this.http.get<Reservation[]>(`${this.BASE_URL}/all`);
  }

  // === GET BOOKINGS FOR CLEANER (for cleaner dashboard) ===
  getCleanerBookings(cleanerId: string): Observable<Booking[]> {
    // ✅ Mock version – sample list for visual testing
    return of([
      {
        id: '3-2023-03-24-1',
        cleanerId: '1',
        cleanerName: 'Bahra Zedic',
        date: '21.3.2023',
        time: '17:00 to 21:00',
        message: 'Deep cleaning of apartment with extra care on the windows.',
        profileImage: '',
      },
      {
        id: '3-2023-03-24-3',
        cleanerId: '2',
        cleanerName: 'Amina Mujić',
        date: '24.3.2023',
        time: '10:00 to 13:00',
        message: 'Office cleaning with focus on electronics and shared space.',
        profileImage: '',
      },
    ]).pipe(delay(300));

    // 🟢 Uncomment for real backend:
    // return this.http.get<Booking[]>(`${this.BASE_URL}/cleaner/${cleanerId}`);
  }

  // === UPDATE RESERVATION STATUS (accept/decline by cleaner) ===
  updateReservationStatus(
    reservationId: string,
    updated: Partial<ReservationRequest>
  ): Observable<ReservationRequest> {
    // 🟢 Real backend only
    return this.http.put<ReservationRequest>(
      `${this.BASE_URL}/${reservationId}`,
      updated
    );
  }

  // === CANCEL RESERVATION (universal route) ===
  cancelReservation(reservationId: string): Observable<void> {
    // 🟢 Real backend only
    return this.http.delete<void>(`${this.BASE_URL}/${reservationId}`);
  }
}
