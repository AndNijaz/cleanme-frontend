import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../../core/services/user.service';
import {
  PREDEFINED_SERVICES,
  ServiceType,
} from '../../../shared/constants/services.constant';

export interface ProfileData {
  services?: { icon: string; name: string; description: string }[];
  hourlyRate?: number;
}

@Component({
  selector: 'app-profile-services-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './profile-services-card.component.html',
})
export class ProfileServicesCardComponent {
  @Input() profile: User | null = null;
  @Input() profileData: ProfileData | null = null;

  getServices(): { icon: string; name: string; description: string }[] {
    if (this.profileData?.services) {
      return this.profileData.services.map((service) => ({
        icon: service.icon,
        name: service.name,
        description: service.description,
      }));
    }

    // Return predefined services as fallback
    return PREDEFINED_SERVICES.map((service) => ({
      icon: service.emoji,
      name: service.name,
      description: service.shortDescription,
    }));
  }

  getHourlyRate(): string {
    if (this.profileData?.hourlyRate) {
      return this.profileData.hourlyRate.toString();
    }
    return '25'; // Default hourly rate
  }
}
