import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CleanerService } from '../../../core/services/cleaner-service.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  PREDEFINED_SERVICES,
  ServiceType,
} from '../../../shared/constants/services.constant';

interface ServiceDescription {
  serviceName: string;
  customDescription: string;
}

@Component({
  selector: 'app-cleaner-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cleaner-services.component.html',
  styles: [
    `
      @keyframes slide-in {
        0% {
          transform: translateX(100%);
          opacity: 0;
        }
        100% {
          transform: translateX(0);
          opacity: 1;
        }
      }

      .animate-slide-in {
        animation: slide-in 0.3s ease-out;
      }
    `,
  ],
})
export class CleanerServicesComponent implements OnInit {
  predefinedServices = PREDEFINED_SERVICES;
  selectedServices: string[] = [];
  availableServices: ServiceType[] = []; // Services not yet selected
  serviceDescriptions: ServiceDescription[] = [];
  hourlyRate: number = 25;

  initialLoading = true;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  showAddServices = false; // Controls showing available services section

  private cleanerId: string = '';

  constructor(
    private cleanerService: CleanerService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.initializeData();
  }

  private initializeData() {
    const authData = this.authService.getAuthData();
    if (!authData?.userId) {
      this.errorMessage = 'Authentication required. Please log in again.';
      this.initialLoading = false;
      return;
    }

    this.cleanerId = authData.userId;

    // Initialize available services immediately
    this.updateAvailableServices();

    this.loadCurrentServices();
  }

  private loadCurrentServices() {
    this.cleanerService.getCleanerPublicProfile(this.cleanerId).subscribe({
      next: (profile) => {
        // Parse services offered from servicesOffered string
        if (profile.services && profile.services.length > 0) {
          this.selectedServices = profile.services.map((s) => s.name);
          // Show toast when services are loaded
          this.showToast(
            `${this.selectedServices.length} services loaded from your profile`,
            'info'
          );

          // Parse custom descriptions from bio if available
          if (profile.bio) {
            this.parseServiceDescriptions(profile.bio);
          }
        }

        // Set hourly rate
        this.hourlyRate = profile.hourlyRate || 25;

        // Update available services (services not yet selected)
        this.updateAvailableServices();

        this.initialLoading = false;
      },
      error: (error) => {
        console.error('❌ Error loading cleaner services:', error);
        // If 403/404, it means no cleaner profile exists yet - this is normal for new users
        if (error.status === 403 || error.status === 404) {
          // This is expected for users who haven't completed setup yet
          this.selectedServices = [];
          this.updateAvailableServices();
          // Clear any error message since this is expected
          this.errorMessage = '';
        } else {
          this.showToast(
            'Failed to load your current services. You can still set them up.',
            'error'
          );
        }
        this.initialLoading = false;
      },
    });
  }

  private parseServiceDescriptions(bio: string | string[] | null | undefined) {
    // Handle different bio formats - it might be string, array, or null
    let bioString = '';

    if (Array.isArray(bio)) {
      bioString = bio.join(', ');
    } else if (typeof bio === 'string') {
      bioString = bio;
    } else {
      // bio is null, undefined, or other type
      this.serviceDescriptions = [];
      return;
    }

    // Bio format: "Service Name: Description, Another Service: Description"
    // This matches the format used in cleaner-info component
    const bioEntries = bioString.split(',').map((entry) => entry.trim());

    this.serviceDescriptions = bioEntries
      .filter((entry) => entry.includes(':'))
      .map((entry) => {
        const [serviceName, ...descParts] = entry.split(':');
        return {
          serviceName: serviceName.trim(),
          customDescription: descParts.join(':').trim(),
        };
      });
  }

  toggleService(serviceName: string) {
    const index = this.selectedServices.indexOf(serviceName);
    if (index > -1) {
      // Remove service
      this.selectedServices.splice(index, 1);
      // Remove its description
      this.serviceDescriptions = this.serviceDescriptions.filter(
        (desc) => desc.serviceName !== serviceName
      );
      // Show toast notification
      this.showToast(`${serviceName} removed from your services`, 'info');
    } else {
      // Add service
      this.selectedServices.push(serviceName);
      // Add empty description entry
      if (
        !this.serviceDescriptions.find(
          (desc) => desc.serviceName === serviceName
        )
      ) {
        this.serviceDescriptions.push({
          serviceName,
          customDescription: '',
        });
      }
      // Show toast notification
      this.showToast(`${serviceName} added to your services`, 'success');
    }
    this.updateAvailableServices();
    this.clearMessages();
  }

  private updateAvailableServices() {
    this.availableServices = this.predefinedServices.filter(
      (service) => !this.selectedServices.includes(service.name)
    );
  }

  toggleAddServicesSection() {
    this.showAddServices = !this.showAddServices;
  }

  addService(serviceName: string) {
    this.toggleService(serviceName);
    this.showAddServices = false; // Close the add section after adding
  }

  isServiceSelected(serviceName: string): boolean {
    return this.selectedServices.includes(serviceName);
  }

  getSelectedServiceDetails(): ServiceType[] {
    return this.predefinedServices.filter((service) =>
      this.selectedServices.includes(service.name)
    );
  }

  getServiceDescription(serviceName: string): string {
    const desc = this.serviceDescriptions.find(
      (d) => d.serviceName === serviceName
    );
    return desc?.customDescription || '';
  }

  updateServiceDescription(serviceName: string, event: any) {
    const customDescription = event.target.value;

    const existingIndex = this.serviceDescriptions.findIndex(
      (desc) => desc.serviceName === serviceName
    );

    if (existingIndex > -1) {
      this.serviceDescriptions[existingIndex].customDescription =
        customDescription;
    } else {
      this.serviceDescriptions.push({
        serviceName,
        customDescription,
      });
    }
    this.clearMessages();
  }

  saveServices() {
    if (this.selectedServices.length === 0) {
      this.errorMessage = 'Please select at least one service.';
      return;
    }

    if (this.hourlyRate < 5 || this.hourlyRate > 200) {
      this.errorMessage =
        'Please set a valid hourly rate between 5 and 200 BAM.';
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    // Prepare the request data in the same format as cleaner setup
    const servicesOffered = this.selectedServices.join(', ');
    const bio = this.serviceDescriptions
      .filter((desc) => desc.customDescription.trim())
      .map((desc) => `${desc.serviceName}: ${desc.customDescription}`)
      .join(', ');

    // Use the cleaner update endpoint
    const request = {
      servicesOffered,
      hourlyRate: this.hourlyRate,
      bio: bio ? [bio] : [], // Send as array of strings to match backend
      // Don't send availability - keep existing
    };

    this.authService.updateCleaner(this.cleanerId, request).subscribe({
      next: () => {
        this.isLoading = false;
        this.showToast('Services updated successfully! 🎉', 'success');
      },
      error: (error) => {
        console.error('❌ Error updating services:', error);
        this.isLoading = false;
        this.showToast('Failed to update services. Please try again.', 'error');
      },
    });
  }

  private showToast(message: string, type: 'success' | 'error' | 'info') {
    if (type === 'success') {
      this.successMessage = message;
      this.errorMessage = '';
      setTimeout(() => (this.successMessage = ''), 3000);
    } else if (type === 'error') {
      this.errorMessage = message;
      this.successMessage = '';
      setTimeout(() => (this.errorMessage = ''), 5000);
    } else if (type === 'info') {
      this.successMessage = message;
      this.errorMessage = '';
      setTimeout(() => (this.successMessage = ''), 2000);
    }
  }

  clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
