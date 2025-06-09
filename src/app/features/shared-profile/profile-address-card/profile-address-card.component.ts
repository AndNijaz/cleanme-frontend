import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User, UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-profile-address-card',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-address-card.component.html',
})
export class ProfileAddressCardComponent implements OnChanges {
  @Input() profile: User | null = null;
  @Input() isEditing: boolean = false;
  @Output() onToggleEdit = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<void>();

  // Add missing properties
  attempted: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  originalProfile: User | null = null;

  constructor(private userService: UserService) {}

  saveAddress(): void {
    this.attempted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.profile) {
      this.errorMessage = 'Profile data not available';
      return;
    }

    // Validate required fields
    if (
      !this.profile.country?.trim() ||
      !this.profile.city?.trim() ||
      !this.profile.street?.trim()
    ) {
      this.errorMessage =
        'Please fill in all required fields (Country, City, Street)';
      return;
    }

    this.isLoading = true;

    // Update the profile via the backend
    this.userService.updateCurrentUser(this.profile).subscribe({
      next: (updatedUser) => {
        this.isLoading = false;
        this.successMessage = 'Address updated successfully!';
        this.profile = updatedUser;

        // Clear success message after 3 seconds and close edit mode
        setTimeout(() => {
          this.successMessage = '';
          this.onToggleEdit.emit();
          this.attempted = false;
        }, 1500);

        this.onSave.emit();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage =
          error.error?.message || 'Failed to update address. Please try again.';
        console.error('Error updating address:', error);
      },
    });
  }

  cancelEdit(): void {
    if (this.originalProfile && this.profile) {
      // Restore original values
      this.profile.country = this.originalProfile.country;
      this.profile.city = this.originalProfile.city;
      this.profile.street = this.originalProfile.street;
      this.profile.streetExtra = this.originalProfile.streetExtra;
    }

    this.attempted = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.onToggleEdit.emit();
  }

  ngOnChanges(): void {
    // Store original profile when editing starts
    if (this.isEditing && this.profile && !this.originalProfile) {
      this.originalProfile = { ...this.profile };
    } else if (!this.isEditing) {
      this.originalProfile = null;
      this.attempted = false;
      this.errorMessage = '';
      this.successMessage = '';
    }
  }

  getFullAddress(): string {
    if (!this.profile) return 'No address information available';

    const parts = [
      this.profile.street,
      this.profile.streetExtra,
      this.profile.city,
      this.profile.country,
    ].filter((part) => part && part.trim());

    return parts.length > 0
      ? parts.join(', ')
      : 'No address information available';
  }
}
