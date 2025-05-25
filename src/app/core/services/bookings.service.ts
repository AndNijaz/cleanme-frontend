import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Booking {
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

  constructor(private http: HttpClient) {}

  getUserBookings(userId: string): Observable<Booking[]> {
    // 🔧 MOCK DATA – Uncomment HTTP call below when backend is ready
    return of([
      {
        cleanerName: 'Bahra Zedic',
        date: '21.3.2023',
        time: '17:00 to 21:00',
        message: 'Deep cleaning of apartment with extra care on the windows.',
        profileImage: '',
      },
      {
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
