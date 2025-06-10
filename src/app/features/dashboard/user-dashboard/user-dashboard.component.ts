import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FavoritesService } from '../../../core/services/favorites.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { BookingService } from '../../../services/booking.service';
import { BookingProgressComponent } from '../../../components/booking-progress/booking-progress.component';
import { forkJoin } from 'rxjs';

interface DashboardBooking {
  rid?: string; // Add booking ID
  cleanerName: string;
  cleanerInitials: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  isPast: boolean;
  location?: string;
  totalCost?: number;
}

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, BookingProgressComponent],
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
  error: string | null = null;

  // Progress tracking
  expandedBooking: string | null = null;

  constructor(
    private authService: AuthService,
    private favoritesService: FavoritesService,
    private reservationService: ReservationService,
    private bookingService: BookingService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDashboardData();

    // Auto-refresh removed - using manual refresh button only
  }

  getUserName(): string {
    const authData = this.authService.getAuthData();
    if (authData?.firstName && authData?.lastName) {
      return `${authData.firstName} ${authData.lastName}`;
    }
    return 'User';
  }

  private loadDashboardData() {
    console.log('📡 Loading dashboard data...');

    // Get current user ID from auth data
    const authData = this.authService.getAuthData();
    if (!authData?.userId) {
      console.warn('❌ No authenticated user found');
      this.error = 'Please log in to view your dashboard';
      this.isLoading = false;
      return;
    }

    const userId = authData.userId;
    console.log(`👤 Loading data for user: ${userId}`);

    // Load all dashboard data in parallel
    forkJoin({
      favorites: this.favoritesService.getFavorites(),
      reservations: this.reservationService.getUserReservations(),
    }).subscribe({
      next: ({ favorites, reservations }) => {
        this.isLoading = false;
        this.error = null;

        console.log('📊 Dashboard data loaded successfully:', {
          favoritesCount: favorites.length,
          reservationsCount: reservations.length,
          reservations: reservations,
        });

        // Set favorites count
        this.favoriteCount = favorites.length;

        // Process reservations
        this.processReservations(reservations);
      },
      error: (error) => {
        console.error('❌ Error loading dashboard data:', error);
        this.isLoading = false;
        this.error = 'Failed to load dashboard data. Please try again.';
        this.setFallbackData();
      },
    });
  }

  private processReservations(reservations: any[]) {
    console.log('🔄 Processing reservations from backend:', reservations);

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Debug: Log all raw statuses from backend
    reservations.forEach((r, index) => {
      console.log(
        `📋 Reservation ${index + 1}: Status = "${
          r.status
        }" (${typeof r.status})`
      );
    });

    // Filter and categorize reservations
    const upcomingReservations = reservations.filter((r) => {
      const reservationDate = this.parseReservationDate(r.date);
      const isUpcoming =
        reservationDate >= now &&
        ![
          'cancelled',
          'CANCELLED',
          'completed',
          'COMPLETED',
          'finished',
          'FINISHED',
        ].includes(r.status);
      console.log(
        `⏰ Reservation ${
          r.rid || r.id
        }: isUpcoming = ${isUpcoming}, status = ${r.status}`
      );
      return isUpcoming;
    });

    const completedReservations = reservations.filter((r) => {
      const reservationDate = this.parseReservationDate(r.date);
      const isCompleted =
        reservationDate < now ||
        ['completed', 'COMPLETED', 'finished', 'FINISHED'].includes(r.status);
      console.log(
        `✅ Reservation ${
          r.rid || r.id
        }: isCompleted = ${isCompleted}, status = ${r.status}`
      );
      return isCompleted;
    });

    this.upcomingBookings = upcomingReservations.length;
    this.completedServices = completedReservations.length;

    console.log(
      `📊 Summary: ${this.upcomingBookings} upcoming, ${this.completedServices} completed`
    );

    // Create recent bookings display (last 5, most recent first)
    const sortedReservations = [...reservations]
      .sort((a, b) => {
        const dateA = this.parseReservationDate(a.date);
        const dateB = this.parseReservationDate(b.date);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5);

    this.recentBookings = sortedReservations.map((reservation) => {
      const reservationDate = this.parseReservationDate(reservation.date);
      const isPast = reservationDate < now;
      const normalizedStatus = this.normalizeStatus(reservation.status);

      console.log(
        `🔄 Mapping reservation ${reservation.rid || reservation.id}: "${
          reservation.status
        }" → "${normalizedStatus}"`
      );

      return {
        rid: reservation.rid || reservation.id, // Include the booking ID
        cleanerName: reservation.cleanerName || 'Cleaner',
        cleanerInitials: this.getInitials(reservation.cleanerName || 'Cleaner'),
        date: this.formatDisplayDate(reservation.date),
        time: this.formatDisplayTime(reservation.time),
        status: normalizedStatus,
        isPast,
        location: reservation.location || 'Location provided',
        totalCost: this.calculateCost(reservation),
      };
    });

    console.log('✨ Final processed bookings:', this.recentBookings);
  }

  private parseReservationDate(dateStr: string): Date {
    if (!dateStr) return new Date();

    // Handle different date formats
    if (dateStr.includes('.')) {
      // Format: "21.3.2023"
      const parts = dateStr.split('.');
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // JS months are 0-indexed
        const year = parseInt(parts[2]);
        return new Date(year, month, day);
      }
    }

    // Handle ISO format or other standard formats
    return new Date(dateStr);
  }

  private formatDisplayDate(dateStr: string): string {
    const date = this.parseReservationDate(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  private formatDisplayTime(timeStr: string): string {
    if (!timeStr) return '09:00';

    // Handle time formats like "17:00" or "17:00:00"
    const timeMatch = timeStr.match(/(\d{1,2}:\d{2})/);
    return timeMatch ? timeMatch[1] : timeStr.substring(0, 5);
  }

  private normalizeStatus(
    status: string
  ): 'pending' | 'confirmed' | 'completed' | 'cancelled' {
    if (!status) {
      console.log('⚠️ No status provided, defaulting to pending');
      return 'pending';
    }

    console.log(`🔧 Normalizing status: "${status}" (${typeof status})`);

    // Handle all possible backend status values (case-insensitive)
    const statusUpper = status.toUpperCase();
    const statusLower = status.toLowerCase();

    // Pending states
    if (['PENDING', 'pending'].includes(status)) {
      console.log('✅ Mapped to: pending');
      return 'pending';
    }

    // Confirmed states
    if (['CONFIRMED', 'confirmed'].includes(status)) {
      console.log('✅ Mapped to: confirmed');
      return 'confirmed';
    }

    // Ongoing states (treat as confirmed for display)
    if (['ONGOING', 'ongoing', 'IN_PROGRESS', 'in_progress'].includes(status)) {
      console.log('✅ Mapped to: confirmed (ongoing work)');
      return 'confirmed';
    }

    // Completed states - handle all possible completion statuses
    if (
      [
        'COMPLETED',
        'completed',
        'FINISHED',
        'finished',
        'DONE',
        'done',
        'SUCCESS',
        'success',
        'COMPLETE',
        'complete',
      ].includes(status)
    ) {
      console.log('✅ Mapped to: completed');
      return 'completed';
    }

    // Cancelled states
    if (['CANCELLED', 'cancelled', 'CANCELED', 'canceled'].includes(status)) {
      console.log('✅ Mapped to: cancelled');
      return 'cancelled';
    }

    // Fallback for any unmapped status
    console.log(`⚠️ Unknown status "${status}", defaulting to pending`);
    return 'pending';
  }

  private calculateCost(reservation: any): number {
    // Estimate cost based on service type and duration
    const baseRate = 25; // BAM per hour
    const averageHours = 3; // Average cleaning duration
    return baseRate * averageHours;
  }

  private getInitials(name: string): string {
    if (!name) return 'CL';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  private setFallbackData() {
    this.upcomingBookings = 0;
    this.favoriteCount = 0;
    this.completedServices = 0;
    this.recentBookings = [];
  }

  // Template helper methods
  getStatusColor(status: string): string {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  }

  getStatusText(status: string): string {
    const statusMap = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return statusMap[status as keyof typeof statusMap] || status;
  }

  formatCurrency(amount: number): string {
    return `${amount.toFixed(2)} BAM`;
  }

  // Action methods
  refreshDashboard() {
    this.loadDashboardData();
  }

  // Progress tracking methods
  toggleProgress(bookingId: string) {
    this.expandedBooking =
      this.expandedBooking === bookingId ? null : bookingId;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  contactCleaner(booking: DashboardBooking) {
    alert(`Contacting ${booking.cleanerName}...`);
  }

  cancelBooking(booking: DashboardBooking) {
    if (
      confirm(
        `Are you sure you want to cancel your booking with ${booking.cleanerName}?`
      )
    ) {
      alert('Booking cancelled successfully');
      this.refreshDashboard();
    }
  }

  leaveReview(booking: DashboardBooking) {
    if (!this.canLeaveReview(booking)) {
      alert(
        `Review not available yet. ${this.getReviewAvailabilityMessage(
          booking
        )}`
      );
      return;
    }

    // Navigate to bookings page with cleaner pre-expanded
    this.router.navigate(['/user/reservations'], {
      queryParams: {
        expandCleaner: booking.cleanerName,
        bookingId: booking.rid,
      },
    });
  }

  // Review availability logic (same as bookings-review component)
  canLeaveReview(booking: DashboardBooking): boolean {
    // For dashboard, we can't check if review exists, so just check status and time
    const bookingStatus = booking.status?.toLowerCase();

    // Can review if cleaner finished the job
    if (['finished', 'completed'].includes(bookingStatus)) {
      return true;
    }

    // Can review if 48 hours have passed since booking date + time
    return this.has48HoursPassed(booking);
  }

  has48HoursPassed(booking: DashboardBooking): boolean {
    if (!booking.date || !booking.time) return false;

    // Parse the formatted date back to a proper date
    const bookingDate = new Date(booking.date);
    const [hours, minutes] = booking.time.split(':');
    bookingDate.setHours(parseInt(hours), parseInt(minutes));

    const now = new Date();
    const diffInHours =
      (now.getTime() - bookingDate.getTime()) / (1000 * 60 * 60);

    return diffInHours >= 48;
  }

  getReviewAvailabilityMessage(booking: DashboardBooking): string {
    const bookingStatus = booking.status?.toLowerCase();

    if (['finished', 'completed'].includes(bookingStatus)) {
      return 'Review available';
    }

    if (['cancelled'].includes(bookingStatus)) {
      return 'Service cancelled';
    }

    const timeUntilReview = this.getTimeUntilReviewAvailable(booking);
    if (timeUntilReview) {
      return `Review available ${timeUntilReview}`;
    }

    return 'Waiting for service completion';
  }

  getTimeUntilReviewAvailable(booking: DashboardBooking): string | null {
    if (!booking.date || !booking.time) return null;

    // Parse the formatted date back to a proper date
    const bookingDate = new Date(booking.date);
    const [hours, minutes] = booking.time.split(':');
    bookingDate.setHours(parseInt(hours), parseInt(minutes));

    const reviewAvailableTime = new Date(
      bookingDate.getTime() + 48 * 60 * 60 * 1000
    ); // 48 hours later
    const now = new Date();

    if (now >= reviewAvailableTime) {
      return null; // Already available
    }

    const diffInMs = reviewAvailableTime.getTime() - now.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(
      (diffInMs % (1000 * 60 * 60)) / (1000 * 60)
    );

    if (diffInHours > 24) {
      const days = Math.floor(diffInHours / 24);
      const remainingHours = diffInHours % 24;
      return `in ${days}d ${remainingHours}h`;
    } else if (diffInHours > 0) {
      return `in ${diffInHours}h ${diffInMinutes}m`;
    } else {
      return `in ${diffInMinutes}m`;
    }
  }
}
