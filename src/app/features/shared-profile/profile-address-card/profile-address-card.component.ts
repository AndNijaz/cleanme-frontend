import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../../../core/services/user.service';

@Component({
  selector: 'app-profile-address-card',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-address-card.component.html',
})
export class ProfileAddressCardComponent {
  @Input() profile: User | null = null;
  @Input() isEditing: boolean = false;
  @Output() onToggleEdit = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<void>();
}
