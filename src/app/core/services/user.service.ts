import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  city: string;
  street: string;
  streetExtra: string;
  // ... any other fields
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly BASE_URL = `${environment['NG_APP_BASE_URL']}/user`;

  constructor(private http: HttpClient) {}

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.BASE_URL}/me`);
  }

  updateCurrentUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.BASE_URL}/me`, user);
  }
}
