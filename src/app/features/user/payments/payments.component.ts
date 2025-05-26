import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import {
  Payment,
  PaymentService,
} from '../../../core/services/payments.service';
import { GrayCardComponent } from '../../../shared/components/gray-card/gray-card.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  standalone: true,
  imports: [GrayCardComponent, CommonModule],
})
export class PaymentsComponent implements OnInit {
  payments: Payment[] = [];
  isLoading = true;

  constructor(
    private paymentService: PaymentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getAuthData()?.userId || '';
    this.paymentService.getUserPayments(userId).subscribe({
      next: (data) => {
        this.payments = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching payments:', err);
        this.isLoading = false;
      },
    });
  }
}
