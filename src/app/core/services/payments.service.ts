import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
// import { HttpClient } from '@angular/common/http'; // Uncomment when backend is ready

export interface Payment {
  cleanerName: string;
  amount: number;
  method: 'Credit Card' | 'Cash' | 'PayPal';
  status: 'Completed' | 'Pending' | 'Refunded';
  date: string;
  time: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  // private readonly BASE_URL = `${environment..baseURL}/payments`;

  // constructor(private http: HttpClient) {}
  constructor() {} // mock version without HttpClient

  getUserPayments(userId: string): Observable<Payment[]> {
    // ✅ MOCK DATA (to be replaced with backend call below)
    return of([
      {
        cleanerName: 'Amina Mujić',
        amount: 45,
        method: 'Credit Card',
        status: 'Completed',
        date: 'Apr 12, 2024',
        time: '14:00',
      },
      {
        cleanerName: 'Bahra Zedić',
        amount: 30,
        method: 'Cash',
        status: 'Pending',
        date: 'Mar 28, 2024',
        time: '10:30',
      },
      {
        cleanerName: 'Dženita Topić',
        amount: 60,
        method: 'PayPal',
        status: 'Refunded',
        date: 'Feb 10, 2024',
        time: '16:00',
      },
    ]);

    // 🔁 REAL BACKEND (use this once API is ready):
    // return this.http.get<Payment[]>(`${this.BASE_URL}/user/${userId}`);
  }
}
