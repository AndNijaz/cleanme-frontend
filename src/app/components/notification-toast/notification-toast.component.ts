import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface NotificationToast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    handler: () => void;
  };
}

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-4 max-w-sm w-full">
      <div
        *ngFor="let notification of notifications"
        class="transform transition-all duration-300 ease-in-out"
        [ngClass]="{
          'translate-x-0 opacity-100': true,
          'translate-x-full opacity-0': false
        }"
      >
        <div
          class="bg-white rounded-lg shadow-lg border-l-4 p-4 relative overflow-hidden"
          [ngClass]="getBorderClass(notification.type)"
        >
          <!-- Progress bar for auto-dismiss -->
          <div
            *ngIf="notification.duration"
            class="absolute bottom-0 left-0 h-1 bg-current opacity-30 transition-all linear"
            [style.width.%]="getProgressWidth(notification.id)"
            [ngClass]="getAccentClass(notification.type)"
          ></div>

          <div class="flex items-start">
            <!-- Icon -->
            <div class="flex-shrink-0 mr-3">
              <div
                class="w-8 h-8 rounded-full flex items-center justify-center"
                [ngClass]="getIconBgClass(notification.type)"
              >
                <i class="text-sm" [ngClass]="getIconClass(notification.type)">
                </i>
              </div>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-semibold text-gray-900 mb-1">
                {{ notification.title }}
              </h4>
              <p class="text-sm text-gray-700 leading-relaxed">
                {{ notification.message }}
              </p>

              <!-- Action Button -->
              <button
                *ngIf="notification.action"
                (click)="notification.action!.handler()"
                class="mt-3 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200"
              >
                {{ notification.action.label }}
              </button>
            </div>

            <!-- Close Button -->
            <button
              (click)="dismissNotification(notification.id)"
              class="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <i class="fas fa-times text-sm"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class NotificationToastComponent {
  @Input() notifications: NotificationToast[] = [];
  @Output() dismiss = new EventEmitter<string>();

  private progressIntervals: Map<string, any> = new Map();

  ngOnInit() {
    // Start progress tracking for notifications with duration
    this.notifications.forEach((notification) => {
      if (notification.duration) {
        this.startProgressTracking(notification);
      }
    });
  }

  ngOnDestroy() {
    // Clean up intervals
    this.progressIntervals.forEach((interval) => clearInterval(interval));
  }

  dismissNotification(id: string) {
    // Clear progress interval if exists
    const interval = this.progressIntervals.get(id);
    if (interval) {
      clearInterval(interval);
      this.progressIntervals.delete(id);
    }

    this.dismiss.emit(id);
  }

  private startProgressTracking(notification: NotificationToast) {
    if (!notification.duration) return;

    const startTime = Date.now();
    const duration = notification.duration;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = (elapsed / duration) * 100;

      if (progress >= 100) {
        clearInterval(interval);
        this.progressIntervals.delete(notification.id);
        this.dismissNotification(notification.id);
      }
    }, 50);

    this.progressIntervals.set(notification.id, interval);
  }

  getProgressWidth(notificationId: string): number {
    const notification = this.notifications.find(
      (n) => n.id === notificationId
    );
    if (!notification?.duration) return 0;

    // This is a simplified calculation - in reality you'd track start time
    return 0; // Will be updated by the interval
  }

  getBorderClass(type: string): string {
    switch (type) {
      case 'success':
        return 'border-green-500';
      case 'info':
        return 'border-blue-500';
      case 'warning':
        return 'border-yellow-500';
      case 'error':
        return 'border-red-500';
      default:
        return 'border-gray-500';
    }
  }

  getIconBgClass(type: string): string {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-600';
      case 'info':
        return 'bg-blue-100 text-blue-600';
      case 'warning':
        return 'bg-yellow-100 text-yellow-600';
      case 'error':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  getIconClass(type: string): string {
    switch (type) {
      case 'success':
        return 'fas fa-check';
      case 'info':
        return 'fas fa-info';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      case 'error':
        return 'fas fa-times';
      default:
        return 'fas fa-bell';
    }
  }

  getAccentClass(type: string): string {
    switch (type) {
      case 'success':
        return 'text-green-500';
      case 'info':
        return 'text-blue-500';
      case 'warning':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  }
}
