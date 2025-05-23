import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

export type UserType = 'CLIENT' | 'CLEANER';

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userType: UserType;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  firstName: string;
  lastName: string;
  userType: UserType;
}

export interface CleanerSetupRequest {
  cleanerId: string;
  servicesOffered: string;
  hourlyRate: number;
  availability: string;
  bio: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly BASE_URL = 'http://localhost:8080/auth';


  constructor(private http: HttpClient, private router: Router) {}

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
    return this.http.post<void>(`${this.BASE_URL}/cleaner-setup`, data);
  }

  // === AUTH STORAGE ===
  saveAuthData(res: AuthResponse): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('userId', res.userId);
    localStorage.setItem('userType', res.userType);
  }

  getAuthData(): {
    token: string | null;
    userId: string | null;
    userType: UserType | null;
  } {
    return {
      token: localStorage.getItem('token'),
      userId: localStorage.getItem('userId'),
      userType: localStorage.getItem('userType') as UserType | null,
    };
  }

  clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userType');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}
