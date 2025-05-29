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
  bookings: any[] = [];

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

  constructor(private reviewService: ReviewService, private router: Router) {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        this.loadBookingsWithReviews();
      });
  }

  loadBookingsWithReviews() {
    this.reviewService.getBookingsWithReviews().subscribe((bookings) => {
      this.bookings = bookings.map((b) => ({
        ...b,
        time: b.time, // Already separate
        message: b.comment, // Alias if needed
      }));

      this.buildGroupedData(); // This still works
    });
  }

  ngOnInit(): void {
    this.loadBookingsWithReviews();
  }

  buildGroupedData() {
    const groupedMap = new Map<
      string, // cleanerName is the key now
      {
        cleanerId: string;
        cleanerName: string;
        profileImage?: string;
        bookings: (Booking & { review?: Review })[];
      }
    >();

    for (const booking of this.bookings) {
      const bookingWithReview = {
        ...booking,
        time: Array.isArray(booking.times)
          ? booking.times.join(' to ')
          : booking.times || '',
        message: booking.comment,
        review: booking.review, // ✅ use the one already attached in loadBookingsAndReviews
      };

      if (!groupedMap.has(booking.cleanerName)) {
        groupedMap.set(booking.cleanerName, {
          cleanerId: 'unknown', // or leave out if unused
          cleanerName: booking.cleanerName,
          bookings: [bookingWithReview],
        });
      } else {
        groupedMap.get(booking.cleanerName)!.bookings.push(bookingWithReview);
      }
    }

    this.groupedByCleaner = Array.from(groupedMap.values());
  }

  toggleCleaner(cleanerName: string) {
    this.expandedCleanerId =
      this.expandedCleanerId === cleanerName ? null : cleanerName;
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
