import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent implements OnInit {
  userRole: string | null = null;

  // User preferences
  settings = {
    notifications: {
      email: true,
      sms: true,
      pushNotifications: true,
      jobReminders: true,
      marketingEmails: false,
    },
    privacy: {
      profileVisibility: 'public',
      shareLocation: true,
      shareContactInfo: true,
    },
    account: {
      twoFactorAuth: false,
      autoLogout: '30min',
    },
  };

  // Form data
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.userRole = this.authService.getUserRole();
    this.loadSettings();
  }

  loadSettings() {
    // Load user settings from localStorage or API
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
    }
  }

  saveSettings() {
    // Save settings to localStorage and/or API
    localStorage.setItem('userSettings', JSON.stringify(this.settings));

    // Show success message
    alert('Settings saved successfully!');
  }

  updatePassword() {
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    if (this.passwordForm.newPassword.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
    }

    // API call to update password
    console.log('Updating password...');
    alert('Password updated successfully!');

    // Reset form
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
  }

  deleteAccount() {
    const confirmation = confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    if (confirmation) {
      // API call to delete account
      console.log('Deleting account...');
      this.authService.clearAuthData();
      window.location.href = '/';
    }
  }

  exportData() {
    // API call to export user data
    console.log('Exporting user data...');
    alert('Your data export will be sent to your email address.');
  }

  onNotificationChange(key: string, value: boolean) {
    (this.settings.notifications as any)[key] = value;
  }

  onPrivacyChange(key: string, value: any) {
    (this.settings.privacy as any)[key] = value;
  }

  onAccountChange(key: string, value: any) {
    (this.settings.account as any)[key] = value;
  }
}
