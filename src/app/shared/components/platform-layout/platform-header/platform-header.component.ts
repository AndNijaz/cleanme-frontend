import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-platform-header',
  templateUrl: './platform-header.component.html',
  standalone: true,
  imports: [CommonModule],
})
export class PlatformHeaderComponent {
  @Input() showBrowseCleaners: boolean = false;

  constructor(private router: Router) {}

  onBrowseCleaners() {
    this.router.navigate(['/user/dashboard']);
  }
}
