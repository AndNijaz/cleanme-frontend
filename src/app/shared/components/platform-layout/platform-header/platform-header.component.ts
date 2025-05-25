import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-platform-header',
  imports: [CommonModule],
  templateUrl: './platform-header.component.html',
})
export class PlatformHeaderComponent {
  @Input() showBrowseCleaners: boolean = true;

  onBrowseCleaners() {
    // Implement browse cleaners logic
    console.log('Browse cleaners...');
  }
}
