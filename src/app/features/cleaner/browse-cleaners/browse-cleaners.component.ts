import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
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
export class BrowseCleanersComponent implements OnInit, OnDestroy {
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

  private routeSubscription?: Subscription;

  constructor(
    private cleanerService: CleanerService,
    private router: Router,
    private favoritesService: FavoritesService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadFavorites();

    // Read initial URL parameters
    this.activatedRoute.queryParams.subscribe((params) => {
      // Set initial values from URL parameters
      this.searchTerm = params['search'] || '';
      this.selectedSpecialty = params['specialty'] || '';
      this.sortBy = params['sort'] || 'rating';

      // Load cleaners and apply filters
      this.loadCleaners();
    });

    // Subscribe to URL parameter changes
    this.routeSubscription = this.activatedRoute.queryParams.subscribe(
      (params) => {
        // Only update if cleaners are already loaded to avoid duplicate API calls
        if (this.cleaners.length > 0) {
          const newSearch = params['search'] || '';
          const newSpecialty = params['specialty'] || '';
          const newSort = params['sort'] || 'rating';

          // Check if parameters actually changed to avoid infinite loops
          if (
            newSearch !== this.searchTerm ||
            newSpecialty !== this.selectedSpecialty ||
            newSort !== this.sortBy
          ) {
            this.searchTerm = newSearch;
            this.selectedSpecialty = newSpecialty;
            this.sortBy = newSort;
            this.filterCleaners();
          }
        }
      }
    );
  }

  ngOnDestroy() {
    this.routeSubscription?.unsubscribe();
  }

  loadFavorites() {
    // Get favorite cleaner IDs from new service
    const favorites = this.favoritesService.getFavorites();
    this.favoriteIds = favorites.map((fav) => fav.cleanerId);
    this.updateFavoriteStatus();
    console.log('Loaded favorite IDs:', this.favoriteIds);
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
      const success = this.favoritesService.removeFromFavorites(cleanerId);
      if (success) {
        this.favoriteIds = this.favoriteIds.filter((id) => id !== cleanerId);
        this.updateFavoriteStatus();
        console.log(`Removed ${cleaner.name} from favorites`);
      }
    } else {
      const success = this.favoritesService.addToFavorites(
        cleanerId,
        cleaner.name,
        cleaner.hourlyRate,
        cleaner.rating
      );
      if (success) {
        this.favoriteIds.push(cleanerId);
        this.updateFavoriteStatus();
        console.log(`Added ${cleaner.name} to favorites`);
      }
    }
  }

  // OPTIMIZED: Add pagination and prefetching
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

          // More robust rating parsing - use backend rating properly
          let parsedRating = 0;
          if (typeof card.rating === 'number') {
            parsedRating = card.rating;
          } else if (typeof card.rating === 'string' && card.rating !== '') {
            const parsed = parseFloat(card.rating);
            if (!isNaN(parsed)) {
              parsedRating = parsed;
            }
          }

          // Use backend rating (including 0 ratings)
          let normalizedRating = Math.min(5, Math.max(0, parsedRating));

          // Handle price - use backend price properly
          let cleanPrice = 0;
          if (typeof card.price === 'number') {
            cleanPrice = card.price;
          } else if (typeof card.price === 'string' && card.price !== '') {
            // Try to parse string price
            const parsedPrice = parseFloat(card.price);
            if (!isNaN(parsedPrice)) {
              cleanPrice = parsedPrice;
            }
          }

          console.log(`  - Parsed price: ${cleanPrice} BAM/hour`);

          // Handle review count - use backend count properly
          let reviewCount = 0;
          if (typeof card.reviewCount === 'number') {
            reviewCount = card.reviewCount;
          } else if (
            typeof card.reviewCount === 'string' &&
            card.reviewCount !== ''
          ) {
            const parsed = parseInt(card.reviewCount);
            if (!isNaN(parsed)) {
              reviewCount = parsed;
            }
          }

          // Handle distance - extract from location or default to 0
          let distance = 0;
          if (card.location && card.location.includes('km')) {
            const distanceMatch = card.location.match(/(\d+\.?\d*)\s*km/);
            if (distanceMatch) {
              distance = parseFloat(distanceMatch[1]);
            }
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

        // Apply filters and sorting based on URL parameters
        this.filterCleaners();

        this.loading = false;

        // OPTIMIZATION: Prefetch popular cleaner profiles for better performance
        const popularCleaners = this.cleaners.slice(0, 6).map((c) => c.id);
        this.cleanerService.prefetchCleanerProfiles(popularCleaners);
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
    this.updateUrlParams();
    this.filterCleaners();
  }

  onSpecialtyChange(event: any) {
    this.selectedSpecialty = event.target.value;
    this.updateUrlParams();
    this.filterCleaners();
  }

  onSortChange(event: any) {
    this.sortBy = event.target.value;
    this.updateUrlParams();
    this.sortCleaners();
  }

  public updateUrlParams() {
    const queryParams: any = {};

    if (this.searchTerm && this.searchTerm.trim()) {
      queryParams.search = this.searchTerm.trim();
    }

    if (this.selectedSpecialty) {
      queryParams.specialty = this.selectedSpecialty;
    }

    if (this.sortBy && this.sortBy !== 'rating') {
      queryParams.sort = this.sortBy;
    }

    // Update URL without reloading the page
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: queryParams,
      queryParamsHandling: 'replace',
    });
  }

  filterCleaners() {
    this.filteredCleaners = this.cleaners.filter((cleaner) => {
      // Search term matching (name, specialties)
      const searchLower = this.searchTerm.toLowerCase();
      const matchesSearch =
        !this.searchTerm ||
        cleaner.name.toLowerCase().includes(searchLower) ||
        cleaner.specialties.some((specialty) =>
          specialty.toLowerCase().includes(searchLower)
        );

      // Specialty filtering
      const matchesSpecialty =
        !this.selectedSpecialty ||
        cleaner.specialties.some((specialty) =>
          specialty.toLowerCase().includes(this.selectedSpecialty.toLowerCase())
        );

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
