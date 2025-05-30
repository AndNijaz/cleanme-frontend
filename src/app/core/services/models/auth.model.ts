import { UserType } from './user.model';

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
