import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  CleanerCardComponent,
  CleanerCardModel,
} from '../../cleaner/cleaner-card/cleaner-card.component';
import { FavoritesService } from '../../../core/services/favorites.service';
import { AuthService } from '../../../core/services/auth.service';
import { CleanerService } from '../../../core/services/cleaner-service.service';
import { ReviewService } from '../../../core/services/review.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, CleanerCardComponent],
  templateUrl: './favorites.component.html',
})
export class FavoritesComponent implements OnInit {
  favorites: CleanerCardModel[] = [];

  constructor(
    private favoritesService: FavoritesService,
    private authService: AuthService,
    private router: Router,
    private cleanerService: CleanerService,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    this.loadFavoriteCleaners();
  }

  private loadFavoriteCleaners(): void {
    // Get all cleaners and favorite IDs, then filter
    forkJoin({
      allCleaners: this.cleanerService.getCleaners(),
      favoriteIds: this.favoritesService.getFavorites(),
    }).subscribe({
      next: ({ allCleaners, favoriteIds }) => {
        // Filter cleaners that are in favorites
        this.favorites = allCleaners.filter((cleaner) =>
          favoriteIds.includes(cleaner.id)
        );

        // Mark them as favorites and load reviews
        this.favorites.forEach((cleaner) => {
          cleaner.isFavorite = true;

          // Load reviews for each favorite cleaner
          this.reviewService
            .getReviewsForCleaner(cleaner.id)
            .subscribe((reviews) => {
              cleaner.rating = reviews.length
                ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                : 0;
              cleaner.reviewCount = reviews.length;
            });
        });

        console.log(`Loaded ${this.favorites.length} favorite cleaners`);
      },
      error: (error) => {
        console.error('Error loading favorite cleaners:', error);
        this.favorites = [];
      },
    });
  }

  toggleFavorite(cleanerId: string) {
    const cleaner = this.favorites.find((c) => c.id === cleanerId);
    if (!cleaner) return;

    if (cleaner.isFavorite) {
      this.favoritesService.removeFromFavorites(cleanerId).subscribe({
        next: () => {
          cleaner.isFavorite = false;
          this.favorites = this.favorites.filter((c) => c.id !== cleanerId);
          console.log(`Removed ${cleaner.fullName} from favorites`);
        },
        error: (error) => {
          console.error('Error removing from favorites:', error);
        },
      });
    } else {
      this.favoritesService.addToFavorites(cleanerId).subscribe({
        next: () => {
          cleaner.isFavorite = true;
          console.log(`Added ${cleaner.fullName} to favorites`);
        },
        error: (error) => {
          console.error('Error adding to favorites:', error);
        },
      });
    }
  }

  navigateToDetails(cleanerId: string) {
    this.router.navigate(['/cleaner', cleanerId]);
  }
}
