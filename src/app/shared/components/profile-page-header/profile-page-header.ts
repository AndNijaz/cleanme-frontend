import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-profile-page-header',
  standalone: true,
  templateUrl: './profile-page-header.html',
})
export class ProfilePageHeaderComponent {
  @Input() name!: string;
  @Input() photoUrl?: string;
}
