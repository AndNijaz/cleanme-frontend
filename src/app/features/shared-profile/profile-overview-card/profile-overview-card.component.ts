import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { User } from '../../../core/services/user.service';

@Component({
  selector: 'app-profile-overview-card',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './profile-overview-card.component.html',
})
export class ProfileOverviewCardComponent {
  @Input() profile: User | null = null;

  constructor() {}

  getAccountType(): string {
    // This would come from user data in a real app
    return 'Premium User';
  }

  getMemberSince(): string {
    // This would come from user creation date
    return 'March 2024';
  }

  getProfileCompletion(): number {
    if (!this.profile) return 0;

    let completed = 0;
    const total = 6;

    if (this.profile.firstName?.trim()) completed++;
    if (this.profile.lastName?.trim()) completed++;
    if (this.profile.email?.trim()) completed++;
    if (this.profile.phone?.trim()) completed++;
    if (
      this.profile.country?.trim() &&
      this.profile.city?.trim() &&
      this.profile.street?.trim()
    )
      completed++;

    return Math.round((completed / total) * 100);
  }

  getAccountStatus(): string {
    const completion = this.getProfileCompletion();
    if (completion >= 80) return 'Active';
    if (completion >= 50) return 'Incomplete';
    return 'Pending';
  }

  getStatusClasses(): string {
    const status = this.getAccountStatus();
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Incomplete':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pending':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
