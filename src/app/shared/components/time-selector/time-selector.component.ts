import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-time-selector',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonToggleModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './time-selector.component.html',
  styleUrl: './time-selector.component.scss',
})
export class TimeSelectorComponent {
  // Add this to your component class
  public Math = Math;
  @Input() control!: FormControl;

  allTimes: string[] = this.generateTimeSlots();
  visibleTimes: string[] = [];
  currentIndex = 0;
  visibleCount = 6;

  constructor() {
    this.updateVisibleTimes();
  }

  private generateTimeSlots(): string[] {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 20 && minute=== 30) break;
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  }

  next() {
    if (this.currentIndex + this.visibleCount < this.allTimes.length) {
      this.currentIndex++;
      this.updateVisibleTimes();
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateVisibleTimes();
    }
  }

  private updateVisibleTimes() {
    this.visibleTimes = this.allTimes.slice(
      this.currentIndex,
      this.currentIndex + this.visibleCount
    );
  }

  onSelectTime(value: string) {
    this.control.setValue(value);
  }
}
