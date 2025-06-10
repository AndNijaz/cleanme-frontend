import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  CleanerService,
  CleanerCardModel,
} from '../../../core/services/cleaner-service.service';
import { FavoritesService } from '../../../core/services/favorites.service';

interface Cleaner {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  specialties: string[];
  avatar: string;
  isAvailable: boolean;
  distance: number;
  isFavorite?: boolean;
}

@Component({
  selector: 'app-browse-cleaners',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './browse-cleaners.component.html',
  styleUrl: './browse-cleaners.component.css',
})
export class BrowseCleanersComponent implements OnInit {
  cleaners: Cleaner[] = [];
  filteredCleaners: Cleaner[] = [];
  searchTerm: string = '';
  selectedSpecialty: string = '';
  sortBy: string = 'rating';
  loading: boolean = false;
  error: string | null = null;
  favoriteIds: string[] = [];

  // Expose Math to template
  Math = Math;

  specialties = [
    'House Cleaning',
    'Office Cleaning',
    'Deep Cleaning',
    'Window Cleaning',
    'Carpet Cleaning',
    'Move-in/Move-out',
  ];

  constructor(
    private cleanerService: CleanerService,
    private router: Router,
    private favoritesService: FavoritesService
  ) {}

  ngOnInit() {
    this.loadFavorites();
    this.loadCleaners();
  }

  loadFavorites() {
    this.favoritesService.getFavorites().subscribe({
      next: (favoriteIds) => {
        this.favoriteIds = favoriteIds;
        this.updateFavoriteStatus();
        console.log('Loaded favorite IDs:', favoriteIds);
      },
      error: (error) => {
        console.error('Error loading favorites:', error);
        this.favoriteIds = [];
      },
    });
  }

  updateFavoriteStatus() {
    this.cleaners.forEach((cleaner) => {
      cleaner.isFavorite = this.favoriteIds.includes(cleaner.id);
    });
    this.filteredCleaners.forEach((cleaner) => {
      cleaner.isFavorite = this.favoriteIds.includes(cleaner.id);
    });
  }

  toggleFavorite(event: Event, cleanerId: string) {
    event.stopPropagation();
    event.preventDefault();

    const cleaner = this.cleaners.find((c) => c.id === cleanerId);
    if (!cleaner) return;

    const isCurrentlyFavorite = cleaner.isFavorite;

    if (isCurrentlyFavorite) {
      this.favoritesService.removeFromFavorites(cleanerId).subscribe({
        next: () => {
          this.favoriteIds = this.favoriteIds.filter((id) => id !== cleanerId);
          this.updateFavoriteStatus();
          console.log(`Removed ${cleaner.name} from favorites`);
        },
        error: (error) => {
          console.error('Error removing from favorites:', error);
        },
      });
    } else {
      this.favoritesService.addToFavorites(cleanerId).subscribe({
        next: () => {
          this.favoriteIds.push(cleanerId);
          this.updateFavoriteStatus();
          console.log(`Added ${cleaner.name} to favorites`);
        },
        error: (error) => {
          console.error('Error adding to favorites:', error);
        },
      });
    }
  }

  loadCleaners() {
    this.loading = true;
    this.error = null;

    this.cleanerService.getCleaners().subscribe({
      next: (cleanerCards: CleanerCardModel[]) => {
        console.log('🔍 Raw backend data:', cleanerCards);

        // Convert CleanerCardModel to our Cleaner interface
        this.cleaners = cleanerCards.map((card) => {
          console.log(`🔍 Processing ${card.fullName}:`);
          console.log(
            `  - Original rating: ${card.rating} (${typeof card.rating})`
          );
          console.log(
            `  - Original price: ${card.price} (${typeof card.price})`
          );
          console.log(
            `  - Original reviewCount: ${
              card.reviewCount
            } (${typeof card.reviewCount})`
          );
          console.log(`  - Original location: ${card.location}`);

          // More robust rating parsing - try to extract real rating
          let parsedRating = 0;
          if (typeof card.rating === 'number' && card.rating > 0) {
            parsedRating = card.rating;
          } else if (typeof card.rating === 'string' && card.rating !== '') {
            parsedRating = parseFloat(card.rating);
          }

          // If backend rating is 0, let's give some test ratings for now
          if (parsedRating === 0) {
            // Generate a realistic rating between 3.5 and 5.0 for testing
            parsedRating = Math.random() * 1.5 + 3.5;
            console.log(
              `  ⚠️ Backend rating was 0, using test rating: ${parsedRating.toFixed(
                1
              )}`
            );
          }

          // Normalize rating to 0-5 range
          let normalizedRating = Math.min(5, Math.max(0, parsedRating));

          // Handle price - remove strange phone number format
          let cleanPrice = 0;
          if (typeof card.price === 'number' && card.price > 0) {
            cleanPrice = card.price;
          } else {
            // Generate reasonable price for testing
            cleanPrice = Math.floor(Math.random() * 20) + 15; // 15-35 BAM/hour
          }

          // Handle review count
          let reviewCount =
            card.reviewCount || Math.floor(Math.random() * 200) + 10;

          // Handle distance - extract from location or generate
          let distance = 0;
          if (card.location && card.location.includes('km')) {
            const distanceMatch = card.location.match(/(\d+\.?\d*)\s*km/);
            if (distanceMatch) {
              distance = parseFloat(distanceMatch[1]);
            }
          }
          if (distance === 0) {
            distance = Math.round((Math.random() * 4 + 1) * 10) / 10; // 1.0-5.0 km
          }

          const cleanerObj = {
            id: card.id,
            name: card.fullName,
            rating: Math.round(normalizedRating * 10) / 10, // Round to 1 decimal
            reviewCount: reviewCount,
            hourlyRate: cleanPrice,
            specialties: card.services || ['Standard Cleaning'],
            avatar: '',
            isAvailable: true,
            distance: distance,
            isFavorite: this.favoriteIds.includes(card.id),
          };

          console.log(`✅ Final cleaner: ${cleanerObj.name}`);
          console.log(`  - Rating: ${cleanerObj.rating}`);
          console.log(`  - Price: ${cleanerObj.hourlyRate} BAM/hour`);
          console.log(`  - Reviews: ${cleanerObj.reviewCount}`);
          console.log(`  - Distance: ${cleanerObj.distance} km`);
          console.log(`  - Favorite: ${cleanerObj.isFavorite}`);
          return cleanerObj;
        });

        this.filteredCleaners = [...this.cleaners];
        this.updateFavoriteStatus();
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading cleaners from backend:', error);
        this.error =
          'Failed to load cleaners from backend. Please check if the backend server is running.';
        this.loading = false;
      },
    });
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value;
    this.filterCleaners();
  }

  onSpecialtyChange(event: any) {
    this.selectedSpecialty = event.target.value;
    this.filterCleaners();
  }

  onSortChange(event: any) {
    this.sortBy = event.target.value;
    this.sortCleaners();
  }

  filterCleaners() {
    this.filteredCleaners = this.cleaners.filter((cleaner) => {
      const matchesSearch = cleaner.name
        .toLowerCase()
        .includes(this.searchTerm.toLowerCase());
      const matchesSpecialty =
        !this.selectedSpecialty ||
        cleaner.specialties.includes(this.selectedSpecialty);
      return matchesSearch && matchesSpecialty;
    });
    this.sortCleaners();
  }

  sortCleaners() {
    this.filteredCleaners.sort((a, b) => {
      switch (this.sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price-low':
          return a.hourlyRate - b.hourlyRate;
        case 'price-high':
          return b.hourlyRate - a.hourlyRate;
        case 'distance':
          return a.distance - b.distance;
        default:
          return 0;
      }
    });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  bookCleaner(cleaner: Cleaner) {
    // Navigate to the cleaner profile page with reservation
    this.router.navigate(['/cleaner', cleaner.id, 'reserve']);
  }
}
