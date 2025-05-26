import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import {
  CleanerCardComponent,
  CleanerCardModel,
} from '../../cleaner/cleaner-card/cleaner-card.component';
import { FavoritesService } from '../../../core/services/favorites.service';
import { AuthService } from '../../../core/services/auth.service';

// Temporary mock list – replace later with real service call to get cleaner data
const MOCK_CLEANERS: CleanerCardModel[] = [
  {
    id: '1',
    fullName: 'Amina Mujkić',
    rating: 4.8,
    reviewCount: 24,
    location: 'Novo Sarajevo',
    shortBio: 'Pouzdana i precizna čistačica s 4+ godina iskustva.',
    services: ['Deep Cleaning', 'Office Cleaning'],
    price: 15,
    currency: 'BAM',
    imageUrl: '',
    isFavorite: true,
  },
  {
    id: '2',
    fullName: 'Lejla Dedić',
    rating: 4.5,
    reviewCount: 12,
    location: 'Stari Grad',
    shortBio: 'Specijalizovana za detaljno čišćenje i prozore.',
    services: ['Window Washing', 'Floor Cleaning'],
    price: 17,
    currency: 'BAM',
    imageUrl: '',
    isFavorite: true,
  },
];

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
    private router: Router
  ) {}

  ngOnInit(): void {
    // This should eventually fetch IDs and hydrate from backend
    this.favoritesService.getFavorites().subscribe((ids) => {
      this.favorites = MOCK_CLEANERS.filter((c) => ids.includes(c.id));
    });
  }

  toggleFavorite(cleanerId: string) {
    const cleaner = this.favorites.find((c) => c.id === cleanerId);
    if (!cleaner) return;

    if (cleaner.isFavorite) {
      this.favoritesService.removeFromFavorites(cleanerId).subscribe(() => {
        cleaner.isFavorite = false;
        this.favorites = this.favorites.filter((c) => c.id !== cleanerId);
      });
    } else {
      this.favoritesService.addToFavorites(cleanerId).subscribe(() => {
        cleaner.isFavorite = true;
        // Optional: you might want to refetch full cleaner data
      });
    }
  }

  navigateToDetails(cleanerId: string) {
    this.router.navigate(['/cleaner', cleanerId]);
  }
}
