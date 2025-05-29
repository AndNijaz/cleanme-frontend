import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { GrayCardComponent } from '../../../shared/components/gray-card/gray-card.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { LeaveReviewCardComponent } from '../reviews/leave-review-card/leave-review-card.component';
import { CleanerCardModel } from '../../cleaner/cleaner-card/cleaner-card.component';
import { CleanerService } from '../../../core/services/cleaner-service.service';
import { ReviewService } from '../../../core/services/review.service';

@Component({
  selector: 'app-user-bookings',
  imports: [
    CommonModule,
    MatIconModule,
    GrayCardComponent,
    ModalComponent,
    LeaveReviewCardComponent,
  ],
  templateUrl: './user-bookings.component.html',
  standalone: true,
})
export class UserBookingsComponent {
  @Input() booking!: {
    id: string;
    cleanerId: string;
    cleanerName: string;
    date: string;
    time: string;
    message: string;
    profileImage?: string;
  };

  isReviewModalOpen = false;
  selectedCleaner: CleanerCardModel | null = null;

  constructor(
    private cleanerService: CleanerService,
    private reviewService: ReviewService
  ) {}

  openReviewModal() {
    this.cleanerService
      .getCleanerCardById(this.booking.cleanerId)
      .subscribe((cleaner) => {
        if (cleaner) {
          this.selectedCleaner = cleaner;
          this.isReviewModalOpen = true;
        } else {
          console.error(
            'Cleaner not found for booking:',
            this.booking.cleanerId
          );
        }
      });
  }

  closeReviewModal() {
    this.isReviewModalOpen = false;
    this.selectedCleaner = null;
  }

  handleReviewSubmit(event: { rating: number; message: string }) {
    if (!this.selectedCleaner) {
      console.error('No cleaner selected');
      return;
    }
    const reviewPayload = {
      cleanerId: this.selectedCleaner.id,
      bookingId: this.booking.id,
      cleanerName: this.selectedCleaner.fullName,
      rating: event.rating,
      message: event.message,
    };

    this.reviewService
      .submitReview({
        reservationId: this.booking.id,
        dto: reviewPayload,
      })
      .subscribe({
        next: (res) => {
          if (res.success) {
            console.log('✅ Review submitted');
            this.closeReviewModal(); // zatvori modal
            // možda želiš i da refreshaš listu rezervacija ili recenzija
          } else {
            console.error('❌ Submission failed');
          }
        },
        error: (err) => {
          console.error('❌ API error', err);
        },
      });
  }
}
