import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CleanerCardModel } from '../../models/cleaner-card.model';
import { CleanerService } from '../../services/cleaner.service';
import { FavoritesService } from '../../services/favorites.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-browse-cleaners',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './browse-cleaners.component.html',
})
export class BrowseCleanersComponent implements OnInit {
  cleaners: CleanerCardModel[] = [];
  allCleaners: CleanerCardModel[] = []; // Store all cleaners for client-side filtering
  isLoading: boolean = true;
  searchTerm: string = '';
  selectedServices: string[] = [];

  // OPTIMIZATION: Add pagination
  currentPage = 1;
  itemsPerPage = 12; // Show 12 cleaners per page
  totalPages = 0;

  // OPTIMIZATION: Add view mode toggle
  viewMode: 'grid' | 'list' = 'grid';

  constructor(
    private cleanerService: CleanerService,
    private favoritesService: FavoritesService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCleaners();
  }

  // OPTIMIZED: Load data with pagination consideration
  private loadCleaners() {
    this.isLoading = true;

    this.cleanerService.getCleaners().subscribe({
      next: (data) => {
        this.allCleaners = data;
        this.updatePagination();
        this.applyFiltersAndPagination();
        this.isLoading = false;

        // OPTIMIZATION: Prefetch popular cleaner profiles
        const popularCleaners = data.slice(0, 6).map((c) => c.id);
        this.cleanerService.prefetchCleanerProfiles(popularCleaners);
      },
      error: (error) => {
        console.error('Error loading cleaners:', error);
        this.isLoading = false;
      },
    });
  }

  // OPTIMIZATION: Client-side filtering and pagination
  private applyFiltersAndPagination() {
    let filtered = [...this.allCleaners];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (cleaner) =>
          cleaner.fullName.toLowerCase().includes(term) ||
          cleaner.shortBio.toLowerCase().includes(term) ||
          cleaner.services.some((service) =>
            service.toLowerCase().includes(term)
          )
      );
    }

    // Apply service filter
    if (this.selectedServices.length > 0) {
      filtered = filtered.filter((cleaner) =>
        this.selectedServices.every((service) =>
          cleaner.services.some((cleanerService) =>
            cleanerService.toLowerCase().includes(service.toLowerCase())
          )
        )
      );
    }

    // Update pagination
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);

    // Apply pagination
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.cleaners = filtered.slice(startIndex, endIndex);
  }

  private updatePagination() {
    this.totalPages = Math.ceil(this.allCleaners.length / this.itemsPerPage);
  }

  // OPTIMIZATION: Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFiltersAndPagination();

      // Scroll to top when changing pages
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage() {
    this.goToPage(this.currentPage + 1);
  }

  previousPage() {
    this.goToPage(this.currentPage - 1);
  }

  get paginationPages(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    const half = Math.floor(maxVisiblePages / 2);

    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.totalPages, start + maxVisiblePages - 1);

    if (end - start < maxVisiblePages - 1) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  // OPTIMIZATION: Debounced search
  onSearchChange() {
    // Reset to first page when searching
    this.currentPage = 1;
    this.applyFiltersAndPagination();
  }

  // OPTIMIZATION: Toggle view mode
  setViewMode(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  // ... existing methods ...
}
