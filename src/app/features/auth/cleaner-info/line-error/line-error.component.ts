import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-line-error',
  imports: [],
  templateUrl: './line-error.component.html',
})
export class LineErrorComponent {
  @Input({ required: true }) error: string = ''; // Error message to display
}
