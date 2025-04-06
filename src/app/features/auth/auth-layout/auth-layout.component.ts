import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BigEllipseComponent } from '../../../shared/components/ellipses/big-ellipse/big-ellipse.component';
import { SmallEllipseComponent } from '../../../shared/components/ellipses/small-ellipse/small-ellipse.component';
import { MatCardModule } from '@angular/material/card';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ContainerComponent } from '../../../shared/components/container/container.component';

@Component({
  selector: 'app-auth-layout',
  imports: [
    RouterOutlet,
    BigEllipseComponent,
    SmallEllipseComponent,
    MatCardModule,
    CardComponent,
    ContainerComponent,
  ],
  templateUrl: './auth-layout.component.html',
})
export class AuthLayoutComponent {}
