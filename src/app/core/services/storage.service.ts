import { Injectable } from '@angular/core';
import { AuthResponse } from './models/auth.model';
import { UserType } from './models/user.model';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly AUTH_KEYS = {
    TOKEN: 'token',
    USER_ID: 'userId',
    USER_TYPE: 'userType',
    FIRST_NAME: 'firstName',
    LAST_NAME: 'lastName',
    EMAIL: 'email',
    ADDRESS: 'address',
    PHONE_NUMBER: 'phoneNumber',
  } as const;

  /**
   * Save authentication data to localStorage
   */
  setAuthData(authResponse: AuthResponse): void {
    localStorage.setItem(this.AUTH_KEYS.TOKEN, authResponse.token);
    localStorage.setItem(this.AUTH_KEYS.USER_ID, authResponse.userId);
    localStorage.setItem(this.AUTH_KEYS.USER_TYPE, authResponse.userType);
    localStorage.setItem(this.AUTH_KEYS.FIRST_NAME, authResponse.firstName);
    localStorage.setItem(this.AUTH_KEYS.LAST_NAME, authResponse.lastName);
    localStorage.setItem(this.AUTH_KEYS.EMAIL, authResponse.email);
    localStorage.setItem(this.AUTH_KEYS.ADDRESS, authResponse.address);
    localStorage.setItem(this.AUTH_KEYS.PHONE_NUMBER, authResponse.phoneNumber);
  }

  /**
   * Get authentication data from localStorage
   */
  getAuthData(): AuthResponse | null {
    const token = this.getItem(this.AUTH_KEYS.TOKEN);
    const userId = this.getItem(this.AUTH_KEYS.USER_ID);
    const userType = this.getItem(this.AUTH_KEYS.USER_TYPE) as UserType | null;
    const firstName = this.getItem(this.AUTH_KEYS.FIRST_NAME) ?? '';
    const lastName = this.getItem(this.AUTH_KEYS.LAST_NAME) ?? '';
    const email = this.getItem(this.AUTH_KEYS.EMAIL) ?? '';
    const phoneNumber = this.getItem(this.AUTH_KEYS.PHONE_NUMBER) ?? '';
    const address = this.getItem(this.AUTH_KEYS.ADDRESS) ?? '';

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

  /**
   * Clear all authentication data from localStorage
   */
  clearAuthData(): void {
    Object.values(this.AUTH_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    return this.getItem(this.AUTH_KEYS.TOKEN);
  }

  /**
   * Get user ID
   */
  getUserId(): string | null {
    return this.getItem(this.AUTH_KEYS.USER_ID);
  }

  /**
   * Get user type/role
   */
  getUserType(): UserType | null {
    return this.getItem(this.AUTH_KEYS.USER_TYPE) as UserType | null;
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * Get user's full name
   */
  getUserFullName(): string {
    const firstName = this.getItem(this.AUTH_KEYS.FIRST_NAME) ?? '';
    const lastName = this.getItem(this.AUTH_KEYS.LAST_NAME) ?? '';
    return `${firstName} ${lastName}`.trim();
  }

  /**
   * Private helper method to safely get items from localStorage
   */
  private getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to get item from localStorage: ${key}`, error);
      return null;
    }
  }

  /**
   * Private helper method to safely set items in localStorage
   */
  private setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Failed to set item in localStorage: ${key}`, error);
    }
  }

  /**
   * Get specific user data field
   */
  getUserData(field: keyof typeof this.AUTH_KEYS): string | null {
    return this.getItem(this.AUTH_KEYS[field]);
  }
}
