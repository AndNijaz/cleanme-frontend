import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { GrayCardComponent } from '../../../shared/components/gray-card/gray-card.component';

@Component({
  selector: 'app-user-bookings',
  imports: [CommonModule, MatIconModule, GrayCardComponent],
  templateUrl: './user-bookings.component.html',
  standalone: true,
})
export class UserBookingsComponent {
  @Input() booking: {
    cleanerName: string;
    date: string;
    time: string;
    message: string;
    profileImage?: string;
  } = {
    cleanerName: 'Bahra Zedic',
    date: '21.3.2023',
    time: '17:00 to 21:00',
    message:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris lacus neque, mattis ut dictum ut.',
  };

  onLeaveReview() {
    console.log('🔍 Leave a Review clicked for:', this.booking.cleanerName);
    // TODO: route to /user/reviews or open modal
  }
}
