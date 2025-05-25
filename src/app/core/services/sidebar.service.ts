import { Injectable } from '@angular/core';

export type UserRole = 'CLEANER' | 'CLIENT';

export interface SidebarItem {
  label: string;
  route: string;
  active?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SidebarService {
  private readonly config: Record<UserRole, SidebarItem[]> = {
    CLIENT: [
      { label: 'My Profile', route: '/user/profile' },
      { label: 'My Bookings', route: '/user/reservations' },
      { label: 'Favorites', route: '/user/favorites' },
      { label: 'Reviews', route: '/user/reviews' },
      { label: 'Payments', route: '/user/payments' },
      { label: 'Settings', route: '/user/settings' },
    ],
    CLEANER: [
      { label: 'My Profile', route: '/cleaner/profile' },
      { label: 'My Jobs', route: '/cleaner/jobs' },
      { label: 'Services', route: '/cleaner/services' },
      { label: 'Availability', route: '/cleaner/availability' },
      { label: 'Reviews', route: '/cleaner/reviews' },
      { label: 'Earnings', route: '/cleaner/earnings' },
      { label: 'Settings', route: '/cleaner/settings' },
    ],
  };

  getSidebar(role: UserRole, currentPath: string): SidebarItem[] {
    return this.config[role].map((item) => ({
      ...item,
      active: currentPath.startsWith(item.route),
    }));
  }
}
