import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BookingService, Booking } from '../../services/booking.service';
import { BookingProgressComponent } from '../booking-progress/booking-progress.component';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, BookingProgressComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <div class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">My Bookings</h1>
              <p class="text-gray-600">
                Track your cleaning appointments and service progress
              </p>
            </div>
            <button
              routerLink="/book-cleaner"
              class="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 hover:transform hover:-translate-y-1 hover:shadow-lg"
            >
              <i class="fas fa-plus mr-2"></i>
              Book New Service
            </button>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Quick Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div class="flex items-center">
              <div class="p-3 bg-yellow-100 rounded-lg">
                <i class="fas fa-clock text-yellow-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Pending</p>
                <p class="text-2xl font-bold text-gray-900">
                  {{ getBookingCount('PENDING') }}
                </p>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div class="flex items-center">
              <div class="p-3 bg-green-100 rounded-lg">
                <i class="fas fa-check text-green-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Confirmed</p>
                <p class="text-2xl font-bold text-gray-900">
                  {{ getBookingCount('CONFIRMED') }}
                </p>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div class="flex items-center">
              <div class="p-3 bg-blue-100 rounded-lg">
                <i class="fas fa-play text-blue-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">In Progress</p>
                <p class="text-2xl font-bold text-gray-900">
                  {{ getBookingCount('ONGOING') }}
                </p>
              </div>
            </div>
          </div>

          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div class="flex items-center">
              <div class="p-3 bg-purple-100 rounded-lg">
                <i class="fas fa-check-circle text-purple-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Completed</p>
                <p class="text-2xl font-bold text-gray-900">
                  {{ getBookingCount('FINISHED') }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Active/Upcoming Bookings -->
        <div class="mb-8" *ngIf="getActiveBookings().length > 0">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">
            Active & Upcoming Services
          </h2>
          <div class="space-y-6">
            <div
              *ngFor="let booking of getActiveBookings()"
              class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <!-- Booking Header -->
              <div
                class="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white"
              >
                <div
                  class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4"
                >
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <h3 class="text-xl font-semibold text-gray-900">
                        {{ booking.cleanerName }}
                      </h3>
                      <span
                        class="px-3 py-1 rounded-full text-sm font-medium"
                        [ngClass]="getStatusBadgeClass(booking.status)"
                      >
                        {{ booking.status | titlecase }}
                      </span>
                    </div>
                    <div class="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div class="flex items-center gap-1">
                        <i class="fas fa-calendar"></i>
                        <span>{{ formatDate(booking.date) }}</span>
                      </div>
                      <div class="flex items-center gap-1">
                        <i class="fas fa-clock"></i>
                        <span>{{ booking.time }}</span>
                      </div>
                      <div class="flex items-center gap-1">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>{{ booking.location }}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    (click)="toggleProgress(booking.rid)"
                    class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
                  >
                    <i class="fas fa-chart-line"></i>
                    {{ expandedBooking === booking.rid ? 'Hide' : 'Track' }}
                    Progress
                  </button>
                </div>
              </div>

              <!-- Progress Detail (Expandable) -->
              <div
                *ngIf="expandedBooking === booking.rid"
                class="p-6 bg-gray-50"
              >
                <app-booking-progress
                  [bookingId]="booking.rid"
                ></app-booking-progress>
              </div>

              <!-- Quick Actions -->
              <div class="p-4 bg-white border-t border-gray-200">
                <div class="flex flex-wrap gap-2">
                  <button
                    *ngIf="
                      booking.status === 'CONFIRMED' ||
                      booking.status === 'ONGOING'
                    "
                    (click)="contactCleaner(booking)"
                    class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200"
                  >
                    <i class="fas fa-phone mr-1"></i>
                    Contact Cleaner
                  </button>
                  <button
                    *ngIf="booking.status === 'PENDING'"
                    (click)="cancelBooking(booking)"
                    class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200"
                  >
                    <i class="fas fa-times mr-1"></i>
                    Cancel
                  </button>
                  <button
                    *ngIf="booking.status === 'FINISHED'"
                    (click)="leaveReview(booking)"
                    class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200"
                  >
                    <i class="fas fa-star mr-1"></i>
                    Leave Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- All Bookings History -->
        <div>
          <div
            class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6"
          >
            <h2 class="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
              Booking History
            </h2>
            <div class="flex gap-2">
              <select
                [(ngModel)]="selectedFilter"
                (ngModelChange)="applyFilter()"
                class="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="ONGOING">In Progress</option>
                <option value="FINISHED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <div
            class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th
                      class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Service
                    </th>
                    <th
                      class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date & Time
                    </th>
                    <th
                      class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Location
                    </th>
                    <th
                      class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr
                    *ngFor="let booking of filteredBookings"
                    class="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td class="px-6 py-4">
                      <div class="flex items-center">
                        <div
                          class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4"
                        >
                          <i class="fas fa-broom text-blue-600"></i>
                        </div>
                        <div>
                          <div class="text-sm font-medium text-gray-900">
                            {{ booking.cleanerName }}
                          </div>
                          <div class="text-sm text-gray-500">
                            House Cleaning
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="text-sm text-gray-900">
                        {{ formatDate(booking.date) }}
                      </div>
                      <div class="text-sm text-gray-500">
                        {{ booking.time }}
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="text-sm text-gray-900">
                        {{ booking.location }}
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <span
                        class="px-2 py-1 rounded-full text-xs font-medium"
                        [ngClass]="getStatusBadgeClass(booking.status)"
                      >
                        {{ booking.status | titlecase }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <button
                        (click)="toggleProgress(booking.rid)"
                        class="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="bookings.length === 0" class="text-center py-12">
          <div class="max-w-md mx-auto">
            <div
              class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <i class="fas fa-calendar-alt text-gray-400 text-3xl"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              No bookings yet
            </h3>
            <p class="text-gray-600 mb-6">
              Start by booking your first cleaning service!
            </p>
            <button
              routerLink="/book-cleaner"
              class="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200"
            >
              Book Your First Service
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ClientDashboardComponent implements OnInit {
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  selectedFilter = 'all';
  expandedBooking: string | null = null;

  constructor(private bookingService: BookingService) {}

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.bookingService.getBookings().subscribe({
      next: (bookings) => {
        this.bookings = bookings;
        this.applyFilter();
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
      },
    });
  }

  getBookingCount(status: string): number {
    return this.bookings.filter((booking) => booking.status === status).length;
  }

  getActiveBookings(): Booking[] {
    return this.bookings
      .filter((booking) =>
        ['PENDING', 'CONFIRMED', 'ONGOING'].includes(booking.status)
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  applyFilter() {
    if (this.selectedFilter === 'all') {
      this.filteredBookings = [...this.bookings];
    } else {
      this.filteredBookings = this.bookings.filter(
        (booking) => booking.status === this.selectedFilter
      );
    }
  }

  toggleProgress(bookingId: string) {
    this.expandedBooking =
      this.expandedBooking === bookingId ? null : bookingId;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'ONGOING':
        return 'bg-blue-100 text-blue-800';
      case 'FINISHED':
        return 'bg-purple-100 text-purple-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  contactCleaner(booking: Booking) {
    if (booking.clientPhone) {
      alert(`Calling ${booking.cleanerName} at ${booking.clientPhone}`);
    } else {
      alert(`Contacting ${booking.cleanerName}...`);
    }
  }

  cancelBooking(booking: Booking) {
    if (
      confirm(
        `Are you sure you want to cancel your booking with ${booking.cleanerName}?`
      )
    ) {
      // Implement cancellation logic here
      alert('Booking cancelled successfully');
    }
  }

  leaveReview(booking: Booking) {
    alert(`Opening review form for ${booking.cleanerName}...`);
  }
}
