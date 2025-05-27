import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface ReservationRequest {
  cleanerId: string;
  date: string;
  times: string[];
  location: string;
  comment: string;
}

@Injectable({ providedIn: 'root' })
export class ReservationService {
  // private readonly BASE_URL = 'http://localhost:8080/api/reservations';

  constructor() {}

  submitReservation(
    request: ReservationRequest
  ): Observable<{ success: boolean }> {
    // ✅ MOCK – Simulate success
    console.log('MOCK Reservation Payload:', request);
    return of({ success: true });

    // ✅ REAL BACKEND LATER:
    // return this.http.post<{ success: boolean }>(`${this.BASE_URL}`, request);
  }
}
