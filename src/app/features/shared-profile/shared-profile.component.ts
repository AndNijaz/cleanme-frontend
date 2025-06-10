import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditableFieldComponent } from '../../shared/components/editable-field/editable-field.component';
import { ProfileOverviewCardComponent } from './profile-overview-card/profile-overview-card.component';
import { ProfilePersonalCardComponent } from './profile-personal-card/profile-personal-card.component';
import { ProfileAddressCardComponent } from './profile-address-card/profile-address-card.component';
import {
  ProfileServicesCardComponent,
  ProfileData,
} from './profile-services-card/profile-services-card.component';
import { ProfileReviewsCardComponent } from './profile-reviews-card/profile-reviews-card.component';

import { UserType } from '../../core/services/models/user.model';
import { UserService, User } from '../../core/services/user.service';
import { CleanerService } from '../../core/services/cleaner-service.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-shared-profile',
  imports: [
    CommonModule,
    FormsModule,
    ProfileOverviewCardComponent,
    ProfilePersonalCardComponent,
    ProfileAddressCardComponent,
    ProfileServicesCardComponent,
    ProfileReviewsCardComponent,
  ],
  templateUrl: './shared-profile.component.html',
  standalone: true,
})
export class SharedProfileComponent implements OnInit {
  profile: User | null = null;
  profileData: ProfileData | null = null;
  editingSection: string | null = null;

  constructor(
    private userService: UserService,
    private cleanerService: CleanerService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.profile = user;
        console.log('Profile loaded:', user);

        // If this is a cleaner profile, also load cleaner-specific data
        if (this.isCleanerProfile()) {
          this.loadCleanerData();
        }
      },
      error: (error) => {
        console.error('Error loading profile:', error);
      },
    });
  }

  private loadCleanerData(): void {
    const authData = this.authService.getAuthData();
    if (!authData?.userId) return;

    this.cleanerService.getCleanerPublicProfile(authData.userId).subscribe({
      next: (cleanerProfile) => {
        this.profileData = {
          services: cleanerProfile.services || [],
          hourlyRate: cleanerProfile.hourlyRate || 25,
        };
        console.log('Cleaner profile data loaded:', this.profileData);
      },
      error: (error) => {
        console.error('Error loading cleaner profile data:', error);
        // Set default data so the component doesn't break
        this.profileData = {
          services: [],
          hourlyRate: 25,
        };
      },
    });
  }

  toggleEdit(section: string): void {
    this.editingSection = this.editingSection === section ? null : section;
  }

  saveProfile(section: string): void {
    if (!this.profile) return;

    // For address section, the component handles the save internally
    if (section === 'address') {
      this.editingSection = null;
      return;
    }

    this.userService.updateCurrentUser(this.profile).subscribe({
      next: (updatedUser) => {
        this.profile = updatedUser;
        this.editingSection = null;
        console.log('Profile updated:', updatedUser);
      },
      error: (error) => {
        console.error('Error updating profile:', error);
      },
    });
  }

  isCleanerProfile(): boolean {
    // Check if the current user is a cleaner
    // In a real implementation, this should check the user's role/type
    // For now, we'll check localStorage to see if the user type is CLEANER
    const userType = localStorage.getItem('userType');
    return userType === 'CLEANER';
  }
}
