import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { FormsModule } from '@angular/forms';
import { formatDate } from '@angular/common';
import { Router } from '@angular/router';
import {
  NotificationService,
  NotificationDto,
} from '../../core/services/notification-service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    FormsModule,
  ],
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300"
    >
      <main class="max-w-7xl mx-auto px-4 py-8 min-h-[calc(100vh-80px)]">
        <h2 class="text-3xl tracking-wider font-semibold text-[#083F87] mb-4">
          Notifications
        </h2>

        <section
          class="flex bg-white backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 min-h-[600px] overflow-hidden"
        >
          <!-- Sidebar -->
          <aside
            class="w-60 bg-white border-r border-gray-200 py-10 flex flex-col justify-between"
          >
            <div class="px-6">
              <mat-form-field appearance="outline" class="w-full mb-6">
                <mat-icon matPrefix>search</mat-icon>
                <input
                  matInput
                  placeholder="Search Notifications"
                  [(ngModel)]="searchQuery"
                />
              </mat-form-field>

              <div class="flex flex-col gap-2">
                <button
                  mat-raised-button
                  [color]="activeTab === 'new' ? 'primary' : undefined"
                  (click)="activeTab = 'new'"
                  class="rounded-xl py-2"
                >
                  New
                </button>
                <button
                  mat-stroked-button
                  [color]="activeTab === 'past' ? 'primary' : undefined"
                  (click)="activeTab = 'past'"
                  class="rounded-xl py-2"
                >
                  Past
                </button>
              </div>
            </div>

            <div class="px-6 mt-auto text-sm">
              <button class="text-blue-600 hover:underline w-full text-left">
                Log Out
              </button>
            </div>
          </aside>

          <!-- Notification Content -->
          <div class="flex-1 px-8 py-10 overflow-y-auto">
            <div
              *ngIf="filteredNotifications.length === 0"
              class="text-center text-gray-500 py-12"
            >
              No notifications found
            </div>

            <div class="space-y-4">
              <div
                *ngFor="
                  let notification of filteredNotifications;
                  trackBy: trackById
                "
                class="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex gap-4 items-start"
              >
                <div
                  class="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold"
                >
                  {{ getInitialsFromMessage(notification.message) }}
                </div>

                <div class="flex-1">
                  <div class="text-sm font-medium text-gray-800 mb-1">
                    {{ notification.message }}
                  </div>

                  <div class="flex gap-4 text-xs text-gray-500 items-center">
                    <div class="flex items-center gap-1">
                      <mat-icon class="!text-xs !w-4 !h-4">event</mat-icon>
                      <span>{{
                        getFormattedDate(notification.createdAt)
                      }}</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <mat-icon class="!text-xs !w-4 !h-4">schedule</mat-icon>
                      <span>{{
                        getFormattedTime(notification.createdAt)
                      }}</span>
                    </div>
                  </div>

                  <button
                    class="mt-2 text-xs text-blue-600 hover:underline flex items-center gap-1"
                    (click)="handleViewDetails(notification)"
                  >
                    <mat-icon class="!text-xs">visibility</mat-icon>
                    <span>Pogledaj detalje</span>
                  </button>
                </div>

                <div *ngIf="!notification.read">
                  <mat-icon
                    matBadge="New"
                    matBadgeSize="small"
                    class="text-blue-800"
                  >
                    fiber_new
                  </mat-icon>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  `,
})
export class NotificationsComponent implements OnInit {
  activeTab: 'new' | 'past' = 'new';
  searchQuery = '';
  notifications: NotificationDto[] = [];

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('userId') || '';
    if (!userId) return;

    this.notificationService.getNotifications(userId).subscribe((data) => {
      this.notifications = data;
    });
  }

  get filteredNotifications(): NotificationDto[] {
    return this.notifications.filter((notification) => {
      const isUnread = !notification.read;
      const matchesTab = this.activeTab === 'new' ? isUnread : !isUnread;
      const matchesSearch = notification.message
        .toLowerCase()
        .includes(this.searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }

  handleViewDetails(notification: NotificationDto): void {
    const userType = localStorage.getItem('userType');
    console.log(userType);
    const redirectTo =
      userType === 'CLIENT'
        ? '/user/reservations'
        : userType === 'CLEANER'
        ? '/cleaner/jobs'
        : '/';

    if (!notification.read) {
      this.notificationService.markAsRead(notification.id).subscribe(() => {
        notification.read = true;
        this.router.navigate([redirectTo]);
      });
    } else {
      this.router.navigate([redirectTo]);
    }
  }

  getFormattedDate(dateStr: string): string {
    return formatDate(dateStr, 'dd.MM.yyyy', 'en-US');
  }

  getFormattedTime(dateStr: string): string {
    return formatDate(dateStr, 'HH:mm', 'en-US');
  }

  getInitialsFromMessage(message: string): string {
    const words = message.split(' ');
    return words
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('');
  }

  trackById(index: number, item: NotificationDto): string {
    return item.id;
  }
}
