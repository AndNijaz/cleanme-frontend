import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { HomePageComponent } from './features/home/home-page/home-page.component';
import { UserDashboardComponent } from './features/dashboard/user-dashboard/user-dashboard.component';
import { CleanerDashboardComponent } from './features/dashboard/cleaner-dashboard/cleaner-dashboard.component';
import { AuthLayoutComponent } from './features/auth/auth-layout/auth-layout.component';
import { UserInfoComponent } from './features/auth/user-info/user-info.component';

import { CleanerInfoComponent } from './features/auth/cleaner-info/cleaner-info.component';

import { NotificationsComponent } from './features/notifications/notifications.component';

import { TermsAndConditionsComponent } from './features/terms-and-conditions/terms-and-conditions.component';
import { PlatformLayoutComponent } from './shared/components/platform-layout/platform-layout.component';
import { SharedProfileComponent } from './features/shared-profile/shared-profile.component';
import { CleanerPublicProfileComponent } from './features/cleaner/cleaner-public-profile/cleaner-public-profile';
import { FavoritesComponent } from './features/user/favorites/favorites.component';
import { PaymentsComponent } from './features/user/payments/payments.component';
import { ServiceReservationOneComponentComponent } from './features/cleaner/service-reservation-one.component/service-reservation-one.component.component';
import { BookingsReviewComponent } from './features/user/bookings-review/bookings-review.component';

export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'register-post', component: UserInfoComponent },
      { path: 'cleaner-post', component: CleanerInfoComponent },
      { path: 'terms', component: TermsAndConditionsComponent },
    ],
  },
  {
    path: '',
    component: PlatformLayoutComponent,
    children: [
      {
        path: 'user',
        children: [
          { path: 'dashboard', component: UserDashboardComponent },
          {
            path: 'profile',
            component: SharedProfileComponent,
            data: { userType: 'CLIENT' },
          },
          { path: 'reservations', component: BookingsReviewComponent },
          { path: 'favorites', component: FavoritesComponent },
          // { path: 'reviews', component: ReviewsComponent },
          { path: 'payments', component: PaymentsComponent },
          { path: 'settings', component: HomePageComponent },
        ],
      },

      {
        path: 'cleaner',
        children: [
          { path: 'dashboard', component: CleanerDashboardComponent },
          {
            path: 'profile',
            component: SharedProfileComponent,
            data: { userType: 'CLIENT' },
          },

          { path: 'jobs', component: HomePageComponent },
          { path: 'services', component: HomePageComponent },
          { path: 'availability', component: HomePageComponent },
          { path: 'reviews', component: HomePageComponent },
          { path: 'earnings', component: HomePageComponent },
          { path: 'settings', component: HomePageComponent },
        ],
      },

      // 🧾 SHARED ROUTES
      {
        path: 'cleaners',
        component: HomePageComponent,
      },
      {
        path: 'cleaner/:id',
        component: CleanerPublicProfileComponent,
      },
      {
        path: 'cleaner/:id/reserve',
        component: ServiceReservationOneComponentComponent,
      },
      {
        path: 'yuki',
        component: BookingsReviewComponent,
      },
    ],
  },

  {
    path: 'notifications',
    component: NotificationsComponent,
  },

  { path: '**', redirectTo: '' },
];
