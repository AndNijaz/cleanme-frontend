import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FavoritesService } from '../../../core/services/favorites.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { forkJoin } from 'rxjs';

interface DashboardBooking {
  cleanerName: string;
  cleanerInitials: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed';
  isPast: boolean;
}

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-dashboard.component.html',
})
export class UserDashboardComponent implements OnInit {
  // Dashboard statistics
  upcomingBookings = 0;
  favoriteCount = 0;
  completedServices = 0;

  // Recent bookings data
  recentBookings: DashboardBooking[] = [];

  // Loading state
  isLoading = true;

  constructor(
    private authService: AuthService,
    private favoritesService: FavoritesService,
    private reservationService: ReservationService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  getUserName(): string {
    const authData = this.authService.getAuthData();
    if (authData?.firstName && authData?.lastName) {
      return `${authData.firstName} ${authData.lastName}`;
    }
    return 'User';
  }

  private loadDashboardData() {
    // Get current user ID from auth data
    const authData = this.authService.getAuthData();
    if (!authData?.userId) {
      console.warn('No authenticated user found');
      return;
    }

    const userId = authData.userId;

    // Load all dashboard data in parallel
    forkJoin({
      favorites: this.favoritesService.getFavorites(),
      reservations: this.reservationService.getUserReservations(),
    }).subscribe({
      next: ({ favorites, reservations }) => {
        this.isLoading = false;

        // Set favorites count
        this.favoriteCount = favorites.length;

        // Process reservations
        const now = new Date();
        const upcomingReservations = reservations.filter(
          (r) => new Date(r.date) >= now
        );
        this.upcomingBookings = upcomingReservations.length;

        // Calculate completed services from reservations
        const completedReservations = reservations.filter(
          (r) =>
            new Date(r.date) < now || r.status?.toLowerCase() === 'completed'
        );
        this.completedServices = completedReservations.length;

        // Create recent bookings from reservations (last 5, most recent first)
        const sortedReservations = [...reservations]
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .slice(0, 5);

        this.recentBookings = sortedReservations.map((reservation) => {
          const reservationDate = new Date(reservation.date);
          const isUpcoming = reservationDate >= now;

          return {
            cleanerName: reservation.cleanerName,
            cleanerInitials: this.getInitials(reservation.cleanerName, ''),
            date: reservationDate.toLocaleDateString(),
            time: reservation.time || '10:00', // Backend returns single time, not array
            status: isUpcoming
              ? ('confirmed' as const)
              : ('completed' as const),
            isPast: !isUpcoming,
          };
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading dashboard data:', error);
        // Set fallback values on error
        this.favoriteCount = 0;
        this.upcomingBookings = 0;
        this.completedServices = 0;
        this.recentBookings = [];
      },
    });
  }

  private getInitials(fullName: string, lastName?: string): string {
    if (lastName) {
      // If we have separate first and last names
      const first = fullName?.charAt(0)?.toUpperCase() || '';
      const last = lastName?.charAt(0)?.toUpperCase() || '';
      return first + last || 'U';
    } else {
      // Extract initials from full name
      const names = fullName?.split(' ') || [];
      const first = names[0]?.charAt(0)?.toUpperCase() || '';
      const last = names[1]?.charAt(0)?.toUpperCase() || '';
      return first + last || 'U';
    }
  }
}
