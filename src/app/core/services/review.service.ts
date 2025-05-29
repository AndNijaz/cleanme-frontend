import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { delay, Observable, of, tap } from 'rxjs';

// core/models/review.model.ts
export interface Review {
  id: string;
  cleanerId: string;
  bookingId: string; // <-- NEW
  cleanerName: string;
  profileImage?: string;
  rating: number;
  message: string;
  date: string;
}

export interface Review1 {
  id: string;
  reservationId: string;
  cleanerId: string;
  userId: string;
  rating: number;
  comment: string;
  date: string;
  cleanerName: string;
}

export interface BookingWithReview {
  bookingId: string;
  date: string;
  time: string;
  location: string;
  comment: string;
  cleanerName: string;
  cleanerId: string;
  review?: Review;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  // Real API endpoint placeholder
  // private readonly BASE_URL = 'http://localhost:8080/api/reviews';

  // submitReview(
  //   review: Omit<Review, 'id' | 'date' | 'profileImage'>
  // ): Observable<{ success: boolean }> {
  //   const newReview: Review = {
  //     ...review,
  //     id: crypto.randomUUID(), // Or use UUID lib
  //     date: new Date().toISOString().split('T')[0],
  //     profileImage: '',
  //   };
  //   this.mockReviews.push(newReview);
  //   console.log('%c⭐ Review saved (mock):', 'color: green', newReview);
  //   return of({ success: true }).pipe(delay(500));

  //   // ✅ Real backend (commented)
  //   // return this.http.post<{ success: boolean }>(`${this.BASE_URL}`

  constructor(private http: HttpClient) {}
  private mockReviews: Review[] = [];

  submitReview(
    review: Omit<Review, 'id' | 'date' | 'profileImage'>
  ): Observable<{ success: boolean }> {
    const newReview: Review = {
      ...review,
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      profileImage: '',
    };

    this.mockReviews.push(newReview); // ✅ Save to in-memory list

    console.log('%c⭐ Review saved (mock):', 'color: green', newReview);

    return of({ success: true }).pipe(delay(500));

    // 🔁 Real backend (uncomment when ready):
    // return this.http.post<{ success: boolean }>(`${this.BASE_URL}`, review);
  }

  updateReview(review: Review): Observable<{ success: boolean }> {
    return of({ success: true }).pipe(
      delay(300),
      tap(() =>
        console.log('%c✏️ MOCK updated review:', 'color: orange', review)
      )
    );

    // Real call:
    // return this.http.put(`${this.BASE_URL}/${review.id}`, review);
  }
  //
  getBookingsWithReviews(): Observable<BookingWithReview[]> {
    // return this.http.get<BookingWithReview[]>(`${this.BASE_URL}/bookings`);
    return this.http.get<BookingWithReview[]>(
      `${'http://localhost:8080/review/reviews/bookings'}`
    );
  }
}
