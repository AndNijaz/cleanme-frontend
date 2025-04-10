import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-service-reservation-page',
  imports: [FormsModule, CommonModule],
  templateUrl: './service-reservation-page.component.html',
})
export class ServiceReservationPageComponent {
  // Mock data for the payment page
  serviceDetails = {
    name: 'John Doe',
    date: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    time: '10:00 AM',
    price: 89.00
  };

  // Simple mock payment data
  paymentData = {
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    cardName: '',
    country: 'Bosnia and Herzegovina',
    zipCode: ''
  };

  // Available countries for dropdown
  countries = [
    'Bosnia and Herzegovina',
    'United States',
    'United Kingdom',
    'Canada',
    'Australia',
    'Germany',
    'France'
  ];

  // UI state
  isProcessing = false;
  paymentSuccess = false;

  // Mock payment processing
  processPayment() {
    this.isProcessing = true;

    // Simulate API call delay
    setTimeout(() => {
      this.isProcessing = false;
      this.paymentSuccess = true;

      // Reset after showing success
      setTimeout(() => {
        this.paymentSuccess = false;
      }, 3000);
    }, 1500);
  }

  // Simple formatter for card number
  formatCardNumber(event: Event) {
    const input = event.target as HTMLInputElement;
    // Remove all non-digit characters
    let value = input.value.replace(/\D/g, '');

    // Add spaces every 4 digits
    if (value.length > 0) {
      value = value.match(/.{1,4}/g)?.join(' ') || '';
    }

    // Update both the model and view
    this.paymentData.cardNumber = value;
    input.value = value;
  }

  // Simple formatter for expiry date
  formatExpiryDate(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    // Auto-insert slash after 2 digits
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }

    // Limit to 5 characters (MM/YY)
    value = value.substring(0, 5);

    this.paymentData.expiryDate = value;
    input.value = value;
  }

  limitToNumbers(event: Event, maxLength: number) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    value = value.substring(0, maxLength);

    // Update both model and view
    this.paymentData.cvc = value;
    input.value = value;
  }

}
