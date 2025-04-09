import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { HomePageComponent } from './features/home/home-page/home-page.component';
import { UserDashboardComponent } from './features/dashboard/user-dashboard/user-dashboard.component';
import { CleanerDashboardComponent } from './features/dashboard/cleaner-dashboard/cleaner-dashboard.component';
import { AuthLayoutComponent } from './features/auth/auth-layout/auth-layout.component';
import { UserInfoComponent } from './features/auth/user-info/user-info.component';
import { CleanerInfoComponent } from './features/auth/cleaner-info/cleaner-info.component';

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
      { path: 'cleaner-post-1', component: CleanerInfoComponent },
    ],
  },
  {
    path: 'dashboard/user',
    component: UserDashboardComponent,
  },
  {
    path: 'dashboard/cleaner',
    component: CleanerDashboardComponent,
  },
  {
    path: 'profile/user',
    component: HomePageComponent,
  },
  {
    path: 'profile/cleaner',
    component: HomePageComponent,
  },
  {
    path: 'cleaners',
    component: HomePageComponent,
  },
  {
    path: 'cleaner/:id',
    component: HomePageComponent,
  },
  {
    path: 'book',
    component: HomePageComponent,
  },
  {
    path: 'my-reservations',
    component: HomePageComponent,
  },
  {
    path: 'notifications',
    component: HomePageComponent,
  },
  {
    path: 'chat/:reservationId',
    component: HomePageComponent,
  },
  {
    path: 'rate/:reservationId',
    component: HomePageComponent,
  },
  {
    path: 'terms',
    component: HomePageComponent,
  },
  { path: '**', redirectTo: '' },
];
