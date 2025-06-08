import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditableFieldComponent } from '../../shared/components/editable-field/editable-field.component';
import { ProfileOverviewCardComponent } from './profile-overview-card/profile-overview-card.component';
import { ProfilePersonalCardComponent } from './profile-personal-card/profile-personal-card.component';
import { ProfileAddressCardComponent } from './profile-address-card/profile-address-card.component';
import { GrayCardComponent } from '../../shared/components/gray-card/gray-card.component';
import { UserType } from '../../core/services/models/user.model';
import { UserService, User } from '../../core/services/user.service';

@Component({
  selector: 'app-shared-profile',
  imports: [
    CommonModule,
    FormsModule,
    ProfileOverviewCardComponent,
    ProfilePersonalCardComponent,
    ProfileAddressCardComponent,
    GrayCardComponent,
  ],
  templateUrl: './shared-profile.component.html',
  standalone: true,
})
export class SharedProfileComponent {
  profile: User | null = null;
  isEditingPersonal = false;
  isEditingOverview = false;
  isEditingAddress = false;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.getCurrentUser().subscribe({
      next: (user) => this.profile = user,
      error: (err) => console.error('Failed to load user profile', err)
    });
  }

  toggleEdit(section: 'overview' | 'personal' | 'address') {
    if (section === 'overview')
      this.isEditingOverview = !this.isEditingOverview;
    if (section === 'personal')
      this.isEditingPersonal = !this.isEditingPersonal;
    if (section === 'address') this.isEditingAddress = !this.isEditingAddress;
  }

  saveProfile() {
    if (this.profile) {
      this.userService.updateCurrentUser(this.profile).subscribe({
        next: (user) => {
          this.profile = user;
          alert('Profile updated!');
        },
        error: (err) => alert('Failed to update profile')
      });
    }
  }
}
