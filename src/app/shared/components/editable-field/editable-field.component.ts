// app-editable-field.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-editable-field',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editable-field.component.html',
})
export class EditableFieldComponent {
  @Input() label: string = '';
  @Input() editMode: boolean = false;
  @Input() model!: string;
}
