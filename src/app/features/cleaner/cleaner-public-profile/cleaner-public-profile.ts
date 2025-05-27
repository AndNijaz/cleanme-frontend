import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {
  CleanerService,
  PublicCleanerProfile,
} from '../../../core/services/cleaner-service.service';

@Component({
  selector: 'app-cleaner-public-profile',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './cleaner-public-profile.component.html',
})
export class CleanerPublicProfileComponent implements OnInit {
  cleaner: PublicCleanerProfile | null = null;

  constructor(
    private route: ActivatedRoute,
    private cleanerService: CleanerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cleanerService.getCleanerPublicProfile(id).subscribe({
        next: (data) => {
          this.cleaner = data;
        },
        error: (err) => {
          console.error('Failed to load cleaner profile:', err);
        },
      });
    }
  }
  goToReservation() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.router.navigate(['/cleaner', id, 'reserve']);
    }
  }
}
