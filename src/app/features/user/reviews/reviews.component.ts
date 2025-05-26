import { Component, OnInit } from '@angular/core';
import { Review, ReviewService } from '../../../core/services/review.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReviewsCardComponent } from './reviews-card/reviews-card.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css'],
  standalone: true,
  imports: [ReviewsCardComponent, CommonModule],
})
export class ReviewsComponent implements OnInit {
  reviews: Review[] = [];
  isLoading = true;

  constructor(
    private reviewService: ReviewService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getAuthData()?.userId || '';
    this.reviewService.getUserReviews(userId).subscribe({
      next: (data) => {
        this.reviews = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load reviews', err);
        this.isLoading = false;
      },
    });
  }
}
