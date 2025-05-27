import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

export interface ReservationRequest {
  cleanerId: string;
  date: string;
  times: string[];
  location: string;
  comment: string;
}

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private mockReservations: ReservationRequest[] = []; // 🧠 In-memory storage

  // private readonly BASE_URL = 'http://localhost:8080/api/reservations';

  constructor() {}

  submitReservation(
    request: ReservationRequest
  ): Observable<{ success: boolean }> {
    return of({ success: true }).pipe(
      delay(500), // ⏳ Simulate network delay
      tap(() => {
        this.mockReservations.push(request);
        console.log('%c✅ MOCK reservation saved:', 'color: green', request);
      })
    );

    // 🔁 Uncomment for backend:
    // return this.http.post<{ success: boolean }>(`${this.BASE_URL}`, request);
  }

  getUserReservations(): Observable<ReservationRequest[]> {
    return of(this.mockReservations).pipe(
      delay(300), // Optional delay for realism
      tap((data) =>
        console.log('%c📦 Fetched mock reservations:', 'color: blue', data)
      )
    );

    // 🔁 Uncomment for backend:
    // return this.http.get<ReservationRequest[]>(`${this.BASE_URL}/user`);
  }

  getUserBookings(): Observable<any[]> {
    return of(
      this.mockReservations.map((res) => ({
        cleanerName: 'Bahra Zedic', // mock for now; ideally join with cleaner data
        date: res.date,
        time: `${res.times[0]} to ${res.times[res.times.length - 1]}`,
        message: res.comment,
        profileImage: '', // optional
      }))
    ).pipe(delay(300));
  }
}
