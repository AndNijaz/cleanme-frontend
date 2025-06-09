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
      { label: 'My Bookings', route: '/user/reservations' },
      { label: 'Favorites', route: '/user/favorites' },
      { label: 'Payments', route: '/user/payments' },
      { label: 'My Profile', route: '/user/profile' },
    ],
    CLEANER: [
      { label: 'My Jobs', route: '/cleaner/jobs' },
      { label: 'Services', route: '/cleaner/services' },
      { label: 'Availability', route: '/cleaner/availability' },
      { label: 'Earnings', route: '/cleaner/earnings' },
      { label: 'Reviews', route: '/cleaner/reviews' },
      { label: 'My Profile', route: '/cleaner/profile' },
    ],
  };

  getSidebar(role: UserRole, currentPath: string): SidebarItem[] {
    return this.config[role].map((item) => ({
      ...item,
      active: currentPath.startsWith(item.route),
    }));
  }
}
//
