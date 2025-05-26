import { Component, Input } from '@angular/core';
import { Review } from '../../../../core/services/review.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reviews-card',
  templateUrl: './reviews-card.component.html',
  standalone: true,
  imports: [MatIconModule, CommonModule, FormsModule],
})
export class ReviewsCardComponent {
  @Input() review!: Review;
}
