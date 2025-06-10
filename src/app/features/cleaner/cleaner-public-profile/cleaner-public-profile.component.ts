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

  // Expose Math to template
  Math = Math;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cleanerService: CleanerService
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
}
