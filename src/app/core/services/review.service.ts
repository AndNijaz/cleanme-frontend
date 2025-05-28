import { Injectable } from '@angular/core';
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

@Injectable({ providedIn: 'root' })
export class ReviewService {
  // Real API endpoint placeholder
  // private readonly BASE_URL = 'http://localhost:8080/api/reviews';

  private mockReviews: Review[] = [];

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
  //   // return this.http.post<{ success: boolean }>(`${this.BASE_URL}`, review);
  // }
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

  getUserReviews(userId: string): Observable<Review[]> {
    // 🔧 MOCK DATA — replace with real HTTP call later
    // return of([
    //   {
    //     id: 'r1',
    //     cleanerId: 'c1',
    //     cleanerName: 'Bahra Zedić',
    //     profileImage: '',
    //     rating: 4,
    //     message: 'Very professional and arrived right on time!',
    //     date: '2024-03-02',
    //   },
    //   {
    //     id: 'r2',
    //     cleanerId: 'c2',
    //     cleanerName: 'Amina Mujkić',
    //     profileImage: '',
    //     rating: 5,
    //     message: 'Spotless! Windows are sparkling ✨',
    //     date: '2024-02-15',
    //   },
    // ]);

    return of(this.mockReviews);

    // Real request (commented):
    // return this.http.get<Review[]>(`${this.BASE_URL}/user/${userId}`);
  }

  // updateReview(updated: Review): Observable<{ success: boolean }> {
  //   const index = this.mockReviews.findIndex((r) => r.id === updated.id);
  //   if (index !== -1) {
  //     this.mockReviews[index] = {
  //       ...updated,
  //       date: new Date().toISOString().split('T')[0],
  //     };
  //     console.log('%c✏️ Review updated (mock):', 'color: orange', updated);
  //     return of({ success: true }).pipe(delay(300));
  //   }
  //   return of({ success: false });
  // }
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

  log() {}
}
