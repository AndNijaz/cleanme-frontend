import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../../core/services/user.service';

@Component({
  selector: 'app-profile-services-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './profile-services-card.component.html',
})
export class ProfileServicesCardComponent {
  @Input() profile: User | null = null;

  getServices() {
    // Mock services for now - in a real implementation, this should:
    // 1. Check if the current user is a cleaner (userType === 'CLEANER')
    // 2. Fetch cleaner-specific data using CleanerService.getCleanerDetails()
    // 3. Return actual services from the cleaner's profile
    return [
      {
        icon: '🧹',
        name: 'Standard Cleaning',
        description: 'Basic cleaning service including dusting and vacuuming',
      },
      {
        icon: '🪟',
        name: 'Window Cleaning',
        description: 'Professional window cleaning for crystal clear views',
      },
      {
        icon: '🧽',
        name: 'Deep Cleaning',
        description: 'Thorough deep cleaning for kitchens and bathrooms',
      },
      {
        icon: '🏠',
        name: 'Move-in/Move-out',
        description: 'Complete cleaning for property transitions',
      },
    ];
  }

  getHourlyRate(): string {
    // TODO: In a real implementation, this should fetch the actual hourly rate
    // from the cleaner's details if the current user is a cleaner
    // For now, return a static value
    return '12';
  }
}
