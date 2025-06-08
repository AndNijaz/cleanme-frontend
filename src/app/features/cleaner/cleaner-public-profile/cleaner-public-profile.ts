import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {
  CleanerService,
  PublicCleanerProfile,
} from '../../../core/services/cleaner-service.service';
import { ReviewService } from '../../../core/services/review.service';
import { Review } from '../../../core/services/models/review.model';

@Component({
  selector: 'app-cleaner-public-profile',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './cleaner-public-profile.component.html',
})
export class CleanerPublicProfileComponent implements OnInit {
  cleaner: (PublicCleanerProfile & { id: string }) | null = null;
  allCleanerReviews: Review[] = [];
  averageRating: number = 0;

  constructor(
    private route: ActivatedRoute,
    private cleanerService: CleanerService,
    private reviewService: ReviewService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cleanerService.getCleanerPublicProfile(id).subscribe({
        next: (data) => {
          this.cleaner = { ...data, id };
        },
        error: (err) => {
          console.error('Failed to load cleaner profile:', err);
        },
      });
      this.reviewService.getReviewsForCleaner(id).subscribe((reviews) => {
        this.allCleanerReviews = reviews;
        this.averageRating = reviews.length
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0;
        console.log('CleanerPublicProfile: Reviews fetched:', reviews);
      });
    }
  }
  goToReservation() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.router.navigate(['/cleaner', id, 'reserve']);
    }
  }
}
