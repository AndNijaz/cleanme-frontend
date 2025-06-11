import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  CleanerService,
  PublicCleanerProfile,
} from '../../../core/services/cleaner-service.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { StorageService } from '../../../core/services/storage.service';
import { FavoritesService } from '../../../core/services/favorites.service';

import { Review } from '../../../core/services/models/review.model';
import { ReservationRequest } from '../../../core/services/models/reservation.model';

@Component({
  selector: 'app-cleaner-public-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cleaner-public-profile.component.html',
  styleUrls: [],
})
export class CleanerPublicProfileComponent implements OnInit {
  cleaner: (PublicCleanerProfile & { id: string }) | null = null;
  reviews: Review[] = [];

  cleanerId: string = '';
  loading: boolean = true;
  error: string | null = null;
  isFavorited: boolean = false;

  // Expose Math to template
  Math = Math;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cleanerService: CleanerService,
    private storageService: StorageService,
    private favoritesService: FavoritesService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.cleanerId = params['id'];
      console.log('🆔 Loading cleaner profile for ID:', this.cleanerId);
      this.loadCleanerProfile();
    });
  }

  private loadCleanerProfile() {
    this.loading = true;
    this.error = null;

    this.cleanerService.getCleanerPublicProfile(this.cleanerId).subscribe({
      next: (cleaner: PublicCleanerProfile) => {
        console.log('📋 Backend cleaner data:', cleaner);
        this.cleaner = { ...cleaner, id: this.cleanerId };
        this.checkFavoriteStatus();
        this.loading = false;
      },
      error: (error: any) => {
        console.error(
          '❌ Error loading cleaner profile for ID:',
          this.cleanerId,
          error
        );

        if (error.status === 404) {
          this.error = `Sorry, this cleaner's profile is not available at the moment. Please try selecting a different cleaner.`;
        } else if (error.status === 0) {
          this.error =
            'Unable to connect to our servers. Please check your internet connection and try again.';
        } else if (error.status === 403) {
          this.error = `This cleaner's detailed profile is currently unavailable. Please try again later or contact support.`;
        } else {
          this.error = `We're having trouble loading this cleaner's profile. Please try again in a few moments.`;
        }

        this.loading = false;
      },
    });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  navigateToBooking(): void {
    this.router.navigate(['/cleaner', this.cleanerId, 'reserve']);
  }

  // ADDED: Share functionality
  shareProfile() {
    const url = window.location.href;
    const text = `Check out ${this.cleaner?.fullName}'s cleaning services on CleanMe!`;

    if (navigator.share) {
      // Use native share API if available (mobile devices)
      navigator
        .share({
          title: `${this.cleaner?.fullName} - CleanMe`,
          text: text,
          url: url,
        })
        .then(() => {
          console.log('✅ Profile shared successfully');
        })
        .catch((error) => {
          console.log('❌ Error sharing profile:', error);
          this.fallbackShare(url, text);
        });
    } else {
      // Fallback for desktop browsers
      this.fallbackShare(url, text);
    }
  }

  private fallbackShare(url: string, text: string) {
    if (navigator.clipboard) {
      // Copy to clipboard
      navigator.clipboard
        .writeText(url)
        .then(() => {
          alert('✅ Profile link copied to clipboard!');
        })
        .catch(() => {
          // Final fallback
          this.openShareWindow(url, text);
        });
    } else {
      this.openShareWindow(url, text);
    }
  }

  private openShareWindow(url: string, text: string) {
    // Create share options
    const shareData = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        url
      )}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
      )}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      email: `mailto:?subject=${encodeURIComponent(
        'Check out this cleaner on CleanMe'
      )}&body=${encodeURIComponent(text + '\n\n' + url)}`,
    };

    // Simple prompt for share method
    const shareMethod = prompt(
      'Choose how to share:\n1. Facebook\n2. Twitter\n3. WhatsApp\n4. Email\n5. Just copy link\n\nEnter number (1-5):'
    );

    switch (shareMethod) {
      case '1':
        window.open(shareData.facebook, '_blank', 'width=600,height=400');
        break;
      case '2':
        window.open(shareData.twitter, '_blank', 'width=600,height=400');
        break;
      case '3':
        window.open(shareData.whatsapp, '_blank');
        break;
      case '4':
        window.location.href = shareData.email;
        break;
      default:
        // Copy to clipboard as fallback
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url);
          alert('✅ Profile link copied to clipboard!');
        } else {
          alert(`Copy this link: ${url}`);
        }
    }
  }

  // FIXED: Book Now functionality
  bookNow() {
    if (!this.cleaner) {
      alert('❌ Unable to book - cleaner information not loaded');
      return;
    }

    // Check if user is logged in using StorageService
    if (!this.storageService.isLoggedIn()) {
      alert('Please log in to book a cleaner');
      this.router.navigate(['/auth/login']);
      return;
    }

    // Navigate to booking page
    console.log(
      `🚀 Booking cleaner: ${this.cleaner.fullName} (ID: ${this.cleanerId})`
    );
    this.router.navigate(['/cleaner', this.cleanerId, 'reserve']);
  }

  /**
   * Check if current cleaner is in favorites
   */
  private checkFavoriteStatus(): void {
    if (this.cleanerId) {
      this.isFavorited = this.favoritesService.isFavorite(this.cleanerId);
    }
  }

  /**
   * Toggle favorite status of current cleaner
   */
  toggleFavorite(): void {
    if (!this.cleaner) {
      console.warn('⚠️ Cannot toggle favorite: cleaner data not loaded');
      return;
    }

    if (!this.storageService.isLoggedIn()) {
      alert('Please log in to add cleaners to your favorites');
      this.router.navigate(['/auth/login']);
      return;
    }

    const wasAdded = this.favoritesService.toggleFavorite(
      this.cleanerId,
      this.cleaner.fullName,
      this.cleaner.hourlyRate || 0,
      this.cleaner.rating || 0
    );

    this.isFavorited = wasAdded;

    // Provide user feedback
    if (wasAdded) {
      console.log(`💖 Added ${this.cleaner.fullName} to favorites`);
      // You could show a toast notification here instead of alert
      setTimeout(() => {
        alert(`💖 ${this.cleaner?.fullName} added to your favorites!`);
      }, 100);
    } else {
      console.log(`💔 Removed ${this.cleaner.fullName} from favorites`);
      setTimeout(() => {
        alert(`💔 ${this.cleaner?.fullName} removed from your favorites`);
      }, 100);
    }
  }
}
