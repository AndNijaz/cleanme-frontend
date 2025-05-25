import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-personal-card',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-personal-card.component.html',
  standalone: true,
})
export class ProfilePersonalCardComponent {
  personalFields = [
    { label: 'First Name', key: 'firstName' },
    { label: 'Last Name', key: 'lastName' },
    { label: 'Email', key: 'email' },
    { label: 'Phone', key: 'phone' },
  ];

  @Input() profile: any;
  @Input() isEditing: boolean = false;
  @Output() onToggleEdit = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<void>();
}
