import { Component } from '@angular/core';
import { ContainerComponent } from '../../../shared/components/container/container.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-call-to-action',
  imports: [ContainerComponent, ButtonComponent, RouterModule],
  templateUrl: './call-to-action.component.html',
})
export class CallToActionComponent {}
