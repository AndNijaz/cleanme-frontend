import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ReservationService } from './reservation.service';

export interface Booking {
  id: string; // <-- Add unique ID (can be UUID or composed from cleanerId+date+time)
  cleanerId: string;
  cleanerName: string;
  date: string;
  time: string;
  message: string;
  profileImage?: string;
}

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private readonly BASE_URL = 'http://localhost:8080/api/bookings';

  constructor(
    private http: HttpClient,
    private reservationService: ReservationService
  ) {}

  // getUserBookings(userId: string): Observable<Booking[]> {
  getUserBookings(userId: string) {
    // return of(this.reservationService.getUserReservations());

    // 🔧 MOCK DATA – Uncomment HTTP call below when backend is ready
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
      // {
      //   id: '3-2023-03-24-2',
      //   cleanerId: '1',
      //   cleanerName: 'Bahra Zedic',
      //   date: '21.3.2023',
      //   time: '17:00 to 21:00',
      //   message: 'hLJEBOVI.',
      //   profileImage: '',
      // },
      {
        id: '3-2023-03-24-3',
        cleanerId: '2',
        cleanerName: 'Amina Mujić',
        date: '24.3.2023',
        time: '10:00 to 13:00',
        message: 'Office cleaning with focus on electronics and shared space.',
        profileImage: '',
      },
      {
        id: '3-2023-03-24-4',
        cleanerId: '3',
        cleanerName: 'Amina Mujić',
        date: '24.3.2023',
        time: '10:00 to 13:00',
        message: 'Office cleaning with focus on electronics and shared space.',
        profileImage: '',
      },
    ]);

    // ✅ Real backend integration:
    // return this.http.get<Booking[]>(`${this.BASE_URL}/user/${userId}`);
  }
}
