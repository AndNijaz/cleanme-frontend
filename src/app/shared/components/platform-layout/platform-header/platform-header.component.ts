import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-platform-header',
  templateUrl: './platform-header.component.html',
  standalone: true,
  imports: [CommonModule],
})
export class PlatformHeaderComponent {
  @Input() showBrowseCleaners: boolean = false;

  constructor(private router: Router, private authService: AuthService) {}

  onBrowseCleaners() {
    const role = this.authService.getUserRole();
    if (role === 'CLIENT') {
      this.router.navigate(['/user/dashboard']);
    } else if (role === 'CLEANER') {
      this.router.navigate(['/cleaner/dashboard']);
    } else {
      // Default fallback to user dashboard
      this.router.navigate(['/user/dashboard']);
    }
  }
}
