import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-big-ellipse',
  imports: [],
  templateUrl: './big-ellipse.component.html',
})
export class BigEllipseComponent {
  @Input() class?: string;
}
