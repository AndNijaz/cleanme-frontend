import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import {
  AuthResponse,
  CleanerSetupRequest,
  LoginRequest,
  RegisterRequest,
} from './models/auth.model';
import { UserType } from './models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly BASE_URL = `${environment['NG_APP_BASE_URL']}/auth`;

  constructor(private http: HttpClient) {}

  // === REGISTER ===
  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.BASE_URL}/register`, data);
  }

  // === LOGIN ===
  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.BASE_URL}/login`, data);
  }

  // === CLEANER SETUP ===
  setupCleaner(data: CleanerSetupRequest): Observable<void> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post<void>(`${this.BASE_URL}/cleaner-setup`, data, {
      headers,
    });
  }

  // === CLEANER UPDATE ===
  updateCleaner(cleanerId: string, data: any): Observable<void> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    const baseUrl = environment['NG_APP_BASE_URL'];
    return this.http.put<void>(`${baseUrl}/cleaners/${cleanerId}`, data, {
      headers,
    });
  }

  // === AUTH STORAGE ===
  saveAuthData(res: AuthResponse): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('userId', res.userId);
    localStorage.setItem('userType', res.userType);
    localStorage.setItem('firstName', res.firstName);
    localStorage.setItem('lastName', res.lastName);
    localStorage.setItem('email', res.email);
    localStorage.setItem('address', res.address);
    localStorage.setItem('phoneNumber', res.phoneNumber);
  }

  getAuthData(): AuthResponse | null {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const userType = localStorage.getItem('userType') as UserType | null;
    const firstName = localStorage.getItem('firstName') ?? '';
    const lastName = localStorage.getItem('lastName') ?? '';
    const email = localStorage.getItem('email') ?? '';
    const phoneNumber = localStorage.getItem('phoneNumber') ?? '';
    const address = localStorage.getItem('address') ?? '';

    if (!token || !userId || !userType) {
      return null;
    }

    return {
      token,
      userId,
      userType,
      firstName,
      lastName,
      email,
      address,
      phoneNumber,
    };
  }

  clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userType');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    localStorage.removeItem('email');
    localStorage.removeItem('address');
    localStorage.removeItem('phoneNumber');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getUserRole(): 'CLEANER' | 'CLIENT' | null {
    const role = (localStorage.getItem('userType') as UserType | null) ?? null;
    return role;
  }
}
