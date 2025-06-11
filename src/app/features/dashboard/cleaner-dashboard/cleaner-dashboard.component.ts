import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReservationService } from '../../../core/services/reservation.service';
import { AuthService } from '../../../core/services/auth.service';
import { CleanerService } from '../../../core/services/cleaner-service.service';
import { forkJoin, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Booking } from '../../../core/services/models/reservation.model';
import {
  CleanerServicesCardComponent,
  CleanerData,
} from './cleaner-services-card/cleaner-services-card.component';

interface DashboardJob extends Booking {
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  clientInitials: string;
  isUpcoming: boolean;
  clientLocation?: string;
}

interface DashboardStats {
  totalJobs: number;
  upcomingJobs: number;
  completedJobs: number;
  totalEarnings: number;
  todayJobs: number;
  activeJobs: number;
}

@Component({
  selector: 'app-cleaner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CleanerServicesCardComponent],
  templateUrl: './cleaner-dashboard.component.html',
})
export class CleanerDashboardComponent implements OnInit {
  // Dashboard statistics
  stats: DashboardStats = {
    totalJobs: 0,
    upcomingJobs: 0,
    completedJobs: 0,
    totalEarnings: 0,
    todayJobs: 0,
    activeJobs: 0,
  };

  // Recent jobs data
  recentJobs: DashboardJob[] = [];

  // Loading state
  isLoading = true;
  error: string | null = null;

  // Current cleaner info
  cleanerId: string = '';
  cleanerName: string = '';
  cleanerData: CleanerData | null = null;

  constructor(
    private reservationService: ReservationService,
    private authService: AuthService,
    private cleanerService: CleanerService
  ) {}

  ngOnInit() {
    this.initializeCleaner();
    this.loadDashboardData();
  }

  private initializeCleaner() {
    // Get cleaner info from auth service
    const authData = this.authService.getAuthData();

    if (authData) {
      this.cleanerId = authData.userId;
      this.cleanerName = `${authData.firstName} ${authData.lastName}`;
    } else {
      // Fallback to localStorage
      this.cleanerId = localStorage.getItem('userId') || '';
      this.cleanerName = localStorage.getItem('firstName') || 'Cleaner';
    }
  }

  private loadDashboardData() {
    if (!this.cleanerId) {
      this.error = 'Cleaner ID not found. Please log in again.';
      this.isLoading = false;
      return;
    }

    console.log('🔄 Starting cleaner dashboard data load...');

    // Load both bookings and cleaner profile data without timeout for now
    forkJoin({
      bookings: this.reservationService.getCleanerBookings(this.cleanerId).pipe(
        tap(() => console.log('✅ Cleaner bookings loaded')),
        catchError((error) => {
          console.error('❌ Cleaner bookings error:', error);
          return of([]); // Return empty array on error
        })
      ),
      cleanerProfile: this.cleanerService
        .getCleanerPublicProfile(this.cleanerId)
        .pipe(
          tap(() => console.log('✅ Cleaner profile loaded')),
          catchError((error) => {
            console.error('❌ Cleaner profile error:', error);
            return of({}); // Return empty object on error
          })
        ),
    }).subscribe({
      next: ({ bookings, cleanerProfile }) => {
        console.log('📊 Starting to process cleaner dashboard data...');

        this.processBookingsData(bookings);
        this.processCleanerProfile(cleanerProfile);
        this.isLoading = false;

        console.log('📊 Cleaner dashboard data loaded successfully');
        console.log('✨ Cleaner dashboard processing complete!');
      },
      error: (error) => {
        console.error('❌ Error loading cleaner dashboard data:', error);
        this.error = 'Failed to load dashboard data. Please try again.';
        this.isLoading = false;
        this.setFallbackData();
      },
    });
  }

  private processBookingsData(bookings: Booking[]) {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Convert bookings to dashboard jobs
    this.recentJobs = bookings
      .map((booking) => {
        const bookingDate = this.parseBookingDate(booking.date);
        return {
          ...booking,
          id: booking.rid || booking.id, // Use rid as primary ID
          message: booking.comment || booking.message, // Use comment as message
          status: booking.status
            ? this.mapBackendStatus(booking.status)
            : this.determineJobStatus(bookingDate, now),
          clientInitials: this.getInitials(booking.clientName || 'Client'),
          isUpcoming: bookingDate >= today,
          clientLocation: this.extractAddress(
            booking.comment || booking.location
          ),
        } as DashboardJob;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5); // Show only recent 5 jobs

    // Calculate statistics
    this.calculateStats(bookings, now, today);
  }

  private determineJobStatus(
    bookingDate: Date,
    now: Date
  ): DashboardJob['status'] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDateOnly = new Date(bookingDate);
    bookingDateOnly.setHours(0, 0, 0, 0);

    if (bookingDateOnly < today) {
      return 'completed';
    } else if (bookingDateOnly.getTime() === today.getTime()) {
      return 'in-progress';
    } else {
      return 'confirmed';
    }
  }

  // Map backend status to frontend status
  private mapBackendStatus(backendStatus: string): DashboardJob['status'] {
    const statusMap: Record<string, DashboardJob['status']> = {
      PENDING: 'pending',
      CONFIRMED: 'confirmed',
      ONGOING: 'in-progress',
      FINISHED: 'completed',
      CANCELLED: 'cancelled',
    };

    return statusMap[backendStatus?.toUpperCase()] || 'pending';
  }

  // Map frontend status to backend status
  private mapFrontendToBackendStatus(
    frontendStatus: DashboardJob['status']
  ): string {
    const statusMap: Record<DashboardJob['status'], string> = {
      pending: 'PENDING',
      confirmed: 'CONFIRMED',
      'in-progress': 'ONGOING',
      completed: 'FINISHED',
      cancelled: 'CANCELLED',
    };

    return statusMap[frontendStatus] || 'PENDING';
  }

  private parseBookingDate(dateStr: string): Date {
    // Handle different date formats
    if (dateStr.includes('.')) {
      // Format: "21.3.2023"
      const parts = dateStr.split('.');
      if (parts.length === 3) {
        return new Date(
          parseInt(parts[2]),
          parseInt(parts[1]) - 1,
          parseInt(parts[0])
        );
      }
    }
    // Fallback to standard Date parsing
    return new Date(dateStr);
  }

  private processCleanerProfile(profile: any) {
    // Convert the profile data to CleanerData format
    const servicesOffered =
      profile.services?.map((s: any) => s.name).join(', ') || '';

    this.cleanerData = {
      servicesOffered,
      hourlyRate: profile.hourlyRate || 0,
      availability: profile.availability || [],
      bio: profile.bio ? [profile.bio] : [],
    };
  }

  private calculateStats(bookings: Booking[], now: Date, today: Date) {
    const totalJobs = bookings.length;
    const upcomingJobs = bookings.filter(
      (b) => this.parseBookingDate(b.date) >= today
    ).length;
    const completedJobs = bookings.filter(
      (b) => this.parseBookingDate(b.date) < today
    ).length;
    const todayJobs = bookings.filter((b) => {
      const bookingDate = this.parseBookingDate(b.date);
      return bookingDate.toDateString() === today.toDateString();
    }).length;

    // Calculate earnings based on completed jobs
    const baseRate = 25; // BAM per hour
    const avgHours = 3; // Average hours per job
    const totalEarnings = completedJobs * baseRate * avgHours;

    this.stats = {
      totalJobs,
      upcomingJobs,
      completedJobs,
      totalEarnings,
      todayJobs,
      activeJobs: upcomingJobs,
    };
  }

  private setFallbackData() {
    // Set default values when API fails
    this.stats = {
      totalJobs: 0,
      upcomingJobs: 0,
      completedJobs: 0,
      totalEarnings: 0,
      todayJobs: 0,
      activeJobs: 0,
    };
    this.recentJobs = [];
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

  private extractAddress(messageOrLocation: string): string {
    // Try to extract address from message or use location directly
    if (!messageOrLocation) return 'Address provided';

    // If it looks like a direct address (no sentence structure), use it as-is
    if (messageOrLocation.length < 100 && !messageOrLocation.includes('.')) {
      return messageOrLocation;
    }

    // Look for common address patterns in longer messages
    const addressMatch = messageOrLocation.match(
      /(?:address|location|at)\s*:?\s*(.+)/i
    );
    if (addressMatch) {
      return addressMatch[1].trim();
    }

    return messageOrLocation.substring(0, 50) + '...'; // Truncate long messages
  }

  // Template helper methods
  getCleanerName(): string {
    const authData = this.authService.getAuthData();

    // First, try to get name from auth service
    if (authData?.firstName && authData?.lastName) {
      const firstName = authData.firstName.trim();
      const lastName = authData.lastName.trim();

      // Make sure we don't have placeholder values
      if (
        firstName !== 'sada' &&
        lastName !== 'sada' &&
        firstName !== '' &&
        lastName !== ''
      ) {
        return `${firstName} ${lastName}`;
      }
    }

    // Fallback to localStorage directly
    const firstNameLS = localStorage.getItem('firstName');
    const lastNameLS = localStorage.getItem('lastName');

    if (
      firstNameLS &&
      lastNameLS &&
      firstNameLS !== 'sada' &&
      lastNameLS !== 'sada'
    ) {
      return `${firstNameLS.trim()} ${lastNameLS.trim()}`;
    }

    // Final fallback

    return this.cleanerName || 'Professional Cleaner';
  }

  getDashboardTitle(): string {
    return `Welcome back, ${this.getCleanerName()}!`;
  }

  getDashboardSubtitle(): string {
    return "Here's your cleaning business overview for today";
  }

  formatCurrency(amount: number): string {
    return `${amount.toFixed(2)} BAM`;
  }

  formatDate(dateString: string): string {
    const date = this.parseBookingDate(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  getStatusColor(status: string): string {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  }

  getStatusText(status: string): string {
    const statusMap = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      'in-progress': 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return statusMap[status as keyof typeof statusMap] || status;
  }

  // Action methods
  confirmJob(jobId: string) {
    this.updateJobStatus(jobId, 'confirmed');
  }

  cancelJob(jobId: string) {
    this.updateJobStatus(jobId, 'cancelled');
  }

  private updateJobStatus(jobId: string, status: DashboardJob['status']) {
    const job = this.recentJobs.find((j) => j.id === jobId);
    if (job) {
      console.log('🔄 Updating job status:', jobId, 'to', status);
      console.log('📋 Job details:', job);

      // Update locally first for immediate UI feedback
      const originalStatus = job.status;
      job.status = status;

      // Update in backend - map frontend status to backend status
      const backendStatus = this.mapFrontendToBackendStatus(status);

      // Build complete UpdateReservationDto with all required fields
      const updateData = {
        cleanerId: this.cleanerId, // Current cleaner ID
        date: job.date, // Keep existing date
        time: job.time, // Keep existing time
        location: job.clientLocation || job.location || 'Address provided', // Keep existing location
        status: backendStatus, // Update to new status
        comment: job.message || job.comment || '', // Keep existing comment
      };

      console.log('📤 Sending update data to backend:', updateData);

      this.reservationService
        .updateReservationStatus(jobId, updateData as any)
        .subscribe({
          next: (response) => {
            console.log('✅ Job status updated successfully:', response);
            // Refresh dashboard data to ensure consistency
            this.loadDashboardData();
          },
          error: (error) => {
            console.error('❌ Error updating job status:', error);
            console.error('❌ Error details:', error.error);
            console.error('❌ Full error object:', error);

            // Revert the status change if backend update fails
            job.status = originalStatus;

            // Show user-friendly error message
            this.error = `Failed to ${
              status === 'confirmed' ? 'confirm' : 'cancel'
            } booking. Please try again.`;

            // Clear error after 5 seconds
            setTimeout(() => {
              this.error = null;
            }, 5000);
          },
        });
    }
  }
}
