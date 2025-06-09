import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, HostListener } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import {
  SidebarItem,
  SidebarService,
} from '../../../core/services/sidebar.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-platform-layout',
  imports: [RouterModule, CommonModule],
  templateUrl: './platform-layout.component.html',
  styleUrl: './platform-layout.component.css',
  standalone: true,
})
export class PlatformLayoutComponent implements OnInit {
  sidebarItems: SidebarItem[] = [];
  sidebarCollapsed = false;
  profileDropdownOpen = false;
  userRole: string | null = null;
  isMobile = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private sidebarService: SidebarService
  ) {
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.profileDropdownOpen = false;
    }
  }

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.setupSidebar(this.router.url);

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.setupSidebar(event.urlAfterRedirects);
      }
    });
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 1024;
    if (this.isMobile) {
      this.sidebarCollapsed = true;
    }
  }

  private setupSidebar(currentUrl: string) {
    const role = this.authService.getUserRole();
    this.sidebarItems = this.sidebarService.getSidebar(role, currentUrl);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleProfileDropdown(): void {
    this.profileDropdownOpen = !this.profileDropdownOpen;
  }

  onBrowseCleaners(): void {
    this.router.navigate(['/cleaners']);
    // Close sidebar on mobile after navigation
    if (this.isMobile) {
      this.sidebarCollapsed = true;
    }
  }

  getUserName(): string {
    const authData = this.authService.getAuthData();
    if (authData?.firstName && authData?.lastName) {
      return `${authData.firstName} ${authData.lastName}`;
    }
    return 'User';
  }

  getUserEmail(): string {
    const authData = this.authService.getAuthData();
    // For now, return a placeholder since email is not in the AuthResponse
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

  getIconPath(label: string): string {
    const iconMap: { [key: string]: string } = {
      'My Profile':
        'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      'My Bookings':
        'M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2m-6 0h8m-8 0l1 12h6l1-12',
      Favorites:
        'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
      Payments:
        'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
      Settings:
        'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.065-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.065z',
      'My Jobs':
        'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6',
      Services:
        'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
      Availability: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      Reviews:
        'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
      Earnings:
        'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    };

    return iconMap[label] || 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
  }

  onLogOut(): void {
    this.authService.clearAuthData();
    this.router.navigate(['']);
  }
}
