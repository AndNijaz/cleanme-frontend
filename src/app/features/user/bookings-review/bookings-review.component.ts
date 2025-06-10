import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewService } from '../../../core/services/review.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { LeaveReviewCardComponent } from '../reviews/leave-review-card.component';
import { CleanerCardModel } from '../../cleaner/cleaner-card/cleaner-card.component';
import { MatIconModule } from '@angular/material/icon';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { Booking } from '../../../core/services/models/reservation.model';
import { Review, ReviewDto } from '../../../core/services/models/review.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { FavoritesService } from '../../../core/services/favorites.service';

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
  styleUrls: ['./bookings-review.component.css'],
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
  selectedBooking: any;
  editingReview: Review | null = null;
  initialRating = 0;
  initialMessage = '';

  isEditing: boolean = false;
  favoriteCleanerIds: string[] = [];

  constructor(
    private reviewService: ReviewService,
    private router: Router,
    private http: HttpClient,
    private favoritesService: FavoritesService
  ) {
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
        // message: b.comment, // Alias if needed
      }));

      this.buildGroupedData(); // This still works
    });
  }

  ngOnInit(): void {
    this.loadBookingsWithReviews();
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.favoritesService.getFavorites().subscribe((favoriteIds) => {
      this.favoriteCleanerIds = favoriteIds;
    });
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

    // Sort bookings by date (most recent first)
    const sortedBookings = this.bookings.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime(); // Descending order (newest first)
    });

    for (const booking of sortedBookings) {
      const bookingWithReview = {
        ...booking,
        time: Array.isArray(booking.times)
          ? booking.times.join(' to ')
          : booking.times || '',
        message: booking.comment || booking.message, // Ensure comment is displayed
        review: booking.review, // ✅ use the one already attached in loadBookingsAndReviews
      };

      if (!groupedMap.has(booking.cleanerName)) {
        groupedMap.set(booking.cleanerName, {
          cleanerId: booking.cleanerId, // or leave out if unused
          cleanerName: booking.cleanerName,
          bookings: [bookingWithReview],
        });
      } else {
        groupedMap.get(booking.cleanerName)!.bookings.push(bookingWithReview);
      }
    }

    // Sort bookings within each cleaner group by date (most recent first)
    groupedMap.forEach((group) => {
      group.bookings.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime(); // Descending order (newest first)
      });
    });

    // console.log('Grouped bookings by cleaner:', groupedMap);

    this.groupedByCleaner = Array.from(groupedMap.values());
  }

  toggleCleaner(cleanerName: string) {
    this.expandedCleanerId =
      this.expandedCleanerId === cleanerName ? null : cleanerName;
  }

  leaveReview(group: any, booking: Booking) {
    console.log(group);
    console.log(booking);
    this.http
      .get<any>(`${environment['NG_APP_BASE_URL']}/cleaners/${group.cleanerId}`)
      .subscribe({
        next: (cleaner) => {
          this.selectedCleaner = {
            id: cleaner.id,
            fullName: `${cleaner.firstName} ${cleaner.lastName}`,
            rating: 0,
            reviewCount: 0,
            location: '',
            shortBio: cleaner.bio?.[0] ?? '',
            services: [],
            price: cleaner.hourlyRate,
            currency: '$',
          };
          this.selectedBooking = booking;
          this.initialRating = 0;
          this.initialMessage = '';
          this.editingReview = null;
          this.isReviewModalOpen = true;
        },
        error: (err) => {
          console.error('Error fetching cleaner details:', err);
          // Close modal if we can't load cleaner data
          this.closeReviewModal();
        },
      });
  }

  editReview(review: Review, booking: Booking) {
    this.http
      .get<any>(
        `${environment['NG_APP_BASE_URL']}/cleaners/${review.cleanerId}`
      )
      .subscribe({
        next: (cleaner) => {
          console.log('Fetched cleaner details:', cleaner);
          this.selectedCleaner = {
            id: cleaner.id,
            fullName: `${cleaner.firstName} ${cleaner.lastName}`,
            rating: review.rating,
            reviewCount: 1,
            location: '', // <- nije u DTO-u
            shortBio: cleaner.bio?.[0] ?? '', // ako hoćeš samo prvi bio
            services: [], // <- nije u DTO-u
            price: cleaner.hourlyRate,
            currency: '$',
          };

          this.editingReview = review;
          this.initialRating = review.rating;
          this.initialMessage = review.message;
          this.selectedBooking = booking;
          this.isEditing = true;
          this.isReviewModalOpen = true;
        },
        error: (err) => {
          console.error('Error fetching cleaner details:', err);
        },
      });

    console.log(this.selectedBooking);
    //
    console.log(review);
    console.log('amir');
    console.log(booking);

    this.editingReview = review;
    this.initialRating = review.rating;
    this.initialMessage = review.message;
    this.selectedCleaner = {
      id: review.cleanerId,
      fullName: booking.cleanerName,
      rating: review.rating,
      reviewCount: 1,
      location: '',
      shortBio: '',
      services: [],
      price: 0,
      currency: '$',
    };
    this.selectedBooking = booking;
    this.isEditing = true;
    this.isReviewModalOpen = true;
  }

  closeReviewModal(): void {
    this.isReviewModalOpen = false;
    this.isEditing = false;
    this.editingReview = null;
    this.selectedCleaner = null;
    this.selectedBooking = null;
    this.initialRating = 0;
    this.initialMessage = '';
  }

  handleReviewSubmit(payload: ReviewDto) {
    console.log('Review submit payload:', payload);
    const grb = this.bookings.filter(
      (b) => b.bookingId === this.selectedBooking!.bookingId
    )[0];

    console.log('Selected booking:', grb);

    console.log(this.reviews);
    if (this.isEditing) {
      this.reviewService.updateReview(payload).subscribe({
        next: (response) => {
          console.log('Review update response:', response);
          this.closeReviewModal();
          this.loadBookingsWithReviews();
        },
        error: (error) => {
          console.error('Error updating review:', error);
        },
      });

      return;
    }

    this.reviewService
      .submitReview({
        reviewId: this.selectedBooking!.bookingId,
        rating: payload.rating,
        message: payload.message,
        reservationId: grb.reservationId,
        cleanerId: grb.cleanerId,
        // userId: ,
        comment: grb.comment,
        date: grb.date,
        cleanerName: grb.cleanerName,
      })
      .subscribe({
        next: (response) => {
          console.log('Review submit response:', response);
          this.closeReviewModal();
          this.loadBookingsWithReviews();
        },
        error: (error) => {
          console.error('Error submitting review:', error);
        },
      });
  }

  isCleanerFavorite(cleanerId: string): boolean {
    return this.favoriteCleanerIds.includes(cleanerId);
  }

  toggleCleanerFavorite(
    event: Event,
    cleanerId: string,
    cleanerName: string
  ): void {
    event.stopPropagation(); // Prevent expanding the cleaner section

    const isFavorite = this.isCleanerFavorite(cleanerId);

    if (isFavorite) {
      this.favoritesService.removeFromFavorites(cleanerId).subscribe({
        next: () => {
          this.favoriteCleanerIds = this.favoriteCleanerIds.filter(
            (id) => id !== cleanerId
          );
          console.log(`❤️ Removed ${cleanerName} from favorites`);
        },
        error: (error) => {
          console.error('❌ Failed to remove from favorites:', error);
        },
      });
    } else {
      this.favoritesService.addToFavorites(cleanerId).subscribe({
        next: () => {
          this.favoriteCleanerIds.push(cleanerId);
          console.log(`❤️ Added ${cleanerName} to favorites`);
        },
        error: (error) => {
          console.error('❌ Failed to add to favorites:', error);
        },
      });
    }
  }
}
