import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ReviewData {
  id?: string;
  bookingId: string;
  cleanerId: string;
  cleanerName: string;
  rating: number;
  comment: string;
  serviceDate: string;
  serviceLocation: string;
  isEditing?: boolean;
}

@Component({
  selector: 'app-review-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-modal.component.html',
})
export class ReviewModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() reviewData?: ReviewData;
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<any>();

  rating = 0;
  hoverRating = 0;
  comment = '';
  selectedTags: string[] = [];
  isAnonymous = false;

  availableTags = [
    'Punctual',
    'Thorough',
    'Friendly',
    'Professional',
    'Quick',
    'Detailed',
    'Reliable',
    'Excellent Communication',
    'Left No Mess',
    'Great Value',
    'Would Recommend',
    'Exceeded Expectations',
  ];

  ngOnInit() {
    if (this.reviewData) {
      this.rating = this.reviewData.rating || 0;
      this.comment = this.reviewData.comment || '';
    }
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  setRating(star: number) {
    this.rating = star;
  }

  toggleTag(tag: string) {
    const index = this.selectedTags.indexOf(tag);
    if (index > -1) {
      this.selectedTags.splice(index, 1);
    } else {
      this.selectedTags.push(tag);
    }
  }

  getRatingDescription(rating: number): string {
    switch (rating) {
      case 5:
        return 'Exceptional - Exceeded all expectations';
      case 4:
        return 'Great - Very satisfied with service';
      case 3:
        return 'Good - Met expectations';
      case 2:
        return 'Fair - Some room for improvement';
      case 1:
        return 'Poor - Significant issues';
      case 0:
        return 'Please select a rating';
      default:
        return 'Please select a rating';
    }
  }

  isFormValid(): boolean {
    return this.rating > 0;
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  }

  submitReview() {
    if (!this.isFormValid()) return;

    const reviewData = {
      bookingId: this.reviewData?.bookingId,
      cleanerId: this.reviewData?.cleanerId,
      rating: this.rating,
      comment: this.comment.trim(),
      tags: this.selectedTags,
      isAnonymous: this.isAnonymous,
      isEditing: this.reviewData?.isEditing || false,
    };

    this.submit.emit(reviewData);
  }

  closeModal() {
    this.close.emit();
  }
}
