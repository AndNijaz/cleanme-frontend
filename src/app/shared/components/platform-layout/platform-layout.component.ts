import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { PlatformHeaderComponent } from './platform-header/platform-header.component';
import {
  SidebarItem,
  SidebarService,
} from '../../../core/services/sidebar.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-platform-layout',
  imports: [RouterModule, CommonModule, PlatformHeaderComponent],
  templateUrl: './platform-layout.component.html',
  standalone: true,
})
export class PlatformLayoutComponent {
  sidebarItems: SidebarItem[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    this.setupSidebar(this.router.url);

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.setupSidebar(event.urlAfterRedirects);
      }
    });
  }

  private setupSidebar(currentUrl: string) {
    const role = this.authService.getUserRole(); // 'CLIENT' or 'CLEANER'
    this.sidebarItems = this.sidebarService.getSidebar(role, currentUrl);
  }

  onLogOut(): void {}
  onDeleteAccount(): void {}
}
