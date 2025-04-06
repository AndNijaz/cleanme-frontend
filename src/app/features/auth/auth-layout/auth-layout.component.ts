import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BigEllipseComponent } from '../../../shared/ellipses/big-ellipse/big-ellipse.component';
import { SmallEllipseComponent } from '../../../shared/ellipses/small-ellipse/small-ellipse.component';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-auth-layout',
  imports: [
    RouterOutlet,
    BigEllipseComponent,
    SmallEllipseComponent,
    MatCardModule,
  ],
  templateUrl: './auth-layout.component.html',
})
export class AuthLayoutComponent {}
