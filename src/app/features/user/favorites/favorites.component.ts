import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  FavoritesService,
  FavoriteItem,
} from '../../../core/services/favorites.service';
import { StorageService } from '../../../core/services/storage.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './favorites.component.html',
})
export class FavoritesComponent implements OnInit, OnDestroy {
  favorites: FavoriteItem[] = [];
  loading: boolean = false;
  private favoritesSubscription?: Subscription;

  constructor(
    private favoritesService: FavoritesService,
    private storageService: StorageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.storageService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.loadFavorites();
  }

  ngOnDestroy(): void {
    if (this.favoritesSubscription) {
      this.favoritesSubscription.unsubscribe();
    }
  }

  getAverageRating(): string {
    if (this.favorites.length === 0) return '0.0';

    const validRatings = this.favorites.filter((f) => f.rating && f.rating > 0);
    if (validRatings.length === 0) return '0.0';

    const average =
      validRatings.reduce((sum, f) => sum + (f.rating || 0), 0) /
      validRatings.length;
    return average.toFixed(1);
  }

  getInitials(cleanerName: string): string {
    return cleanerName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  private loadFavorites(): void {
    this.loading = true;

    // Subscribe to favorites changes
    this.favoritesSubscription = this.favoritesService
      .getFavorites$()
      .subscribe({
        next: (favorites) => {
          this.favorites = favorites;
          this.loading = false;
          console.log(`📋 Loaded ${favorites.length} favorite cleaners`);
        },
        error: (error) => {
          console.error('❌ Error loading favorites:', error);
          this.favorites = [];
          this.loading = false;
        },
      });
  }

  removeFromFavorites(cleanerId: string): void {
    const favorite = this.favorites.find((f) => f.cleanerId === cleanerId);
    if (!favorite) return;

    const success = this.favoritesService.removeFromFavorites(cleanerId);
    if (success) {
      console.log(`💔 Removed ${favorite.cleanerName} from favorites`);
    }
  }

  navigateToDetails(cleanerId: string): void {
    this.router.navigate(['/cleaner', cleanerId]);
  }

  clearAllFavorites(): void {
    if (
      confirm(
        'Are you sure you want to remove all cleaners from your favorites?'
      )
    ) {
      this.favoritesService.clearAllFavorites();
      console.log('🗑️ Cleared all favorites');
    }
  }
}
