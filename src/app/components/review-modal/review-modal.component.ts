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
  template: `
    <div
      *ngIf="isOpen"
      class="fixed inset-0 z-50 overflow-y-auto"
      (click)="onBackdropClick($event)"
    >
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
      ></div>

      <!-- Modal Container -->
      <div class="flex min-h-full items-center justify-center p-4">
        <div
          class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-100"
        >
          <!-- Header -->
          <div
            class="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-t-2xl text-white"
          >
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-bold mb-1">
                  {{
                    reviewData?.isEditing
                      ? 'Edit Your Review'
                      : 'Share Your Experience'
                  }}
                </h2>
                <p class="text-blue-100">
                  {{ reviewData?.cleanerName }} •
                  {{ formatDate(reviewData?.serviceDate) }}
                </p>
              </div>
              <button
                (click)="closeModal()"
                class="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
              >
                <i class="fas fa-times text-xl"></i>
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="p-6 space-y-6">
            <!-- Service Details -->
            <div class="bg-gray-50 rounded-xl p-4">
              <h3
                class="font-semibold text-gray-900 mb-3 flex items-center gap-2"
              >
                <i class="fas fa-info-circle text-blue-500"></i>
                Service Details
              </h3>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-600">Date:</span>
                  <span class="font-medium ml-2">{{
                    formatDate(reviewData?.serviceDate)
                  }}</span>
                </div>
                <div>
                  <span class="text-gray-600">Location:</span>
                  <span class="font-medium ml-2">{{
                    reviewData?.serviceLocation || 'Home Service'
                  }}</span>
                </div>
              </div>
            </div>

            <!-- Rating Section -->
            <div class="space-y-4">
              <h3 class="font-semibold text-gray-900 flex items-center gap-2">
                <i class="fas fa-star text-yellow-500"></i>
                Rate Your Experience
              </h3>

              <!-- Star Rating -->
              <div class="flex items-center gap-3">
                <div class="flex gap-1">
                  <button
                    *ngFor="let star of [1, 2, 3, 4, 5]"
                    (click)="setRating(star)"
                    (mouseenter)="hoverRating = star"
                    (mouseleave)="hoverRating = 0"
                    class="text-3xl transition-all duration-200 hover:scale-110 focus:outline-none focus:scale-110"
                    [class.text-yellow-400]="star <= (hoverRating || rating)"
                    [class.text-gray-300]="star > (hoverRating || rating)"
                  >
                    <i class="fas fa-star"></i>
                  </button>
                </div>
                <div class="ml-3">
                  <span class="text-2xl font-bold text-gray-800"
                    >{{ rating }}/5</span
                  >
                  <p class="text-sm text-gray-600 mt-1">
                    {{ getRatingDescription(rating) }}
                  </p>
                </div>
              </div>

              <!-- Rating Guidelines -->
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 class="font-medium text-blue-900 mb-2">Rating Guide:</h4>
                <div
                  class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-blue-800"
                >
                  <div><strong>5 stars:</strong> Exceptional service</div>
                  <div><strong>4 stars:</strong> Great service</div>
                  <div><strong>3 stars:</strong> Good service</div>
                  <div><strong>2 stars:</strong> Fair service</div>
                  <div><strong>1 star:</strong> Poor service</div>
                </div>
              </div>
            </div>

            <!-- Comment Section -->
            <div class="space-y-4">
              <h3 class="font-semibold text-gray-900 flex items-center gap-2">
                <i class="fas fa-comment text-green-500"></i>
                Share Details
                <span class="text-sm text-gray-500 font-normal"
                  >(Optional)</span
                >
              </h3>

              <div class="relative">
                <textarea
                  [(ngModel)]="comment"
                  placeholder="Tell others about your experience... What did you like? What could be improved?"
                  class="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200"
                  rows="4"
                  maxlength="500"
                ></textarea>
                <div class="absolute bottom-3 right-3 text-xs text-gray-500">
                  {{ comment.length }}/500
                </div>
              </div>

              <!-- Writing Tips -->
              <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 class="font-medium text-green-900 mb-2">
                  💡 Helpful Tips:
                </h4>
                <ul class="text-sm text-green-800 space-y-1">
                  <li>
                    • Mention specific aspects like punctuality, thoroughness,
                    friendliness
                  </li>
                  <li>• Be honest and constructive with your feedback</li>
                  <li>• Help other customers make informed decisions</li>
                </ul>
              </div>
            </div>

            <!-- Quick Tags -->
            <div class="space-y-4">
              <h3 class="font-semibold text-gray-900 flex items-center gap-2">
                <i class="fas fa-tags text-purple-500"></i>
                Quick Tags
                <span class="text-sm text-gray-500 font-normal"
                  >(Select all that apply)</span
                >
              </h3>

              <div class="flex flex-wrap gap-2">
                <button
                  *ngFor="let tag of availableTags"
                  (click)="toggleTag(tag)"
                  class="px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 border-2"
                  [ngClass]="{
                    'bg-blue-500 text-white border-blue-500':
                      selectedTags.includes(tag),
                    'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200':
                      !selectedTags.includes(tag)
                  }"
                >
                  {{ tag }}
                </button>
              </div>
            </div>

            <!-- Anonymous Option -->
            <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <input
                type="checkbox"
                id="anonymous"
                [(ngModel)]="isAnonymous"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label for="anonymous" class="text-sm text-gray-700">
                Post review anonymously
              </label>
              <i
                class="fas fa-info-circle text-gray-400 cursor-help"
                title="Your review will be shown without your name"
              ></i>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-between items-center"
          >
            <button
              (click)="closeModal()"
              class="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>

            <button
              (click)="submitReview()"
              [disabled]="!isFormValid()"
              class="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
            >
              <i class="fas fa-paper-plane mr-2"></i>
              {{ reviewData?.isEditing ? 'Update Review' : 'Submit Review' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
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
    'Professional',
    'Punctual',
    'Thorough',
    'Friendly',
    'Reliable',
    'Affordable',
    'Eco-friendly',
    'Efficient',
    'Courteous',
    'Flexible',
  ];

  ngOnInit() {
    if (this.reviewData?.isEditing) {
      this.rating = this.reviewData.rating;
      this.comment = this.reviewData.comment;
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
        return 'Exceptional - Exceeded expectations';
      case 4:
        return 'Great - Very satisfied';
      case 3:
        return 'Good - Met expectations';
      case 2:
        return 'Fair - Some issues';
      case 1:
        return 'Poor - Disappointed';
      default:
        return 'Please select a rating';
    }
  }

  isFormValid(): boolean {
    return this.rating > 0;
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'Unknown Date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  submitReview() {
    if (!this.isFormValid()) return;

    const reviewSubmission = {
      id: this.reviewData?.id,
      bookingId: this.reviewData?.bookingId,
      cleanerId: this.reviewData?.cleanerId,
      rating: this.rating,
      comment: this.comment.trim(),
      tags: this.selectedTags,
      isAnonymous: this.isAnonymous,
      isEditing: this.reviewData?.isEditing || false,
    };

    this.submit.emit(reviewSubmission);
  }

  closeModal() {
    this.close.emit();
  }
}
