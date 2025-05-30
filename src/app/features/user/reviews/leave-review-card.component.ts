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

  currentRating: number | undefined = 0;
  reviewMessage: string | undefined = '';

  constructor(private favoritesService: FavoritesService) {}

  ngOnInit(): void {
    this.currentRating = this.initialRating;
    this.reviewMessage = this.initialMessage;

    this.favoritesService.getFavorites().subscribe((ids) => {
      this.cleaner.isFavorite = ids.includes(this.cleaner.id);
    });
  }

  setRating(star: number) {
    this.currentRating = star;
    this.ratingChange.emit(this.currentRating);
  }

  submitReviewHandler() {
    if (!this.currentRating || !this.reviewMessage) {
      console.warn('⚠️ Rating and message required');
      return;
    }

    // console.log('buking', this.booking);

    this.submitReview.emit({
      reviewId: this.reviewId,
      rating: this.currentRating,
      message: this.reviewMessage,
    });
  }

  toggleFavorite() {
    const id = this.cleaner.id;
    this.cleaner.isFavorite = !this.cleaner.isFavorite;

    const op = this.cleaner.isFavorite
      ? this.favoritesService.addToFavorites(id)
      : this.favoritesService.removeFromFavorites(id);

    op.subscribe({
      next: () => {
        console.log(
          `❤️ Favorite updated: ${this.cleaner.fullName} (${this.cleaner.isFavorite})`
        );
      },
      error: () => {
        this.cleaner.isFavorite = !this.cleaner.isFavorite; // revert on failure
        console.error('❌ Failed to update favorite status');
      },
    });
  }
}
