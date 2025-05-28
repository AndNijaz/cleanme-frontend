import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FavoritesService } from '../../../../core/services/favorites.service';
import { CleanerCardModel } from '../../../cleaner/cleaner-card/cleaner-card.component';
import {
  Review,
  ReviewService,
} from '../../../../core/services/review.service';
import { FormsModule } from '@angular/forms';

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
  @Output() submitUpdated = new EventEmitter<Review>();

  @Input() initialMessage: string | undefined = '';
  @Input() isEditing = false;

  @Output() ratingChange = new EventEmitter<number>();
  @Output() submitReview = new EventEmitter<{
    reviewId?: string;
    rating: number;
    message: string;
  }>();

  currentRating: number | undefined = 0;
  reviewMessage: string | undefined = '';

  constructor(
    private favoritesService: FavoritesService,
    private reviewService: ReviewService
  ) {}

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

  // submitReview() {
  //   if (this.reviewId) {
  //     this.submitUpdated.emit({
  //       id: this.reviewId,
  //       cleanerId: this.cleaner.id,
  //       cleanerName: this.cleaner.fullName,
  //       rating: this.currentRating,
  //       message: 'Edited via modal',
  //       date: new Date().toISOString().split('T')[0],
  //     });
  //   } else {
  //     // original submission logic
  //     const reviewPayload = {
  //       cleanerId: this.cleaner.id,
  //       cleanerName: this.cleaner.fullName,
  //       rating: this.currentRating,
  //       message: `Rated ${this.currentRating} stars via modal`, // You can replace with form input later
  //     };

  //     this.reviewService.submitReview(reviewPayload).subscribe({
  //       next: (res) => {
  //         if (res.success) {
  //           console.log('✅ Review submitted successfully');
  //         } else {
  //           console.error('❌ Review failed');
  //         }
  //       },
  //       error: () => {
  //         console.error('❌ Error during review submission');
  //       },
  //     });
  //   }
  // }

  submitReviewHandler() {
    if (!this.currentRating || !this.reviewMessage) {
      console.warn('⚠️ Rating and message required');
      return;
    }

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
