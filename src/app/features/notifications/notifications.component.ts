import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { FormsModule } from '@angular/forms';

interface Notification {
  id: string;
  user: string;
  action: string;
  status: 'accepted' | 'declined' | 'complete';
  date: string;
  time: string;
  isNew: boolean;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatBadgeModule,
    FormsModule,
  ],
  template: `
    <div
      class=" max-md:p-4 p-12 flex flex-col items-center justify-center min-h-screen bg-[#CED9E7]"
    >
      <div
        class="flex flex-col lg:flex-row min-h-screen bg-gray-50 w-full rounded-2xl"
      >
        <!-- Sidebar (shown on desktop) -->
        <div
          class="hidden lg:block w-64 p-6 bg-white border-r border-gray-200 rounded-2xl"
        >
          <h2 class="text-xl font-semibold mb-4">Notifications</h2>

          <div class="relative mb-6">
            <mat-form-field appearance="outline" class="w-full">
              <mat-icon matPrefix>search</mat-icon>
              <input matInput placeholder="Search" [(ngModel)]="searchQuery" />
            </mat-form-field>
          </div>

          <div class="flex flex-col gap-2">
            <button
              mat-raised-button
              [color]="activeTab === 'new' ? 'primary' : ''"
              (click)="activeTab = 'new'"
              class="text-left"
            >
              New
            </button>
            <button
              mat-stroked-button
              [color]="activeTab === 'past' ? 'primary' : ''"
              (click)="activeTab = 'past'"
              class="text-left"
            >
              Past
            </button>
          </div>
        </div>

        <!-- Main Content -->
        <div class="flex-1 p-6">
          <!-- Mobile Header (shown only on mobile) -->
          <div class="lg:hidden mb-6 bg-white p-4 rounded-lg shadow-sm">
            <h1 class="text-xl font-semibold mb-4">Notifications</h1>

            <div class="relative mb-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-icon matPrefix>search</mat-icon>
                <input
                  matInput
                  placeholder="Search notifications"
                  [(ngModel)]="searchQuery"
                />
              </mat-form-field>
            </div>

            <div class="flex gap-2">
              <button
                mat-raised-button
                [color]="activeTab === 'new' ? 'primary' : ''"
                (click)="activeTab = 'new'"
                class="flex-1"
              >
                New
              </button>
              <button
                mat-stroked-button
                [color]="activeTab === 'past' ? 'primary' : ''"
                (click)="activeTab = 'past'"
                class="flex-1"
              >
                Past
              </button>
            </div>
          </div>

          <!-- Notifications List -->
          <mat-card class="bg-white">
            <div class="divide-y divide-gray-100">
              @if (filteredNotifications.length === 0) {
              <div class="p-8 text-center text-gray-500">
                No notifications found
              </div>
              } @else { @for (notification of filteredNotifications; track
              notification.id) {
              <div class="p-6 hover:bg-gray-50 transition-colors">
                <div class="flex items-start gap-4">
                  <!-- Avatar -->
                  <div
                    class="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center"
                  >
                    <span class="text-blue-600 font-medium">
                      {{ getInitials(notification.user) }}
                    </span>
                  </div>

                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <p class="text-sm text-gray-900">
                          <span class="font-medium">{{
                            notification.user
                          }}</span>
                          <span [ngClass]="getStatusColor(notification.status)">
                            {{
                              getStatusText(
                                notification.status,
                                notification.action
                              )
                            }}
                          </span>
                        </p>

                        <!-- Metadata -->
                        <div
                          class="flex items-center gap-4 mt-2 text-xs text-gray-500"
                        >
                          <div class="flex items-center gap-1">
                            <mat-icon class="!text-xs !w-3 !h-3"
                              >event</mat-icon
                            >
                            <span>{{ notification.date }}</span>
                          </div>
                          <div class="flex items-center gap-1">
                            <mat-icon class="!text-xs !w-3 !h-3"
                              >schedule</mat-icon
                            >
                            <span>{{ notification.time }}</span>
                          </div>
                        </div>

                        <!-- View Details Link -->
                        <button
                          class="flex items-center gap-1 mt-2 text-xs text-blue-600 hover:text-blue-800"
                        >
                          <mat-icon class="!text-xs !w-3 !h-3"
                            >visibility</mat-icon
                          >
                          <span>View details</span>
                        </button>
                      </div>

                      <!-- New Badge -->
                      @if (notification.isNew) {
                      <mat-icon
                        matBadge="New"
                        matBadgeSize="small"
                        class="text-blue-800 !text-xs"
                      >
                        fiber_new
                      </mat-icon>
                      }
                    </div>
                  </div>
                </div>
              </div>
              } }
            </div>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .mat-mdc-form-field {
        width: 100%;
      }
      .mat-mdc-button {
        text-transform: uppercase;
      }
    `,
  ],
})
export class NotificationsComponent {
  activeTab: 'new' | 'past' = 'new';
  searchQuery = '';

  notifications: Notification[] = [
    {
      id: '1',
      user: 'Sanela Brkic',
      action: 'your booking !',
      status: 'accepted',
      date: '7/03/2025',
      time: '12:54',
      isNew: true,
    },
    {
      id: '2',
      user: 'Sanela Brkic',
      action: 'your booking !',
      status: 'declined',
      date: '6/03/2025',
      time: '12:54',
      isNew: false,
    },
    {
      id: '3',
      user: 'Sanela',
      action: 'your experience !',
      status: 'complete',
      date: '2/03/2025',
      time: '12:54',
      isNew: false,
    },
  ];

  get filteredNotifications() {
    return this.notifications.filter((notification) => {
      const matchesTab =
        this.activeTab === 'new' ? notification.isNew : !notification.isNew;
      const matchesSearch =
        notification.user
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase()) ||
        notification.action
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'accepted':
        return 'text-green-600';
      case 'declined':
        return 'text-red-600';
      case 'complete':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  }

  getStatusText(status: string, action: string): string {
    if (status === 'complete') {
      return `Your cleaning with Sanela is complete. Rate ${action}`;
    }
    return `${status} ${action}`;
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  }
}
