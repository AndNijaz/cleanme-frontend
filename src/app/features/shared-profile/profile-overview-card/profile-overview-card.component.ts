import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../../core/services/review.service';
import { Review } from '../../../core/services/models/review.model';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../../core/services/user.service';

@Component({
  selector: 'app-profile-overview-card',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './profile-overview-card.component.html',
})
export class ProfileOverviewCardComponent {
  @Input() profile: User | null = null;
  @Input() isEditing: boolean = false;
  @Output() onToggleEdit = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<void>();

  allCleanerReviews: Review[] = [];
  averageRating: number = 0;
  showAllReviews = false;

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {
    if (!this.profile || !this.profile.id) {
      console.warn('ProfileOverviewCard: No id found in profile:', this.profile);
      return;
    }
    this.reviewService.getReviewsForCleaner(this.profile.id).subscribe((reviews) => {
      this.allCleanerReviews = reviews;
      this.averageRating = reviews.length
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;
      console.log('ProfileOverviewCard: Reviews fetched:', reviews);
    });
  }

  get displayedReviews() {
    return this.showAllReviews ? this.allCleanerReviews : this.allCleanerReviews.slice(0, 3);
  }

  toggleShowAllReviews() {
    this.showAllReviews = !this.showAllReviews;
  }
}
