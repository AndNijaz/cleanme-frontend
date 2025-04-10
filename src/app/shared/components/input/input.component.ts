import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
} from '@angular/core';
import {
  FormsModule,
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
} from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  host: {
    class: 'flex-1',
  },
})
export class InputComponent implements ControlValueAccessor {
  @Input({ required: true }) name!: string;
  @Input() placeholder?: string;
  @Input() class?: string;
  @Input() required: boolean = false;
  @Input() type: string = 'text';

  @Input() ngModel?: string;
  @Output() ngModelChange = new EventEmitter<string>();

  touched = false;

  get getClass() {
    return `border-2 ${this.showError ? 'border-red-500' : 'border-blue-400'}
    rounded-lg p-2 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 w-full flex-1 ${this.class}`;
  }

  get showError() {
    return this.required && this.touched && !this.ngModel;
  }

  onChange = (value: any) => {};
  onTouched = () => {};

  writeValue(value: any): void {
    this.ngModel = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {}

  onInput(event: any) {
    const value = event.target.value;
    this.ngModel = value;
    this.ngModelChange.emit(value);
    this.onChange(value);
  }

  onBlur(event: any) {
    this.touched = true;
    this.onTouched();
  }
}
