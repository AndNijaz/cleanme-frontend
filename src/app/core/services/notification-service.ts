import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, catchError, of } from 'rxjs';

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
  userId: string;
}
export interface NotificationDto {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
  userId: string;
}
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly BASE_URL = `${environment['NG_APP_BASE_URL']}/notifications`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }
  getNotifications(userId: string): Observable<Notification[]> {
    const headers = this.getAuthHeaders();
    return this.http
      .get<Notification[]>(`${this.BASE_URL}/${userId}`, { headers })
      .pipe(
        catchError((error) => {
          console.error('Failed to fetch notifications', error);
          return of([]);
        })
      );
  }
  markAsRead(notificationId: string): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http
      .put<void>(`${this.BASE_URL}/${notificationId}`, null, { headers })
      .pipe(
        catchError((error) => {
          console.error('Failed to mark notification as read', error);
          return of();
        })
      );
  }
}
