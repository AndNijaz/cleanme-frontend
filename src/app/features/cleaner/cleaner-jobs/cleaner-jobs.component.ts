import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationService } from '../../../core/services/reservation.service';
import { AuthService } from '../../../core/services/auth.service';

interface Job {
  id: string;
  clientName: string;
  address: string;
  date: string;
  time: string;
  duration: number;
  service: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  rate: number;
  notes?: string;
  clientPhone?: string;
}

@Component({
  selector: 'app-cleaner-jobs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cleaner-jobs.component.html',
  styleUrl: './cleaner-jobs.component.css',
})
export class CleanerJobsComponent implements OnInit {
  jobs: Job[] = [];
  filteredJobs: Job[] = [];
  selectedStatus: string = 'all';
  loading: boolean = false;
  error: string | null = null;
  cleanerId: string = '';

  statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  constructor(
    private reservationService: ReservationService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.initializeCleaner();
    this.loadJobs();
  }

  private initializeCleaner() {
    // Get cleaner info from auth service first
    const authData = this.authService.getAuthData();
    if (authData) {
      this.cleanerId = authData.userId;
    } else {
      // Fallback to localStorage
      this.cleanerId = localStorage.getItem('userId') || '';
    }
  }

  loadJobs() {
    this.loading = true;
    this.error = null;

    if (!this.cleanerId) {
      this.error = 'Cleaner ID not found. Please log in again.';
      this.loading = false;
      return;
    }

    this.reservationService.getCleanerBookings(this.cleanerId).subscribe({
      next: (bookings) => {
        // Convert booking data to job format
        this.jobs = bookings.map((booking, index) => {
          const bookingDate = this.parseBookingDate(booking.date);

          return {
            id:
              booking.rid || booking.id || booking.bookingId || `job-${index}`,
            clientName: booking.clientName || this.extractClientName(booking),
            address: this.extractLocationFromBooking(booking),
            date: this.formatBackendDate(booking.date),
            time: this.extractTimeFromString(booking.time),
            duration: this.extractDurationFromString(booking.time),
            service: 'House Cleaning Service',
            status: booking.status
              ? this.mapBackendStatus(booking.status)
              : this.determineJobStatus(bookingDate),
            rate: this.calculateJobRate(booking),
            notes:
              booking.comment ||
              booking.message ||
              'No special instructions provided',
            clientPhone: booking.clientPhone || 'Phone not provided', // Real phone from backend
          };
        });

        this.loading = false;
        this.filterJobs();
      },
      error: (error) => {
        console.error('Error loading jobs:', error);
        this.error = 'Failed to load jobs. Please try again later.';
        this.loading = false;
        this.jobs = []; // Clear jobs on error
        this.filterJobs();
      },
    });
  }

  private extractClientName(booking: any): string {
    // Try different fields for client name
    if (booking.clientName) return booking.clientName;
    if (booking.cleanerName) return booking.cleanerName;
    if (booking.userName) return booking.userName;

    // Extract from message if available
    const nameMatch = booking.message?.match(/name:\s*(.+)|client:\s*(.+)/i);
    if (nameMatch) {
      const extractedName = nameMatch[1] || nameMatch[2];
      return extractedName.trim();
    }

    return 'Client'; // Fallback
  }

  private extractTimeFromString(timeStr: string): string {
    if (!timeStr) return '09:00';

    // Handle formats like "17:00 to 21:00" or "17:00-21:00" or just "17:00"
    const timeMatch = timeStr.match(/(\d{1,2}:\d{2})/);
    return timeMatch ? timeMatch[1] : timeStr.substring(0, 5);
  }

  private extractDurationFromString(timeStr: string): number {
    if (!timeStr) return 3; // Default 3 hours

    // Look for patterns like "17:00 to 21:00" or "17:00-21:00"
    const rangeMatch = timeStr.match(
      /(\d{1,2}):(\d{2})\s*(?:to|-)\s*(\d{1,2}):(\d{2})/
    );
    if (rangeMatch) {
      const startHour = parseInt(rangeMatch[1]);
      const startMin = parseInt(rangeMatch[2]);
      const endHour = parseInt(rangeMatch[3]);
      const endMin = parseInt(rangeMatch[4]);

      const startTime = startHour + startMin / 60;
      const endTime = endHour + endMin / 60;
      const duration = endTime - startTime;

      return duration > 0 ? duration : 3;
    }

    return 3; // Default 3 hours
  }

  filterJobs() {
    if (this.selectedStatus === 'all') {
      this.filteredJobs = [...this.jobs];
    } else {
      this.filteredJobs = this.jobs.filter(
        (job) => job.status === this.selectedStatus
      );
    }

    // Sort by date (newest first for pending/confirmed, oldest first for completed)
    this.filteredJobs.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      if (this.selectedStatus === 'completed') {
        return dateB - dateA; // Newest completed first
      } else {
        return dateA - dateB; // Nearest upcoming first
      }
    });
  }

  onStatusFilterChange(event: any) {
    this.selectedStatus = event.target.value;
    this.filterJobs();
  }

  getStatusText(status: string): string {
    const statusMap = {
      pending: 'Pending Approval',
      confirmed: 'Confirmed',
      'in-progress': 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    };
    return statusMap[status as keyof typeof statusMap] || status;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  updateJobStatus(jobId: string, newStatus: Job['status']) {
    const job = this.jobs.find((j) => j.id === jobId);
    if (job) {
      const oldStatus = job.status;

      console.log('🔄 Updating job status:', {
        jobId,
        oldStatus,
        newStatus,
        cleanerId: this.cleanerId,
      });

      // Update locally first for immediate UI feedback
      job.status = newStatus;
      this.filterJobs();

      // Map frontend status to backend status
      const backendStatus = this.mapFrontendToBackendStatus(newStatus);

      // Build complete UpdateReservationDto with ALL required fields
      const updateData = {
        cleanerId: this.cleanerId, // Backend expects cleanerId (UUID)
        date: job.date, // Backend expects LocalDate
        time: job.time, // Backend expects LocalTime
        location: job.address, // Backend expects location string
        status: backendStatus, // Backend expects ReservationStatus enum
        comment: job.notes || '', // Backend expects comment (optional)
      };

      console.log('📤 Sending complete update data:', updateData);

      this.reservationService
        .updateReservationStatus(jobId, updateData as any)
        .subscribe({
          next: (response) => {
            console.log('✅ Job status updated successfully:', response);
            // Optionally reload jobs to get fresh data from backend
            // this.loadJobs();
          },
          error: (error) => {
            console.error('❌ Error updating job status:', error);
            console.error('❌ Error details:', {
              status: error.status,
              statusText: error.statusText,
              message: error.message,
              error: error.error,
            });

            // Revert the status change if backend update fails
            job.status = oldStatus;
            this.filterJobs();

            // Show user-friendly error message
            if (error.status === 403) {
              this.error =
                'You do not have permission to update this job. Please contact support.';
            } else if (error.status === 404) {
              this.error = 'Job not found. It may have been deleted.';
            } else if (error.status === 401) {
              this.error = 'Please log in again to update jobs.';
            } else {
              this.error = 'Failed to update job status. Please try again.';
            }

            // Clear error after 8 seconds
            setTimeout(() => {
              this.error = null;
            }, 8000);
          },
        });
    }
  }

  // Quick action methods
  confirmJob(jobId: string) {
    this.updateJobStatus(jobId, 'confirmed');
  }

  startJob(jobId: string) {
    this.updateJobStatus(jobId, 'in-progress');
  }

  completeJob(jobId: string) {
    this.updateJobStatus(jobId, 'completed');
  }

  cancelJob(jobId: string) {
    if (confirm('Are you sure you want to cancel this job?')) {
      this.updateJobStatus(jobId, 'cancelled');
    }
  }

  // Statistics methods
  getTotalEarnings(): number {
    return this.jobs
      .filter((job) => job.status === 'completed')
      .reduce((total, job) => total + job.rate * job.duration, 0);
  }

  getUpcomingJobs(): Job[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.jobs.filter(
      (job) =>
        new Date(job.date) >= today &&
        (job.status === 'confirmed' || job.status === 'pending')
    );
  }

  formatCurrency(amount: number): string {
    return `${amount.toFixed(2)} BAM`;
  }

  // Utility methods
  private parseBookingDate(dateStr: string): Date {
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

  private formatBackendDate(dateStr: string): string {
    const date = this.parseBookingDate(dateStr);
    return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
  }

  private extractLocationFromBooking(booking: any): string {
    // Use location field first (from backend)
    if (booking.location) return booking.location;
    if (booking.address) return booking.address;

    // Try to extract from comment or message
    const textToSearch = booking.comment || booking.message;
    if (textToSearch) {
      const locationMatch = textToSearch.match(
        /(?:address|location|at)\s*:?\s*(.+)/i
      );
      if (locationMatch) {
        return locationMatch[1].trim();
      }
    }

    return 'Address will be provided';
  }

  private determineJobStatus(bookingDate: Date): Job['status'] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDateOnly = new Date(bookingDate);
    bookingDateOnly.setHours(0, 0, 0, 0);

    if (bookingDateOnly < today) {
      return 'completed';
    } else if (bookingDateOnly.getTime() === today.getTime()) {
      const now = new Date();
      const currentHour = now.getHours();

      // If it's today and past typical cleaning hours, mark as completed
      if (currentHour > 18) {
        return 'completed';
      } else if (currentHour > 8) {
        return 'in-progress';
      } else {
        return 'confirmed';
      }
    } else {
      return 'confirmed';
    }
  }

  // Map backend status to frontend status
  private mapBackendStatus(backendStatus: string): Job['status'] {
    const statusMap: Record<string, Job['status']> = {
      PENDING: 'pending',
      ONGOING: 'in-progress', // Map ONGOING to in-progress by default
      FINISHED: 'completed',
      CANCELLED: 'cancelled',
    };

    return statusMap[backendStatus?.toUpperCase()] || 'pending';
  }

  // Map frontend status to backend status
  private mapFrontendToBackendStatus(frontendStatus: Job['status']): string {
    const statusMap: Record<Job['status'], string> = {
      pending: 'PENDING',
      confirmed: 'ONGOING', // Backend doesn't have CONFIRMED, use ONGOING
      'in-progress': 'ONGOING',
      completed: 'FINISHED',
      cancelled: 'CANCELLED',
    };

    return statusMap[frontendStatus] || 'PENDING';
  }

  private calculateJobRate(booking: any): number {
    // Try to extract rate from booking data
    if (booking.rate) return booking.rate;
    if (booking.price) return booking.price;

    // Default rate
    return 25; // BAM per hour
  }

  // Contact client method
  contactClient(phoneNumber: string) {
    // Open phone app on mobile or copy to clipboard on desktop
    if (navigator.userAgent.match(/Android|iPhone/i)) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      // Copy to clipboard for desktop users
      navigator.clipboard
        .writeText(phoneNumber)
        .then(() => {
          alert(`Phone number ${phoneNumber} copied to clipboard!`);
        })
        .catch(() => {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = phoneNumber;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          alert(`Phone number ${phoneNumber} copied to clipboard!`);
        });
    }
  }
}
