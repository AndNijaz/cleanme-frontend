import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService, Theme } from '../../../core/services/theme.service';
import { UserService, User } from '../../../core/services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent implements OnInit, OnDestroy {
  userRole: string | null = null;
  currentUser: User | null = null;
  currentTheme: Theme = 'light';
  private themeSubscription?: Subscription;

  // User preferences
  settings = {
    theme: 'light' as Theme,
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

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.userRole = this.authService.getUserRole();
    this.loadCurrentUser();
    this.loadSettings();

    // Subscribe to theme changes
    this.themeSubscription = this.themeService.theme$.subscribe((theme) => {
      this.currentTheme = theme;
      this.settings.theme = theme;
    });
  }

  ngOnDestroy() {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  private loadCurrentUser(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser = user;
      },
      error: (error) => {
        console.error('Error loading user data:', error);
      },
    });
  }

  getUserName(): string {
    if (this.currentUser?.firstName && this.currentUser?.lastName) {
      return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    }

    const authData = this.authService.getAuthData();
    if (authData?.firstName && authData?.lastName) {
      return `${authData.firstName} ${authData.lastName}`;
    }

    return 'User';
  }

  getUserEmail(): string {
    // First try auth data from localStorage
    const authData = this.authService.getAuthData();
    if (authData?.email) {
      return authData.email;
    }

    // Fallback to current user data from API
    if (this.currentUser?.email) {
      return this.currentUser.email;
    }

    return 'user@example.com';
  }

  getInitials(): string {
    const name = this.getUserName();
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  loadSettings() {
    // Load user settings from localStorage or API
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
    }

    // Ensure current theme is properly set
    this.currentTheme = this.themeService.getCurrentTheme();
    this.settings.theme = this.currentTheme;
  }

  saveSettings() {
    // Save settings to localStorage and/or API
    localStorage.setItem('userSettings', JSON.stringify(this.settings));

    // Show success message
    alert('Settings saved successfully!');
  }

  onThemeChange(theme: Theme): void {
    console.log('Theme change requested:', theme);
    this.currentTheme = theme;
    this.settings.theme = theme;
    this.themeService.setTheme(theme);

    // Force a check to ensure the theme was applied
    setTimeout(() => {
      const actualTheme = this.themeService.getCurrentTheme();
      console.log('Theme after change:', actualTheme);
      console.log(
        'Document has dark class:',
        document.documentElement.classList.contains('dark')
      );
    }, 100);
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
