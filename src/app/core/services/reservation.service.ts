import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface ReservationRequest {
  userId: string;
  cleanerId: string;
  date: string;
  times: string[]; // or a single time range string if that’s your model
  location: string;
  comment: string;
}

export interface Reservation {
  id: string;
  userId: string;
  cleanerId: string;
  cleanerName: string;
  date: string;
  times: string[];
  location: string;
  comment: string;
}

export interface Booking {
  id: string;
  cleanerId: string;
  cleanerName: string;
  date: string;
  time: string;
  message: string;
  profileImage?: string;
}

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly BASE_URL = 'http://localhost:8080/reservation';

  // 🧪 Mock in-memory storage (remove later)
  private mockReservations: Reservation[] = [
    {
      id: 'r1',
      userId: 'mock-user-id',
      cleanerId: '1',
      cleanerName: 'Bahra Zedic',
      date: '2025-06-01',
      times: ['10:00-12:00'],
      location: 'Sarajevo',
      comment: 'General apartment cleaning',
    },
    {
      id: 'r2',
      userId: 'mock-user-id',
      cleanerId: '2',
      cleanerName: 'Azra Mahmutović',
      date: '2025-06-05',
      times: ['14:00-16:00'],
      location: 'Ilidža',
      comment: 'Window and bathroom focus',
    },
    {
      id: 'r3',
      userId: 'mock-user-id',
      cleanerId: '1',
      cleanerName: 'Bahra Zedic',
      date: '2025-06-10',
      times: ['09:00-11:00'],
      location: 'Grbavica',
      comment: 'Kitchen cleanup',
    },
    {
      id: 'r4',
      userId: 'mock-user-id',
      cleanerId: '3',
      cleanerName: 'Emira Selimović',
      date: '2025-06-11',
      times: ['08:00-10:00'],
      location: 'Novo Sarajevo',
      comment: 'Office desk disinfection',
    },
  ];

  constructor(private http: HttpClient, private authService: AuthService) {}

  submitReservation(
    request: Omit<Reservation, 'id' | 'cleanerName'>
  ): Observable<{ success: boolean }> {
    const newReservation: Reservation = {
      ...request,
      id: crypto.randomUUID(),
      cleanerName: this.lookupCleanerName(request.cleanerId), // <- helper method
      times: request.times, // optional format
    };

    this.mockReservations.push(newReservation);

    return of({ success: true }).pipe(
      delay(500),
      tap(() =>
        console.log('%c✅ Reservation saved:', 'color: green', newReservation)
      )
    );
  }

  private lookupCleanerName(cleanerId: string): string {
    const names: { [key: string]: string } = {
      '1': 'Bahra Zedic',
      '2': 'Azra Mahmutović',
      '3': 'Emira Selimović',
    };
    return names[cleanerId] ?? 'Unknown Cleaner';
  }

  // === GET USER'S RESERVATIONS (for client dashboard) ===
  getUserReservations(): Observable<Reservation[]> {
    //   const userId = this.authService.getAuthData()?.userId;

    //   // ✅ Mock version
    //   const userReservations = this.mockReservations.filter(
    //     (reservation) => reservation.userId === userId
    //   );

    //   return of(userReservations).pipe(
    //     delay(300),
    //     tap((data) =>
    //       console.log('%c📦 MOCK user reservations:', 'color: blue', data)
    //     )
    //   );

    // 🟢 Uncomment for real backend:
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
