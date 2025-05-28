import { Component, OnInit } from '@angular/core';
import { Review, ReviewService } from '../../../core/services/review.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReviewsCardComponent } from './reviews-card/reviews-card.component';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { CleanerCardModel } from '../../cleaner/cleaner-card/cleaner-card.component';
import { MatIconModule } from '@angular/material/icon';
import { LeaveReviewCardComponent } from './leave-review-card/leave-review-card.component';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    LeaveReviewCardComponent,
    ModalComponent,
  ],
})
export class ReviewsComponent implements OnInit {
  reviews: Review[] = [];
  isLoading = true;
  isReviewModalOpen = false;
  selectedReview: Review | null = null;
  //
  groupedReviews: { [cleanerId: string]: Review[] } = {};

  expandedCleanerId: string | null = null;

  currentEditRating = 0;
  currentEditMessage = '';

  toggleCleaner(cleanerId: string) {
    this.expandedCleanerId =
      this.expandedCleanerId === cleanerId ? null : cleanerId;
  }

  constructor(
    private reviewService: ReviewService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getAuthData()?.userId || '';
    this.reviewService.getUserReviews(userId).subscribe({
      next: (data) => {
        this.reviews = data.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ); // newest first
        this.groupReviewsByCleaner();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load reviews', err);
        this.isLoading = false;
      },
    });
  }

  editReview(review: Review) {
    this.selectedReview = review;
    this.currentEditRating = review.rating;
    this.currentEditMessage = review.message;
    this.isReviewModalOpen = true;
  }

  saveEditedReview(updatedReview: Review) {
    this.reviewService.updateReview(updatedReview).subscribe({
      next: (res) => {
        if (res.success) {
          console.log('✅ Review updated!');
          this.isReviewModalOpen = false;
          this.selectedReview = null;
        }
      },
      error: () => console.error('❌ Failed to update review'),
    });
  }

  convertReviewToCleanerCard(review: Review): CleanerCardModel {
    return {
      id: review.cleanerId,
      fullName: review.cleanerName,
      location: 'Ilidža, Grbavica', // ✅ Hardcoded for mock realism
      shortBio: 'Pouzdana i tačna. Čistim stanove i poslovne prostore.',
      services: ['Floor Cleaning', 'Deep Cleaning'],
      rating: review.rating,
      reviewCount: 12,
      price: 85,
      currency: '$',
      imageUrl: review.profileImage ?? '',
      isFavorite: false,
    };
  }

  openReviewModal(review: Review) {
    this.selectedReview = review;
    this.isReviewModalOpen = true;
  }

  groupReviewsByCleaner() {
    this.groupedReviews = {};
    for (const review of this.reviews) {
      if (!this.groupedReviews[review.cleanerId]) {
        this.groupedReviews[review.cleanerId] = [];
      }
      this.groupedReviews[review.cleanerId].push(review);
    }
  }

  saveEditedReviewHandler() {
    if (!this.selectedReview) return;

    const updatedReview: Review = {
      ...this.selectedReview,
      rating: this.currentEditRating,
      message: this.currentEditMessage,
      date: new Date().toISOString().split('T')[0], // Optional: update timestamp
    };

    this.saveEditedReview(updatedReview);
  }

  handleReviewUpdate(payload: {
    reviewId?: string;
    rating: number;
    message: string;
  }) {
    if (this.selectedReview) {
      // We're editing
      const updated: Review = {
        ...this.selectedReview,
        rating: payload.rating,
        message: payload.message,
        date: new Date().toISOString().split('T')[0],
      };

      this.reviewService.updateReview(updated).subscribe({
        next: (res) => {
          if (res.success) {
            console.log('✅ Review updated');
            const index = this.reviews.findIndex((r) => r.id === updated.id);
            if (index !== -1) this.reviews[index] = updated;
            this.groupReviewsByCleaner();
            this.selectedReview = null;
            this.isReviewModalOpen = false;
          }
        },
        error: () => console.error('❌ Failed to update review'),
      });
    } else {
      // We're creating a new review
      const newReviewPayload = {
        cleanerId: 'someCleanerId', // Replace or get it from somewhere (like selected cleaner)
        bookingId: 'someBookingId', // Add the required bookingId field
        cleanerName: 'Unknown', // Optional for mock
        rating: payload.rating,
        message: payload.message,
      };

      this.reviewService.submitReview(newReviewPayload).subscribe({
        next: (res) => {
          if (res.success) {
            console.log('✅ Review submitted');
            // Reload reviews from mock (optional) or just push manually:
            const newReview: Review = {
              ...newReviewPayload,
              id: crypto.randomUUID(),
              date: new Date().toISOString().split('T')[0],
              profileImage: '',
            };
            this.reviews.push(newReview);
            this.groupReviewsByCleaner();
          }
        },
        error: () => console.error('❌ Failed to submit review'),
      });
    }
  }
}
