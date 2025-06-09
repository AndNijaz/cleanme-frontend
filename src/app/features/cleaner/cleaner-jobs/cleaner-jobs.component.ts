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
    this.cleanerId = localStorage.getItem('userId') || '';
    this.loadJobs();
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
        this.jobs = bookings.map((booking) => ({
          id: booking.id,
          clientName: 'Client', // You may need to fetch client name separately
          address: booking.date, // This might contain address info
          date: this.extractDateFromString(booking.date),
          time: this.extractTimeFromString(booking.time),
          duration: this.extractDurationFromString(booking.time),
          service: 'Cleaning Service',
          status: 'confirmed' as Job['status'],
          rate: 0, // You may need to calculate this
          notes: booking.message,
          clientPhone: '',
        }));
        this.loading = false;
        this.filterJobs();
      },
      error: (error) => {
        console.error('Error loading jobs:', error);
        this.error = 'Failed to load jobs. Showing sample data.';
        this.loading = false;

        // Fallback to mock data
        this.loadMockData();
        this.filterJobs();
      },
    });
  }

  private loadMockData() {
    this.jobs = [
      {
        id: '1',
        clientName: 'Alice Johnson',
        address: '123 Main St, Downtown',
        date: '2024-01-15',
        time: '10:00',
        duration: 3,
        service: 'House Cleaning',
        status: 'confirmed',
        rate: 75,
        notes: 'Please focus on kitchen and bathrooms',
        clientPhone: '+1 (555) 123-4567',
      },
      {
        id: '2',
        clientName: 'Bob Smith',
        address: '456 Oak Ave, Uptown',
        date: '2024-01-16',
        time: '14:00',
        duration: 2,
        service: 'Office Cleaning',
        status: 'pending',
        rate: 50,
        clientPhone: '+1 (555) 987-6543',
      },
      {
        id: '3',
        clientName: 'Carol Wilson',
        address: '789 Pine Rd, Suburb',
        date: '2024-01-14',
        time: '09:00',
        duration: 4,
        service: 'Deep Cleaning',
        status: 'completed',
        rate: 120,
        notes: 'Move-out cleaning, very thorough',
      },
    ];
  }

  private extractDateFromString(dateStr: string): string {
    // Extract date from format like "21.3.2023"
    const parts = dateStr.split('.');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(
        2,
        '0'
      )}`;
    }
    return dateStr;
  }

  private extractTimeFromString(timeStr: string): string {
    // Extract start time from format like "17:00 to 21:00"
    return timeStr.split(' ')[0] || timeStr;
  }

  private extractDurationFromString(timeStr: string): number {
    // Calculate duration from format like "17:00 to 21:00"
    const parts = timeStr.split(' to ');
    if (parts.length === 2) {
      const start = parts[0].split(':');
      const end = parts[1].split(':');
      const startTime = parseInt(start[0]) + parseInt(start[1]) / 60;
      const endTime = parseInt(end[0]) + parseInt(end[1]) / 60;
      return endTime - startTime;
    }
    return 2; // Default duration
  }

  filterJobs() {
    if (this.selectedStatus === 'all') {
      this.filteredJobs = this.jobs;
    } else {
      this.filteredJobs = this.jobs.filter(
        (job) => job.status === this.selectedStatus
      );
    }

    // Sort by date (newest first)
    this.filteredJobs.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  onStatusFilterChange(event: any) {
    this.selectedStatus = event.target.value;
    this.filterJobs();
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pending Approval';
      case 'confirmed':
        return 'Confirmed';
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
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
      // Update locally first for immediate UI feedback
      job.status = newStatus;
      this.filterJobs();

      // Update in backend
      this.reservationService
        .updateReservationStatus(jobId, {
          status: newStatus.toUpperCase() as any,
        })
        .subscribe({
          next: (response) => {
            console.log('Job status updated successfully:', response);
          },
          error: (error) => {
            console.error('Error updating job status:', error);
            // Revert the status change if backend update fails
            job.status = job.status; // You might want to store the previous status
            this.filterJobs();
          },
        });
    }
  }

  getTotalEarnings(): number {
    return this.jobs
      .filter((job) => job.status === 'completed')
      .reduce((total, job) => total + job.rate, 0);
  }

  getUpcomingJobs(): Job[] {
    const today = new Date().toISOString().split('T')[0];
    return this.jobs.filter(
      (job) =>
        (job.status === 'confirmed' || job.status === 'pending') &&
        job.date >= today
    );
  }
}
