import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Booking,
  BookingService,
} from '../../../core/services/bookings.service';
import { Review, ReviewService } from '../../../core/services/review.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { LeaveReviewCardComponent } from '../reviews/leave-review-card/leave-review-card.component';
import { CleanerCardModel } from '../../cleaner/cleaner-card/cleaner-card.component';
import { AuthService } from '../../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import {
  Reservation,
  ReservationService,
} from '../../../core/services/reservation.service';

@Component({
  selector: 'app-bookings-review',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    LeaveReviewCardComponent,
    MatIconModule,
  ],
  templateUrl: './bookings-review.component.html',
})
export class BookingsReviewComponent {
  bookings: (Reservation & { review?: Review })[] = [];

  reviews: Review[] = [];

  groupedByCleaner: {
    cleanerId: string;
    cleanerName: string;
    profileImage?: string;
    bookings: (Booking & { review?: Review })[];
  }[] = [];

  expandedCleanerId: string | null = null;
  isReviewModalOpen = false;
  selectedCleaner: CleanerCardModel | null = null;
  selectedBooking: Booking | null = null;
  editingReview: Review | null = null;
  initialRating = 0;
  initialMessage = '';

  constructor(
    private bookingService: BookingService,
    private reviewService: ReviewService,
    private reservationService: ReservationService, // Assuming this is the correct service for bookings
    private authService: AuthService,
    private router: Router
  ) {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        this.loadBookingsAndReviews();
      });
  }

  loadBookingsAndReviews() {
    const userId = this.authService.getAuthData()?.userId || '';

    this.reservationService.getUserReservations().subscribe((reservations) => {
      const bookingsWithReview = reservations.map((r) => ({
        ...r,
        time: r.times.join(' to '), // <-- if needed
        message: r.comment,
      }));

      this.reviewService.getUserReviews(userId).subscribe((reviews) => {
        this.reviews = reviews;

        // Attach matching reviews
        this.bookings = bookingsWithReview.map((b) => ({
          id: b.id,
          userId: b.userId,
          cleanerId: b.cleanerId,
          cleanerName: b.cleanerName,
          date: b.date,
          times: b.times,
          location: b.location,
          comment: b.comment,
          time: b.times.join(' to '),
          message: b.comment,
          review: reviews.find((r) => r.bookingId === b.id),
        }));

        this.buildGroupedData();
      });
    });
  }

  ngOnInit(): void {
    // const userId = this.authService.getAuthData()?.userId || '';

    // this.bookingService.getUserBookings(userId).subscribe((bookings) => {
    //   this.bookings = bookings.map((booking) => ({
    //     ...booking,
    //     id: booking.id || crypto.randomUUID(),
    //   }));
    //   this.reviewService.getUserReviews(userId).subscribe((reviews) => {
    //     this.reviews = reviews;
    //     this.buildGroupedData();
    //   });
    // });
    this.loadBookingsAndReviews();
  }

  buildGroupedData() {
    const groupedMap = new Map<
      string,
      {
        cleanerId: string;
        cleanerName: string;
        profileImage?: string;
        bookings: (Booking & { review?: Review })[];
      }
    >();

    for (const booking of this.bookings) {
      const review = this.reviews.find((r) => r.bookingId === booking.id);
      const bookingWithReview = {
        ...booking,
        time: booking.times.join(' to '),
        message: booking.comment,
        review,
      };

      if (!groupedMap.has(booking.cleanerId)) {
        groupedMap.set(booking.cleanerId, {
          cleanerId: booking.cleanerId,
          cleanerName: booking.cleanerName,
          bookings: [bookingWithReview],
        });
      } else {
        groupedMap.get(booking.cleanerId)!.bookings.push(bookingWithReview);
      }
    }

    this.groupedByCleaner = Array.from(groupedMap.values());
  }

  toggleCleaner(cleanerId: string) {
    this.expandedCleanerId =
      this.expandedCleanerId === cleanerId ? null : cleanerId;
  }

  leaveReview(group: any, booking: Booking) {
    this.selectedCleaner = {
      id: group.cleanerId,
      fullName: group.cleanerName,
      rating: 0,
      reviewCount: 0,
      location: 'Unknown',
      shortBio: 'Mock cleaner profile',
      services: [],
      price: 0,
      currency: '$',
    };
    this.selectedBooking = booking;
    this.initialRating = 0;
    this.initialMessage = '';
    this.editingReview = null;
    this.isReviewModalOpen = true;
  }

  editReview(review: Review, booking: Booking) {
    this.editingReview = review;
    this.initialRating = review.rating;
    this.initialMessage = review.message;
    this.selectedCleaner = {
      id: review.cleanerId,
      fullName: review.cleanerName,
      rating: review.rating,
      reviewCount: 1,
      location: 'Mock',
      shortBio: '',
      services: [],
      price: 0,
      currency: '$',
    };
    this.selectedBooking = booking;
    this.isReviewModalOpen = true;
  }

  handleReviewSubmit(payload: {
    rating: number;
    message: string;
    reviewId?: string;
  }) {
    if (!this.selectedCleaner || !this.selectedBooking) return;

    const review: Review = {
      id: payload.reviewId || crypto.randomUUID(),
      cleanerId: this.selectedCleaner.id,
      cleanerName: this.selectedCleaner.fullName,
      bookingId: this.selectedBooking.id, // <--- important!
      rating: payload.rating,
      message: payload.message,
      date: new Date().toISOString().split('T')[0],
      profileImage: this.selectedCleaner.imageUrl ?? '',
    };

    const save = payload.reviewId
      ? this.reviewService.updateReview(review)
      : this.reviewService.submitReview(review);

    save.subscribe(() => {
      const targetGroup = this.groupedByCleaner.find(
        (g) => g.cleanerId === review.cleanerId
      );
      if (targetGroup) {
        const targetBooking = targetGroup.bookings.find(
          (b) => b.id === review.bookingId
        );
        if (targetBooking) {
          targetBooking.review = review;
        }
      }
      this.isReviewModalOpen = false;
      this.selectedCleaner = null;
      this.selectedBooking = null;
      this.editingReview = null;
    });
  }
}
