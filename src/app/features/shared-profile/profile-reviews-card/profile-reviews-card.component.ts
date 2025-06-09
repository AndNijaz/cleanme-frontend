import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ReviewService } from '../../../core/services/review.service';
import { Review } from '../../../core/services/models/review.model';
import { User } from '../../../core/services/user.service';

@Component({
  selector: 'app-profile-reviews-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './profile-reviews-card.component.html',
})
export class ProfileReviewsCardComponent implements OnInit {
  @Input() profile: User | null = null;

  allCleanerReviews: Review[] = [];
  averageRating: number = 0;
  showAllReviews: boolean = false;

  get displayedReviews(): Review[] {
    return this.showAllReviews
      ? this.allCleanerReviews
      : this.allCleanerReviews.slice(0, 3);
  }

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {
    if (!this.profile || !this.profile.id) {
      console.warn('ProfileReviewsCard: No id found in profile:', this.profile);
      return;
    }

    this.reviewService
      .getReviewsForCleaner(this.profile.id)
      .subscribe((reviews) => {
        this.allCleanerReviews = reviews;
        this.averageRating = reviews.length
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;
        console.log('ProfileReviewsCard: Reviews fetched:', reviews);
      });
  }

  toggleShowAllReviews(): void {
    this.showAllReviews = !this.showAllReviews;
  }

  getStarArray(): number[] {
    return [1, 2, 3, 4, 5];
  }
}
