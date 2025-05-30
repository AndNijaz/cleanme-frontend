import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditableFieldComponent } from '../../shared/components/editable-field/editable-field.component';
import { ProfileOverviewCardComponent } from './profile-overview-card/profile-overview-card.component';
import { ProfilePersonalCardComponent } from './profile-personal-card/profile-personal-card.component';
import { ProfileAddressCardComponent } from './profile-address-card/profile-address-card.component';
import { GrayCardComponent } from '../../shared/components/gray-card/gray-card.component';
import { UserType } from '../../core/services/models/user.model';

@Component({
  selector: 'app-shared-profile',
  imports: [
    CommonModule,
    FormsModule,
    ProfileOverviewCardComponent,
    ProfilePersonalCardComponent,
    ProfileAddressCardComponent,
    GrayCardComponent,
  ],
  templateUrl: './shared-profile.component.html',
  standalone: true,
})
export class SharedProfileComponent {
  userType!: UserType;
  isEditingPersonal = false;
  isEditingOverview = false;
  isEditingAddress = false;

  profile = {
    firstName: 'Neko ime',
    lastName: 'Neko prezime',
    email: 'email@email.com',
    phone: '+387 61 111 222',
    address: 'Sarajevo 123',
    country: 'Bosna i Hercegovina',
    city: 'Sarajevo',
    street: 'Mula Mustafe Bašeskije',
    streetExtra: '25, floor 4',
  };

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const type = this.route.snapshot.data['userType'];
    this.userType = type;
  }

  toggleEdit(section: 'overview' | 'personal' | 'address') {
    if (section === 'overview')
      this.isEditingOverview = !this.isEditingOverview;
    if (section === 'personal')
      this.isEditingPersonal = !this.isEditingPersonal;
    if (section === 'address') this.isEditingAddress = !this.isEditingAddress;
  }

  saveProfile(section: 'overview' | 'personal' | 'address') {
    if (section === 'overview') this.isEditingOverview = false;
    if (section === 'personal') this.isEditingPersonal = false;
    if (section === 'address') this.isEditingAddress = false;

    console.log(`Saved ${section} data:`, this.profile);
  }
}
