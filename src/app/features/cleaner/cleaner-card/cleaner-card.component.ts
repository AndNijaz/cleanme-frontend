import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface CleanerCardModel {
  id: string;
  fullName: string;
  rating: number;
  reviewCount: number;
  location: string;
  shortBio: string;
  services: string[]; // e.g., ['Deep Cleaning', 'Window Washing']
  price: number;
  currency?: string;
  imageUrl?: string;
  isFavorite?: boolean;
}

@Component({
  selector: 'app-cleaner-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './cleaner-card.component.html',
})
export class CleanerCardComponent {
  @Input() cleaner!: CleanerCardModel;
  @Output() detailsClicked = new EventEmitter<void>();
  @Output() toggleFavorite = new EventEmitter<string>();
}
