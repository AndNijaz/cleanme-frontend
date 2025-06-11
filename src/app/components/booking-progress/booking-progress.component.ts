import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import {
  BookingService,
  BookingProgress,
  StatusHistoryItem,
} from '../../core/services/booking.service';

@Component({
  selector: 'app-booking-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg"
      *ngIf="booking"
    >
      <!-- Header -->
      <div
        class="flex flex-col md:flex-row md:justify-between md:items-start mb-8 pb-6 border-b border-gray-200"
      >
        <div class="flex-1 mb-4 md:mb-0">
          <h2 class="text-3xl font-bold text-gray-900 mb-2">
            {{ getStatusText(booking.status) }}
          </h2>
          <p class="text-lg text-gray-600">
            {{ booking.cleanerName }} • {{ formatDate(booking.date) }}
          </p>
        </div>
        <div
          class="flex items-center gap-3 px-6 py-3 rounded-full font-semibold text-sm uppercase tracking-wide"
          [ngClass]="getStatusBadgeClass(booking.status)"
        >
          <i [ngClass]="getStatusIcon(booking.status)"></i>
          {{ booking.status | titlecase }}
        </div>
      </div>

      <!-- Progress Stepper -->
      <div class="mb-10 relative">
        <!-- Progress Line -->
        <div class="absolute top-6 left-6 right-6 h-0.5 bg-gray-200 z-0"></div>

        <div class="space-y-8 relative z-10">
          <div
            *ngFor="let step of progressSteps; let i = index"
            class="flex items-start"
          >
            <!-- Step Indicator -->
            <div
              class="flex-shrink-0 w-12 h-12 rounded-full border-3 flex items-center justify-center mr-5 transition-all duration-300"
              [ngClass]="{
                'bg-gradient-to-br from-green-400 to-green-600 border-green-500 text-white':
                  isStepCompleted(step.status),
                'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-500 text-white animate-pulse':
                  isStepActive(step.status),
                'bg-gray-100 border-gray-300 text-gray-400':
                  !isStepCompleted(step.status) && !isStepActive(step.status)
              }"
            >
              <i
                [ngClass]="
                  getStepIcon(step.status, isStepCompleted(step.status))
                "
                class="text-lg"
              ></i>
            </div>

            <!-- Step Content -->
            <div class="flex-1 pt-1">
              <h4
                class="text-lg font-semibold mb-1"
                [ngClass]="{
                  'text-green-600': isStepCompleted(step.status),
                  'text-blue-600': isStepActive(step.status),
                  'text-gray-900':
                    !isStepCompleted(step.status) && !isStepActive(step.status)
                }"
              >
                {{ step.title }}
              </h4>
              <p class="text-gray-600 text-sm mb-2">{{ step.description }}</p>
              <span
                class="text-xs text-gray-500 font-medium"
                *ngIf="getStepTime(step.status)"
              >
                {{ getStepTime(step.status) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Current Status Details -->
      <div
        class="p-6 rounded-xl border-l-4 mb-8"
        [ngClass]="getCurrentStatusClass()"
      >
        <h3 class="text-xl font-semibold text-gray-900 mb-2">
          {{ getCurrentStatusTitle() }}
        </h3>
        <p class="text-gray-700 mb-4 leading-relaxed">
          {{ getCurrentStatusDescription() }}
        </p>

        <!-- Status-specific content -->
        <div class="mt-4">
          <!-- Pending Status -->
          <div
            *ngIf="booking.status === 'PENDING'"
            class="flex items-center gap-3 text-amber-700"
          >
            <div class="w-3 h-3 bg-amber-500 rounded-full animate-ping"></div>
            <span class="font-medium">Waiting for cleaner confirmation...</span>
          </div>

          <!-- Confirmed Status -->
          <div
            *ngIf="booking.status === 'CONFIRMED'"
            class="flex items-center gap-3 text-green-700"
          >
            <i class="fas fa-clock text-lg"></i>
            <span class="font-medium">Starting {{ getTimeUntilStart() }}</span>
          </div>

          <!-- Ongoing Status -->
          <div *ngIf="booking.status === 'ONGOING'" class="space-y-4">
            <!-- Progress Bar -->
            <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                [style.width.%]="getCompletionPercentage()"
              ></div>
            </div>
            <!-- Time Info -->
            <div class="flex justify-between text-sm">
              <span class="text-blue-600 font-medium"
                >{{ getElapsedTime() }} elapsed</span
              >
              <span class="text-green-600 font-medium"
                >{{ getEstimatedRemaining() }} remaining</span
              >
            </div>
          </div>

          <!-- Finished Status -->
          <div
            *ngIf="booking.status === 'FINISHED'"
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div class="flex items-center gap-3 text-green-700">
              <i class="fas fa-check-circle text-xl"></i>
              <span class="font-medium"
                >Completed in {{ getTotalDuration() }}</span
              >
            </div>
            <button
              (click)="openRatingModal()"
              class="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-200 hover:transform hover:-translate-y-1 hover:shadow-lg"
            >
              <i class="fas fa-star"></i>
              Rate Your Experience
            </button>
          </div>
        </div>
      </div>

      <!-- Activity Timeline -->
      <div class="mb-8">
        <h3 class="text-xl font-semibold text-gray-900 mb-6">
          Activity Timeline
        </h3>
        <div class="relative pl-8">
          <!-- Timeline line -->
          <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

          <div *ngFor="let item of booking.statusHistory" class="relative mb-6">
            <!-- Timeline marker -->
            <div
              class="absolute -left-6 top-1 w-8 h-8 rounded-full bg-white border-3 flex items-center justify-center text-sm"
              [ngClass]="getTimelineMarkerClass(item.status)"
            >
              <i [ngClass]="getStatusIcon(item.status)"></i>
            </div>

            <!-- Timeline content -->
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div
                class="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2"
              >
                <h4 class="font-semibold text-gray-900">
                  {{ item.description }}
                </h4>
                <span class="text-xs text-gray-500 font-medium mt-1 sm:mt-0">{{
                  formatTime(item.timestamp)
                }}</span>
              </div>
              <p *ngIf="item.duration" class="text-sm text-gray-600">
                Duration: {{ item.duration }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Section -->
      <div
        *ngIf="booking.status === 'CONFIRMED' || booking.status === 'ONGOING'"
        class="text-center p-6 bg-gray-50 rounded-xl border border-gray-200"
      >
        <button
          (click)="contactCleaner()"
          class="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-8 py-4 rounded-xl inline-flex items-center gap-3 transition-all duration-200 hover:transform hover:-translate-y-1 hover:shadow-xl"
        >
          <i class="fas fa-phone text-lg"></i>
          Contact {{ booking.cleanerName }}
        </button>
      </div>

      <!-- Real-time Updates Indicator -->
      <div class="mt-6 text-center">
        <div class="inline-flex items-center gap-2 text-sm text-gray-500">
          <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live updates every 15 seconds</span>
        </div>
      </div>
    </div>
  `,
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
