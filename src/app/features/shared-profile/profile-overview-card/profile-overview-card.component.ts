import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-overview-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-overview-card.component.html',
})
export class ProfileOverviewCardComponent {
  @Input() profile: any;
  @Input() isEditing: boolean = false;
  @Output() onToggleEdit = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<void>();
}
