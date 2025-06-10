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

  getServices(): { icon: string; name: string; description: string }[] {
    // Return empty array - services should come from the actual profile data
    // If this component is still needed, the parent component should pass services via @Input
    return [];
  }

  getHourlyRate(): string {
    // Return empty string - hourly rate should come from the actual profile data
    return '';
  }
}
