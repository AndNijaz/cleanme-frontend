import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FavoritesService } from '../../../core/services/favorites.service';
import { CleanerCardModel } from '../../cleaner/cleaner-card/cleaner-card.component';
import { ReviewService } from '../../../core/services/review.service';
import { FormsModule } from '@angular/forms';
import { Review, ReviewDto } from '../../../core/services/models/review.model';

@Component({
  selector: 'app-leave-review-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './leave-review-card.component.html',
})
export class LeaveReviewCardComponent implements OnInit {
  @Input() cleaner!: CleanerCardModel;
  @Input() initialRating: number | undefined = 0;
  @Input() reviewId?: string;
  // @Input() booking?: any;
  @Output() submitUpdated = new EventEmitter<Review>();
  hoveredRating: number | null = null;

  @Input() initialMessage: string | undefined = '';
  @Input() isEditing = false;

  @Output() ratingChange = new EventEmitter<number>();
  @Output() submitReview = new EventEmitter<ReviewDto>();
  @Output() close = new EventEmitter<void>();

  currentRating: number | undefined = 0;
  reviewMessage: string | undefined = '';
  personalNote: string = '';

  allCleanerReviews: Review[] = [];
  showAllReviews = false;

  constructor(
    private favoritesService: FavoritesService,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    this.currentRating = this.initialRating;
    this.reviewMessage = this.initialMessage;

    // Check if cleaner is in favorites using new service
    this.cleaner.isFavorite = this.favoritesService.isFavorite(this.cleaner.id);

    if (this.cleaner?.id) {
      this.reviewService
        .getReviewsForCleaner(this.cleaner.id)
        .subscribe((reviews) => {
          this.allCleanerReviews = reviews;
        });
    }
  }

  setRating(star: number) {
    this.currentRating = star;
    this.ratingChange.emit(this.currentRating);
    console.log('Rating set to:', star);
  }

  submitReviewHandler() {
    if (!this.currentRating || this.currentRating === 0) {
      console.warn('⚠️ Rating is required');
      // You could show a toast notification here
      return;
    }

    console.log('Submitting review:', {
      rating: this.currentRating,
      message: this.reviewMessage,
      personalNote: this.personalNote,
    });

    this.submitReview.emit({
      reviewId: this.reviewId,
      rating: this.currentRating,
      message: this.reviewMessage || '',
    });

    // Refresh reviews after submit
    if (this.cleaner?.id) {
      this.reviewService
        .getReviewsForCleaner(this.cleaner.id)
        .subscribe((reviews) => {
          this.allCleanerReviews = reviews;
        });
    }
  }

  toggleFavorite() {
    const id = this.cleaner.id;
    const currentFavoriteStatus = this.cleaner.isFavorite;

    if (currentFavoriteStatus) {
      const success = this.favoritesService.removeFromFavorites(id);
      if (success) {
        this.cleaner.isFavorite = false;
        console.log(`💔 Removed ${this.cleaner.fullName} from favorites`);
      }
    } else {
      const success = this.favoritesService.addToFavorites(
        id,
        this.cleaner.fullName
      );
      if (success) {
        this.cleaner.isFavorite = true;
        console.log(`💖 Added ${this.cleaner.fullName} to favorites`);
      }
    }
  }

  get averageRating(): number {
    if (!this.allCleanerReviews.length) return 0;
    return (
      this.allCleanerReviews.reduce((sum, r) => sum + r.rating, 0) /
      this.allCleanerReviews.length
    );
  }

  get displayedReviews() {
    return this.showAllReviews
      ? this.allCleanerReviews
      : this.allCleanerReviews.slice(0, 2);
  }

  toggleShowAllReviews() {
    this.showAllReviews = !this.showAllReviews;
  }

  closeModal() {
    this.close.emit();
  }
}
