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
  templateUrl: './notifications.component.html',
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
