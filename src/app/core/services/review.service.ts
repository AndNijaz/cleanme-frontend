import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

// core/models/review.model.ts
export interface Review {
  id: string;
  cleanerId: string;
  cleanerName: string;
  profileImage?: string;
  rating: number;
  message: string;
  date: string;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  // Real API endpoint placeholder
  // private readonly BASE_URL = 'http://localhost:8080/api/reviews';

  getUserReviews(userId: string): Observable<Review[]> {
    // 🔧 MOCK DATA — replace with real HTTP call later
    return of([
      {
        id: 'r1',
        cleanerId: 'c1',
        cleanerName: 'Bahra Zedić',
        profileImage: '',
        rating: 4,
        message: 'Very professional and arrived right on time!',
        date: '2024-03-02',
      },
      {
        id: 'r2',
        cleanerId: 'c2',
        cleanerName: 'Amina Mujkić',
        profileImage: '',
        rating: 5,
        message: 'Spotless! Windows are sparkling ✨',
        date: '2024-02-15',
      },
    ]);

    // Real request (commented):
    // return this.http.get<Review[]>(`${this.BASE_URL}/user/${userId}`);
  }
}
