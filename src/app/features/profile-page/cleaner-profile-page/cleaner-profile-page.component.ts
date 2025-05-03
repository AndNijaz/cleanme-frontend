import { Component } from '@angular/core';
import { ProfilePageHeaderComponent } from '../../../shared/components/profile-page-header/profile-page-header';
import { NavbarComponent } from '../../../shared/navbar/navbar/navbar.component';

@Component({
  selector: 'app-cleaner-profile-page',
  imports: [ProfilePageHeaderComponent, NavbarComponent],
  templateUrl: './cleaner-profile-page.component.html',
})
export class CleanerProfilePageComponent {}
