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
  comment?: string;
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

export interface updateReviewDto {
  reviewId?: string;
  rating: number;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  // Real API endpoint placeholder
  private readonly BASE_URL = 'http://localhost:8080/review';

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

  submitReview({
    reservationId,
    dto,
  }: {
    reservationId?: string;
    dto: any;
  }): Observable<any> {
    console.log(dto);
    console.log(reservationId);

    return this.http.post(`${this.BASE_URL}/${reservationId}`, {
      rating: dto.rating,
      comment: dto.message,
    });
  }

  updateReview(review: updateReviewDto): Observable<{ success: boolean }> {
    // Real call:
    console.log('%c⭐ Updating review:', 'color: blue', review);
    return this.http.put<{ success: boolean }>(
      `${this.BASE_URL}/update/${review.reviewId}`,
      { ...review, comment: review.message }
    );
  }
  //
  getBookingsWithReviews(): Observable<BookingWithReview[]> {
    // return this.http.get<BookingWithReview[]>(`${this.BASE_URL}/bookings`);
    return this.http.get<BookingWithReview[]>(
      `${'http://localhost:8080/review/reviews/bookings'}`
    );
  }
}
