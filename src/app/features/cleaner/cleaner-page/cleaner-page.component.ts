import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl  } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {DateSelectorComponent} from '../../../shared/components/date-selector/date-selector.component';
import {TimeSelectorComponent} from '../../../shared/components/time-selector/time-selector.component';
import { Router } from '@angular/router';
@Component({
  selector: 'app-cleaner-page',
  templateUrl: './cleaner-page.component.html',
  standalone: true,
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
  submitted = false;
  get dateControl(): FormControl {
    return this.mainForm.get('date') as FormControl;
  }

  get timeControl(): FormControl {
    return this.mainForm.get('time') as FormControl;
  }

  get locationControl(): FormControl {
    return this.mainForm.get('location') as FormControl;
  }


  constructor(private fb: FormBuilder,   private router: Router,
  ) {}

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
    this.submitted = true;
    if (this.mainForm.valid) {
//change 1 to :id when everything is ready
      this.router.navigate([`cleaner/1/reserve`]);
      console.log('Form Values:', this.mainForm.value);
      // Do whatever (e.g., send to API)
    } else {
      console.warn('Form is invalid');
      this.markAllControlsAsTouched();

    }
  }

  private markAllControlsAsTouched(): void {
    Object.values(this.mainForm.controls).forEach(control => {
      if (control instanceof FormGroup) {
        this.markAllControlsAsTouched();
      } else {
        control.markAsTouched();
      }
    });


}}
