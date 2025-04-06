import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-small-ellipse',
  imports: [],
  templateUrl: './small-ellipse.component.html',
})
export class SmallEllipseComponent {
  @Input() class?: string;
}
