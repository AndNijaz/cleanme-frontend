import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BookingWithReview, Review, ReviewDto } from './models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly BASE_URL = 'http://localhost:8080/review';

  constructor(private http: HttpClient) {}

  submitReview(review: any): Observable<any> {
    return this.http.post(`${this.BASE_URL}/${review.reviewId}`, {
      rating: review.rating,
      message: review.message,
      reservationId: review.reservationId,
      cleanerId: review.cleanerId,
      // userId: ,
      comment: review.message,
      date: review.date,
      cleanerName: review.cleanerName,
    });
  }

  updateReview(review: ReviewDto): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(
      `${this.BASE_URL}/update/${review.reviewId}`,
      { ...review, comment: review.message }
    );
  }

  getBookingsWithReviews(): Observable<BookingWithReview[]> {
    return this.http.get<BookingWithReview[]>(
      `${'http://localhost:8080/review/reviews/bookings'}`
    );
  }
}
