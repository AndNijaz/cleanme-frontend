import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from './storage.service';

export interface FavoriteItem {
  cleanerId: string;
  cleanerName: string;
  hourlyRate: number;
  rating: number;
  dateAdded: string;
}

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private readonly FAVORITES_KEY = 'user_favorites';
  private favoritesSubject = new BehaviorSubject<FavoriteItem[]>([]);
  public favorites$ = this.favoritesSubject.asObservable();

  constructor(private storageService: StorageService) {
    this.loadFavorites();
  }

  /**
   * Load favorites from localStorage
   */
  private loadFavorites(): void {
    try {
      const userId = this.storageService.getUserId();
      if (!userId) {
        this.favoritesSubject.next([]);
        return;
      }

      const userFavoritesKey = `${this.FAVORITES_KEY}_${userId}`;
      const stored = localStorage.getItem(userFavoritesKey);
      const favorites = stored ? JSON.parse(stored) : [];
      this.favoritesSubject.next(favorites);
    } catch (error) {
      console.error('❌ Error loading favorites:', error);
      this.favoritesSubject.next([]);
    }
  }

  /**
   * Save favorites to localStorage
   */
  private saveFavorites(favorites: FavoriteItem[]): void {
    try {
      const userId = this.storageService.getUserId();
      if (!userId) {
        console.warn('⚠️ Cannot save favorites: User not logged in');
        return;
      }

      const userFavoritesKey = `${this.FAVORITES_KEY}_${userId}`;
      localStorage.setItem(userFavoritesKey, JSON.stringify(favorites));
      this.favoritesSubject.next(favorites);
    } catch (error) {
      console.error('❌ Error saving favorites:', error);
    }
  }

  /**
   * Add a cleaner to favorites
   */
  addToFavorites(
    cleanerId: string,
    cleanerName: string,
    hourlyRate: number = 0,
    rating: number = 0
  ): boolean {
    if (!this.storageService.isLoggedIn()) {
      console.warn('⚠️ User must be logged in to add favorites');
      return false;
    }

    const currentFavorites = this.favoritesSubject.value;

    // Check if already in favorites
    if (this.isFavorite(cleanerId)) {
      console.log('ℹ️ Cleaner already in favorites');
      return false;
    }

    const newFavorite: FavoriteItem = {
      cleanerId,
      cleanerName,
      hourlyRate,
      rating,
      dateAdded: new Date().toISOString(),
    };

    const updatedFavorites = [...currentFavorites, newFavorite];
    this.saveFavorites(updatedFavorites);

    console.log(`💖 Added ${cleanerName} to favorites`);
    return true;
  }

  /**
   * Remove a cleaner from favorites
   */
  removeFromFavorites(cleanerId: string): boolean {
    const currentFavorites = this.favoritesSubject.value;
    const updatedFavorites = currentFavorites.filter(
      (fav) => fav.cleanerId !== cleanerId
    );

    if (updatedFavorites.length === currentFavorites.length) {
      console.log('ℹ️ Cleaner was not in favorites');
      return false;
    }

    this.saveFavorites(updatedFavorites);
    console.log(`💔 Removed cleaner from favorites`);
    return true;
  }

  /**
   * Toggle favorite status of a cleaner
   */
  toggleFavorite(
    cleanerId: string,
    cleanerName: string,
    hourlyRate: number = 0,
    rating: number = 0
  ): boolean {
    if (this.isFavorite(cleanerId)) {
      this.removeFromFavorites(cleanerId);
      return false; // Removed from favorites
    } else {
      this.addToFavorites(cleanerId, cleanerName, hourlyRate, rating);
      return true; // Added to favorites
    }
  }

  /**
   * Check if a cleaner is in favorites
   */
  isFavorite(cleanerId: string): boolean {
    return this.favoritesSubject.value.some(
      (fav) => fav.cleanerId === cleanerId
    );
  }

  /**
   * Get all favorites
   */
  getFavorites(): FavoriteItem[] {
    return this.favoritesSubject.value;
  }

  /**
   * Get favorites as observable
   */
  getFavorites$(): Observable<FavoriteItem[]> {
    return this.favorites$;
  }

  /**
   * Get favorites count
   */
  getFavoritesCount(): number {
    return this.favoritesSubject.value.length;
  }

  /**
   * Clear all favorites
   */
  clearAllFavorites(): void {
    this.saveFavorites([]);
    console.log('🗑️ Cleared all favorites');
  }

  /**
   * Refresh favorites (reload from storage)
   */
  refreshFavorites(): void {
    this.loadFavorites();
  }
}
