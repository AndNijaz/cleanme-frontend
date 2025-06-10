import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  PREDEFINED_SERVICES,
  ServiceType,
} from '../../../../shared/constants/services.constant';

export interface CleanerService extends ServiceType {
  customDescription?: string;
}

export interface CleanerData {
  servicesOffered?: string;
  hourlyRate?: number;
  availability?: { [day: string]: { from: string; to: string } }[];
  bio?: string[];
}

@Component({
  selector: 'app-cleaner-services-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cleaner-services-card.component.html',
})
export class CleanerServicesCardComponent {
  @Input() cleanerData: CleanerData | null = null;

  constructor(private router: Router) {}

  get services(): CleanerService[] {
    if (!this.cleanerData?.servicesOffered) {
      return [];
    }

    const offeredServiceNames = this.cleanerData.servicesOffered
      .split(',')
      .map((s) => s.trim());

    const services: CleanerService[] = [];

    offeredServiceNames.forEach((serviceName) => {
      const predefinedService = PREDEFINED_SERVICES.find(
        (s) => s.name === serviceName
      );
      if (predefinedService) {
        // Try to find custom description from bio
        const customDescription = this.findCustomDescription(serviceName);
        services.push({
          ...predefinedService,
          customDescription,
        });
      }
    });

    return services;
  }

  get hourlyRate(): string {
    return this.cleanerData?.hourlyRate?.toString() || '0';
  }

  private findCustomDescription(serviceName: string): string | undefined {
    if (!this.cleanerData?.bio) return undefined;

    const bioEntry = this.cleanerData.bio.find((b) =>
      b.startsWith(`${serviceName}:`)
    );
    if (bioEntry) {
      return bioEntry.substring(serviceName.length + 1).trim();
    }
    return undefined;
  }

  getAvailableDays(): string {
    if (
      !this.cleanerData?.availability ||
      this.cleanerData.availability.length === 0
    ) {
      return 'Not set';
    }

    const days = this.cleanerData.availability
      .map((dayObj) => Object.keys(dayObj)[0])
      .filter((day) => day);

    if (days.length === 0) return 'Not set';
    if (days.length === 7) return 'Every day';
    if (days.length >= 5) return `${days.length} days/week`;

    return (
      days.slice(0, 3).join(', ') +
      (days.length > 3 ? ` +${days.length - 3}` : '')
    );
  }

  getWorkingHours(): string {
    if (
      !this.cleanerData?.availability ||
      this.cleanerData.availability.length === 0
    ) {
      return 'Not set';
    }

    // Get the first day's hours as a representative sample
    const firstDay = this.cleanerData.availability[0];
    const dayName = Object.keys(firstDay)[0];
    const timeRange = firstDay[dayName];

    if (timeRange && timeRange.from && timeRange.to) {
      return `${timeRange.from} - ${timeRange.to}`;
    }

    return 'Not set';
  }

  editServices(): void {
    // Navigate to cleaner profile edit or services management page
    this.router.navigate(['/cleaner/profile']);
  }
}
