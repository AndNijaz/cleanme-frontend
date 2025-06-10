import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReviewService } from '../../../core/services/review.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { LeaveReviewCardComponent } from '../reviews/leave-review-card.component';
import { CleanerCardModel } from '../../cleaner/cleaner-card/cleaner-card.component';
import { MatIconModule } from '@angular/material/icon';
import { NavigationEnd, Router, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs';
import { Booking } from '../../../core/services/models/reservation.model';
import { Review, ReviewDto } from '../../../core/services/models/review.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { FavoritesService } from '../../../core/services/favorites.service';
import { BookingProgressComponent } from '../../../components/booking-progress/booking-progress.component';

@Component({
  selector: 'app-bookings-review',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ModalComponent,
    LeaveReviewCardComponent,
    MatIconModule,
    BookingProgressComponent,
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

  // Progress tracking
  expandedBookingProgress: string | null = null;

  // Loading state for refresh
  isRefreshing = false;

  constructor(
    private reviewService: ReviewService,
    private router: Router,
    private route: ActivatedRoute,
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
    console.log('📡 Loading bookings with reviews...');
    this.isRefreshing = true;

    this.reviewService.getBookingsWithReviews().subscribe({
      next: (bookings) => {
        console.log('📋 Raw bookings from API:', bookings);

        // Debug: Log all statuses and cleaner info
        bookings.forEach((b: any, index) => {
          console.log(
            `📝 Booking ${index + 1}: Status = "${
              b.status
            }" (${typeof b.status})`
          );
          console.log(`📝 Booking ${index + 1}: CleanerId = "${b.cleanerId}"`);
          console.log(
            `📝 Booking ${index + 1}: CleanerName = "${b.cleanerName}"`
          );
        });

        this.bookings = bookings.map((b) => ({
          ...b,
          time: b.time, // Already separate
          // message: b.comment, // Alias if needed
        }));

        console.log('✨ Processed bookings:', this.bookings);
        this.buildGroupedData(); // This still works
        this.isRefreshing = false;
      },
      error: (error) => {
        console.error('❌ Error loading bookings:', error);
        this.isRefreshing = false;
      },
    });
  }

  ngOnInit(): void {
    this.loadBookingsWithReviews();
    this.loadFavorites();

    // Check for query params to auto-expand cleaner section
    this.route.queryParams.subscribe((params) => {
      if (params['expandCleaner']) {
        // Wait for data to load before expanding
        setTimeout(() => {
          this.expandedCleanerId = params['expandCleaner'];

          // If there's a specific booking, try to open review modal
          if (params['bookingId']) {
            this.autoOpenReviewForBooking(
              params['expandCleaner'],
              params['bookingId']
            );
          }
        }, 1000);
      }
    });

    // Auto-refresh removed - using manual refresh button only
  }

  private autoOpenReviewForBooking(cleanerName: string, bookingId: string) {
    const cleanerGroup = this.groupedByCleaner.find(
      (g) => g.cleanerName === cleanerName
    );
    if (cleanerGroup) {
      const booking = cleanerGroup.bookings.find(
        (b) => b.rid === bookingId || b.id === bookingId
      );
      if (booking && !booking.review) {
        // Auto-open review modal
        this.leaveReview(cleanerGroup, booking);
      }
    }
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
        status: booking.status, // ✅ Ensure status is preserved
      };

      console.log(
        `📝 Processing booking with status: "${booking.status}" → "${bookingWithReview.status}"`
      );

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
    // Check if review is allowed before opening modal
    if (!this.canLeaveReview(booking)) {
      console.log('❌ Review not allowed for this booking');
      alert(this.getReviewAvailabilityMessage(booking));
      return;
    }

    console.log('🔍 Leave Review - Group:', group);
    console.log('🔍 Leave Review - Booking:', booking);
    console.log('🔍 Cleaner ID being fetched:', group.cleanerId);
    console.log(
      '🔍 Full URL:',
      `${environment['NG_APP_BASE_URL']}/cleaners/${group.cleanerId}`
    );

    this.http
      .get<any>(`${environment['NG_APP_BASE_URL']}/cleaners/${group.cleanerId}`)
      .subscribe({
        next: (cleaner) => {
          console.log('✅ Successfully fetched cleaner:', cleaner);
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
          console.error('❌ Error fetching cleaner details:', err);
          console.error('❌ Error status:', err.status);
          console.error('❌ Error message:', err.message);
          console.error('❌ Full error object:', err);

          // Create fallback cleaner object to allow review submission
          console.log('⚠️ Using fallback cleaner data to allow review');
          this.selectedCleaner = {
            id: group.cleanerId || 'unknown',
            fullName: booking.cleanerName || 'Unknown Cleaner',
            rating: 0,
            reviewCount: 0,
            location: '',
            shortBio: 'Cleaner details temporarily unavailable',
            services: [],
            price: 0,
            currency: '$',
          };
          this.selectedBooking = booking;
          this.initialRating = 0;
          this.initialMessage = '';
          this.editingReview = null;
          this.isReviewModalOpen = true;

          // Show user-friendly warning but still allow review
          console.warn(
            `⚠️ Cleaner details unavailable (${err.status}), but review modal opened with fallback data`
          );
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
    event.stopPropagation(); // Prevent cleaner card expansion

    if (this.isCleanerFavorite(cleanerId)) {
      this.favoritesService.removeFromFavorites(cleanerId).subscribe({
        next: () => {
          this.favoriteCleanerIds = this.favoriteCleanerIds.filter(
            (id) => id !== cleanerId
          );
          console.log(`Removed ${cleanerName} from favorites`);
        },
        error: (error: any) => {
          console.error('Error removing favorite:', error);
        },
      });
    } else {
      this.favoritesService.addToFavorites(cleanerId).subscribe({
        next: () => {
          this.favoriteCleanerIds.push(cleanerId);
          console.log(`Added ${cleanerName} to favorites`);
        },
        error: (error: any) => {
          console.error('Error adding favorite:', error);
        },
      });
    }
  }

  // Booking Statistics Methods
  getTotalBookings(): number {
    return this.groupedByCleaner.reduce(
      (total, group) => total + group.bookings.length,
      0
    );
  }

  getCompletedBookings(): number {
    return this.groupedByCleaner.reduce((total, group) => {
      const completed = group.bookings.filter(
        (booking) => new Date(booking.date) < new Date()
      ).length;
      return total + completed;
    }, 0);
  }

  getUpcomingBookings(): number {
    return this.groupedByCleaner.reduce((total, group) => {
      const upcoming = group.bookings.filter(
        (booking) => new Date(booking.date) >= new Date()
      ).length;
      return total + upcoming;
    }, 0);
  }

  // Cleaner Rating Helper
  getCleanerAverageRating(bookings: any[]): string {
    const reviewedBookings = bookings.filter(
      (booking) => booking.review && booking.review.rating
    );
    if (reviewedBookings.length === 0) return '0.0';

    const totalRating = reviewedBookings.reduce(
      (sum, booking) => sum + booking.review.rating,
      0
    );
    const average = totalRating / reviewedBookings.length;
    return average.toFixed(1);
  }

  // Booking Status Methods
  getBookingStatus(date: string): string {
    const bookingDate = new Date(date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const bookingDay = new Date(
      bookingDate.getFullYear(),
      bookingDate.getMonth(),
      bookingDate.getDate()
    );

    if (bookingDay < today) {
      return 'Completed';
    } else if (bookingDay.getTime() === today.getTime()) {
      return 'Today';
    } else {
      return 'Upcoming';
    }
  }

  getBookingStatusClasses(date: string): string {
    const status = this.getBookingStatus(date);
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'Today':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Upcoming':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  }

  getBookingStatusDotClasses(date: string): string {
    const status = this.getBookingStatus(date);
    switch (status) {
      case 'Completed':
        return 'bg-green-500';
      case 'Today':
        return 'bg-blue-500';
      case 'Upcoming':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  }

  // Time Helper Methods
  getTimeUntilBooking(date: string): string {
    const bookingDate = new Date(date);
    const now = new Date();
    const timeDiff = bookingDate.getTime() - now.getTime();

    if (timeDiff < 0) {
      const daysPast = Math.floor(Math.abs(timeDiff) / (1000 * 60 * 60 * 24));
      if (daysPast === 0) {
        return 'Earlier today';
      } else if (daysPast === 1) {
        return 'Yesterday';
      } else {
        return `${daysPast} days ago`;
      }
    } else {
      const daysUntil = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      if (daysUntil === 0) {
        return 'Today';
      } else if (daysUntil === 1) {
        return 'Tomorrow';
      } else {
        return `In ${daysUntil} days`;
      }
    }
  }

  // Rating Text Helper
  getRatingText(rating: number): string {
    switch (rating) {
      case 5:
        return 'Excellent';
      case 4:
        return 'Very Good';
      case 3:
        return 'Good';
      case 2:
        return 'Fair';
      case 1:
        return 'Poor';
      default:
        return 'Not Rated';
    }
  }

  // Progress tracking methods
  toggleBookingProgress(bookingId: string) {
    this.expandedBookingProgress =
      this.expandedBookingProgress === bookingId ? null : bookingId;
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'ongoing':
        return 'bg-blue-100 text-blue-800';
      case 'finished':
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  isActiveBooking(booking: any): boolean {
    const bookingDate = new Date(booking.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      bookingDate >= today ||
      ['pending', 'confirmed', 'ongoing'].includes(
        booking.status?.toLowerCase()
      )
    );
  }

  // Review availability logic - Only allow reviews after cleaner marks work as done
  canLeaveReview(booking: any): boolean {
    console.log('🔍 Checking if review can be left for booking:', booking);
    console.log('🔍 Booking status:', booking.status, typeof booking.status);

    if (booking.review) {
      console.log('❌ Review already exists');
      return false; // Already has review
    }

    const bookingStatus = booking.status?.toLowerCase();
    console.log('🔍 Normalized status:', bookingStatus);

    // Only allow reviews if cleaner marked the job as finished/completed
    if (['finished', 'completed'].includes(bookingStatus)) {
      console.log('✅ Review allowed - job marked as finished/completed');
      return true;
    }

    // For any other status (pending, confirmed, ongoing), reviews are not allowed
    console.log('❌ Review not allowed - work not yet completed by cleaner');
    return false;
  }

  has24HoursPassed(booking: any): boolean {
    if (!booking.date || !booking.time) return true; // Allow review if no date/time

    const bookingDateTime = new Date(`${booking.date}T${booking.time}`);
    const now = new Date();
    const diffInHours =
      (now.getTime() - bookingDateTime.getTime()) / (1000 * 60 * 60);

    return diffInHours >= 24; // Reduced to 24 hours
  }

  getReviewAvailabilityMessage(booking: any): string {
    if (booking.review) {
      return 'Review submitted';
    }

    const bookingStatus = booking.status?.toLowerCase();

    if (['finished', 'completed'].includes(bookingStatus)) {
      return 'Review available';
    }

    if (['cancelled'].includes(bookingStatus)) {
      return 'Service cancelled';
    }

    if (['pending'].includes(bookingStatus)) {
      return 'Waiting for cleaner confirmation';
    }

    if (['confirmed', 'ongoing'].includes(bookingStatus)) {
      return 'Waiting for service completion';
    }

    // For undefined or unknown status
    return 'Waiting for service completion';
  }

  getTimeUntilReviewAvailable(booking: any): string | null {
    // Reviews are now more permissive, so this mainly applies to very recent bookings
    if (!booking.date || !booking.time) return null;

    const bookingDateTime = new Date(`${booking.date}T${booking.time}`);
    const reviewAvailableTime = new Date(
      bookingDateTime.getTime() + 24 * 60 * 60 * 1000
    ); // 24 hours later
    const now = new Date();

    if (now >= reviewAvailableTime) {
      return null; // Already available
    }

    const diffInMs = reviewAvailableTime.getTime() - now.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(
      (diffInMs % (1000 * 60 * 60)) / (1000 * 60)
    );

    if (diffInHours > 0) {
      return `in ${diffInHours}h ${diffInMinutes}m`;
    } else {
      return `in ${diffInMinutes}m`;
    }
  }

  getReviewButtonClass(booking: any): string {
    if (!this.canLeaveReview(booking)) {
      return 'bg-gray-400 cursor-not-allowed';
    }
    return 'bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 cursor-pointer hover:shadow-xl transform hover:-translate-y-1';
  }

  // Additional action methods
  contactCleaner(booking: any): void {
    const cleanerName = booking.cleanerName || 'the cleaner';
    alert(
      `Feature coming soon: Contact ${cleanerName} directly through the app!`
    );
  }

  cancelBooking(booking: any): void {
    const confirmCancel = confirm(
      `Are you sure you want to cancel your booking with ${
        booking.cleanerName || 'this cleaner'
      }?`
    );
    if (confirmCancel) {
      alert(
        'Feature coming soon: Cancel booking functionality will be implemented.'
      );
      // TODO: Implement actual cancellation logic
    }
  }

  refreshBookings(): void {
    console.log('🔄 Manual refresh triggered by user');
    this.loadBookingsWithReviews();
  }
}
