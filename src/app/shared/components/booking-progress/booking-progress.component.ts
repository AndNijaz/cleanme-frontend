import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import {
  BookingService,
  BookingProgress,
  StatusHistoryItem,
} from '../../../core/services/booking.service';

@Component({
  selector: 'app-booking-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-progress.component.html',
})
export class BookingProgressComponent implements OnInit, OnDestroy {
  @Input() bookingId!: string;

  booking?: BookingProgress;
  private refreshSubscription?: Subscription;

  progressSteps = [
    {
      status: 'PENDING',
      title: 'Booking Requested',
      description: 'Waiting for cleaner confirmation',
    },
    {
      status: 'CONFIRMED',
      title: 'Confirmed',
      description: 'Cleaner accepted your booking',
    },
    {
      status: 'ONGOING',
      title: 'In Progress',
      description: 'Cleaning service is underway',
    },
    {
      status: 'FINISHED',
      title: 'Completed',
      description: 'Service completed successfully',
    },
  ];

  constructor(private bookingService: BookingService) {}

  ngOnInit() {
    this.loadBookingProgress();
    // Refresh every 15 seconds for faster status updates from cleaners
    this.refreshSubscription = interval(15000).subscribe(() => {
      this.loadBookingProgress();
    });
  }

  ngOnDestroy() {
    this.refreshSubscription?.unsubscribe();
  }

  private loadBookingProgress() {
    this.bookingService.getBookingProgress(this.bookingId).subscribe({
      next: (progress) => {
        this.booking = progress;
      },
      error: (error) => {
        console.error('Error loading booking progress:', error);
      },
    });
  }

  isStepCompleted(stepStatus: string): boolean {
    if (!this.booking) return false;
    const statusOrder = ['PENDING', 'CONFIRMED', 'ONGOING', 'FINISHED'];
    const currentIndex = statusOrder.indexOf(this.booking.status);
    const stepIndex = statusOrder.indexOf(stepStatus);
    return stepIndex < currentIndex;
  }

  isStepActive(stepStatus: string): boolean {
    return this.booking?.status === stepStatus;
  }

  getStepIcon(stepStatus: string, isCompleted: boolean): string {
    if (isCompleted) return 'fas fa-check';

    switch (stepStatus) {
      case 'PENDING':
        return 'fas fa-clock';
      case 'CONFIRMED':
        return 'fas fa-handshake';
      case 'ONGOING':
        return 'fas fa-spray-can';
      case 'FINISHED':
        return 'fas fa-check-circle';
      default:
        return 'fas fa-circle';
    }
  }

  getStepTime(stepStatus: string): string | null {
    const historyItem = this.booking?.statusHistory.find(
      (item) => item.status === stepStatus
    );
    return historyItem ? this.formatTime(historyItem.timestamp) : null;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'bg-gradient-to-r from-yellow-200 to-yellow-300 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-gradient-to-r from-green-200 to-green-300 text-green-800';
      case 'ONGOING':
        return 'bg-gradient-to-r from-blue-200 to-blue-300 text-blue-800';
      case 'FINISHED':
        return 'bg-gradient-to-r from-green-300 to-green-400 text-green-900';
      case 'CANCELLED':
        return 'bg-gradient-to-r from-red-200 to-red-300 text-red-800';
      default:
        return 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'fas fa-clock';
      case 'CONFIRMED':
        return 'fas fa-check';
      case 'ONGOING':
        return 'fas fa-play';
      case 'FINISHED':
        return 'fas fa-check-circle';
      case 'CANCELLED':
        return 'fas fa-times';
      default:
        return 'fas fa-circle';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'Booking Pending';
      case 'CONFIRMED':
        return 'Booking Confirmed';
      case 'ONGOING':
        return 'Cleaning in Progress';
      case 'FINISHED':
        return 'Service Completed';
      case 'CANCELLED':
        return 'Booking Cancelled';
      default:
        return 'Unknown Status';
    }
  }

  getCurrentStatusTitle(): string {
    switch (this.booking?.status) {
      case 'PENDING':
        return 'Awaiting Confirmation';
      case 'CONFIRMED':
        return 'Ready to Start';
      case 'ONGOING':
        return 'Work in Progress';
      case 'FINISHED':
        return 'All Done!';
      default:
        return 'Status Update';
    }
  }

  getCurrentStatusDescription(): string {
    switch (this.booking?.status) {
      case 'PENDING':
        return "Your cleaner will confirm the booking shortly. You'll be notified once it's accepted.";
      case 'CONFIRMED':
        return 'Great! Your cleaner has confirmed the appointment and will arrive as scheduled.';
      case 'ONGOING':
        return 'Your cleaner is currently working on your space. Sit back and relax!';
      case 'FINISHED':
        return "Your cleaning service has been completed. We hope you're satisfied with the results!";
      default:
        return "We'll keep you updated on any changes.";
    }
  }

  getCurrentStatusClass(): string {
    switch (this.booking?.status) {
      case 'PENDING':
        return 'bg-yellow-50 border-yellow-400';
      case 'CONFIRMED':
        return 'bg-green-50 border-green-400';
      case 'ONGOING':
        return 'bg-blue-50 border-blue-400';
      case 'FINISHED':
        return 'bg-green-100 border-green-500';
      default:
        return 'bg-gray-50 border-gray-400';
    }
  }

  getTimelineMarkerClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'border-yellow-400 text-yellow-600';
      case 'CONFIRMED':
        return 'border-green-400 text-green-600';
      case 'ONGOING':
        return 'border-blue-400 text-blue-600';
      case 'FINISHED':
        return 'border-green-500 text-green-700';
      default:
        return 'border-gray-300 text-gray-500';
    }
  }

  getTimeUntilStart(): string {
    if (!this.booking) return '';
    const startDateTime = new Date(`${this.booking.date}T${this.booking.time}`);
    const now = new Date();
    const diff = startDateTime.getTime() - now.getTime();

    if (diff < 0) return 'soon';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `in ${days} day${days !== 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `in ${hours}h ${minutes}m`;
    } else {
      return `in ${minutes}m`;
    }
  }

  getCompletionPercentage(): number {
    if (!this.booking || !this.booking.startTime) return 0;

    const now = new Date();
    const startTime = new Date(this.booking.startTime);
    const expectedDuration = this.booking.duration * 60 * 60 * 1000;
    const elapsed = now.getTime() - startTime.getTime();

    return Math.min(100, Math.max(0, (elapsed / expectedDuration) * 100));
  }

  getElapsedTime(): string {
    if (!this.booking?.startTime) return '0m';

    const now = new Date();
    const startTime = new Date(this.booking.startTime);
    const elapsed = now.getTime() - startTime.getTime();

    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));

    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }

  getEstimatedRemaining(): string {
    if (!this.booking?.startTime) return `${this.booking?.duration || 0}h`;

    const now = new Date();
    const startTime = new Date(this.booking.startTime);
    const expectedDuration = this.booking.duration * 60 * 60 * 1000;
    const elapsed = now.getTime() - startTime.getTime();
    const remaining = Math.max(0, expectedDuration - elapsed);

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    if (remaining <= 0) return 'finishing up';
    return hours > 0 ? `~${hours}h ${minutes}m` : `~${minutes}m`;
  }

  getTotalDuration(): string {
    const finishedItem = this.booking?.statusHistory.find(
      (item) => item.status === 'FINISHED'
    );
    return finishedItem?.duration || `${this.booking?.duration || 0} hours`;
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

  formatTime(timestamp: Date): string {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  contactCleaner() {
    alert(`Contacting ${this.booking?.cleanerName}...`);
  }

  openRatingModal() {
    alert('Opening rating modal...');
  }
}
