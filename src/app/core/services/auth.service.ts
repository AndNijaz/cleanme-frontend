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
  address: string;
  phoneNumber: string;
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
  address: string;
  phoneNumber: string;
}

export interface CleanerSetupRequest {
  cleanerId: string;
  servicesOffered: string;
  hourlyRate: number;
  availability: { [day: string]: { from: string; to: string } }[];
  bio: string[];
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

  getAuthData(): AuthResponse | null {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const userType = localStorage.getItem('userType') as UserType | null;
    const firstName = localStorage.getItem('firstName') ?? '';
    const lastName = localStorage.getItem('lastName') ?? '';
    // const email = localStorage.getItem('email') ?? '';
    const phoneNumber = localStorage.getItem('phoneNumber') ?? '';
    const address = localStorage.getItem('address') ?? '';

    if (!token || !userId || !userType) {
      // mock fallback for development
      return {
        token: 'mock-token',
        userId: 'mock-user-id1',
        userType: 'CLIENT',
        firstName: 'Mock',
        lastName: 'User',
        // email: "mock@example.com",
        address: '123 Mock St',
        phoneNumber: '123-456-7890',
      };
    }

    // return { token, userId, userType, firstName, lastName, email, address, phoneNumber };
    return {
      token,
      userId,
      userType,
      firstName,
      lastName,
      address,
      phoneNumber,
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

  getUserRole(): 'CLEANER' | 'CLIENT' {
    const role = (localStorage.getItem('userType') as UserType | null) ?? null;

    // Mock fallback for development
    if (!role) {
      return 'CLIENT'; // or 'CLEANER' if you're working on that flow
    }

    return role;
  }
}
