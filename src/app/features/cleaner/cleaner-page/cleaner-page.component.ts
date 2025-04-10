import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {DateSelectorComponent} from '../../../shared/components/date-selector/date-selector.component';
import {TimeSelectorComponent} from '../../../shared/components/time-selector/time-selector.component';

@Component({
  selector: 'app-cleaner-page',
  templateUrl: './cleaner-page.component.html',
  standalone: true,  // If you're using standalone components
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,

     DateSelectorComponent,
    TimeSelectorComponent
  ]
})
export class CleanerPageComponent implements OnInit {
  mainForm!: FormGroup;

  get dateControl(): FormControl {
    return this.mainForm.get('date') as FormControl;
  }

  get timeControl(): FormControl {
    return this.mainForm.get('time') as FormControl;
  }

  get locationControl(): FormControl {
    return this.mainForm.get('location') as FormControl;
  }


  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // Build the form controls:
    this.mainForm = this.fb.group({
      date:      [null, Validators.required],
      time:      [null, Validators.required],
      location:  ['',   Validators.required],
      comment:   ['']
    });
  }

  onSubmit(): void {
    if (this.mainForm.valid) {
      console.log('Form Values:', this.mainForm.value);
      // Do whatever (e.g., send to API)
    } else {
      console.warn('Form is invalid');
    }
  }
}
