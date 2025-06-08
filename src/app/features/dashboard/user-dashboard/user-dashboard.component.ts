import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CleanerCardComponent,
  CleanerCardModel,
} from '../../cleaner/cleaner-card/cleaner-card.component';
import { CleanerService } from '../../../core/services/cleaner-service.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FavoritesService } from '../../../core/services/favorites.service';
import { ReviewService } from '../../../core/services/review.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, CleanerCardComponent, FormsModule],
  templateUrl: './user-dashboard.component.html',
})
export class UserDashboardComponent {
  cleaners: CleanerCardModel[] = [];
  filteredCleaners: CleanerCardModel[] = [];
  searchTerm = '';

  constructor(
    private cleanerService: CleanerService,
    private router: Router,
    private favoritesService: FavoritesService,
    private reviewService: ReviewService
  ) {}

  ngOnInit() {
    this.cleanerService.getCleaners().subscribe((cleaners) => {
      this.cleaners = cleaners;

      // For each cleaner, fetch reviews and update rating/reviewCount
      for (const cleaner of this.cleaners) {
        this.reviewService.getReviewsForCleaner(cleaner.id).subscribe((reviews) => {
          cleaner.rating = reviews.length
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;
          cleaner.reviewCount = reviews.length;
        });
      }

      this.favoritesService.getFavorites().subscribe((favIds) => {
        for (const cleaner of this.cleaners) {
          cleaner.isFavorite = favIds.includes(cleaner.id);
        }

        this.filteredCleaners = [...this.cleaners];
      });
    });
  }

  onSearchChange() {
    const term = this.searchTerm.toLowerCase();
    this.filteredCleaners = this.cleaners.filter(
      (c) =>
        c.fullName.toLowerCase().includes(term) ||
        c.location.toLowerCase().includes(term)
    );
    this.onSortChange();
  }

  sortOption: 'default' | 'rating' | 'price' = 'default';

  onSortChange() {
    if (this.sortOption === 'rating') {
      this.filteredCleaners.sort((a, b) => b.rating - a.rating);
    } else if (this.sortOption === 'price') {
      this.filteredCleaners.sort((a, b) => a.price - b.price);
    } else {
      // reset to original order
      this.filteredCleaners = [...this.cleaners].filter(
        (c) =>
          c.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          c.location.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  onCardClicked(cleaner: CleanerCardModel) {
    this.router.navigate(['/cleaner', cleaner.id]);
  }

  toggleFavorite(cleanerId: string) {
    const cleaner = this.cleaners.find((c) => c.id === cleanerId);
    if (!cleaner) return;

    cleaner.isFavorite = !cleaner.isFavorite;

    const op = cleaner.isFavorite
      ? this.favoritesService.addToFavorites(cleanerId)
      : this.favoritesService.removeFromFavorites(cleanerId);

    op.subscribe({
      next: () => this.onSearchChange(), // re-filter and refresh
      error: () => {
        // Revert if backend fails
        cleaner.isFavorite = !cleaner.isFavorite;
        console.error('Failed to toggle favorite');
      },
    });
  }
}
