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
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly BASE_URL = `${environment['NG_APP_BASE_URL']}/auth`;

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {}

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
    const headers = this.getAuthHeaders();
    return this.http.post<void>(`${this.BASE_URL}/cleaner-setup`, data, {
      headers,
    });
  }

  // === CLEANER UPDATE ===
  updateCleaner(cleanerId: string, data: any): Observable<void> {
    const headers = this.getAuthHeaders();
    const baseUrl = environment['NG_APP_BASE_URL'];
    return this.http.put<void>(`${baseUrl}/cleaners/${cleanerId}`, data, {
      headers,
    });
  }

  // === PRIVATE HELPER ===
  private getAuthHeaders(): HttpHeaders {
    const token = this.storageService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  // === AUTH STORAGE ===
  saveAuthData(res: AuthResponse): void {
    this.storageService.setAuthData(res);
  }

  getAuthData(): AuthResponse | null {
    return this.storageService.getAuthData();
  }

  clearAuthData(): void {
    this.storageService.clearAuthData();
  }

  isLoggedIn(): boolean {
    return this.storageService.isLoggedIn();
  }

  getUserRole(): 'CLEANER' | 'CLIENT' | null {
    return this.storageService.getUserType();
  }
}
