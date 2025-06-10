import { Injectable } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface FavouriteDto {
  cleanerId: string;
  cleanerName: string;
}

export interface AddFavouriteRequest {
  clientId: string;
  cleanerId: string;
}

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly BASE_URL = `${environment['NG_APP_BASE_URL']}/favourites`;
  private favoriteIds: Set<string> = new Set(); // Cache for performance

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    });
  }

  private getCurrentUserId(): string {
    // Get current user ID from localStorage (stored by AuthService)
    const userId = localStorage.getItem('userId');
    if (userId && userId !== 'null' && userId !== 'undefined') {
      return userId;
    }

    throw new Error('No current user found. Please log in again.');
  }

  // === GET ===
  getFavorites(): Observable<string[]> {
    try {
      const userId = this.getCurrentUserId();
      const headers = this.getAuthHeaders();

      return this.http
        .get<FavouriteDto[]>(`${this.BASE_URL}/${userId}`, { headers })
        .pipe(
          map((favorites) => favorites.map((fav) => fav.cleanerId)),
          tap((favoriteIds) => {
            // Update local cache
            this.favoriteIds = new Set(favoriteIds);
            console.log('Loaded favorites:', favoriteIds);
          }),
          // Handle errors gracefully
          tap({
            error: (error) => {
              console.error('Error loading favorites:', error);
              // Keep existing cache if API fails
            },
          })
        );
    } catch (error) {
      console.error('Error getting user ID for favorites:', error);
      // Return empty array if user not authenticated
      return new Observable((observer) => {
        observer.next([]);
        observer.complete();
      });
    }
  }

  // === POST ===
  addToFavorites(cleanerId: string): Observable<void> {
    try {
      const clientId = this.getCurrentUserId();
      const headers = this.getAuthHeaders();

      const request: AddFavouriteRequest = {
        clientId,
        cleanerId,
      };

      return this.http.post<void>(this.BASE_URL, request, { headers }).pipe(
        tap(() => {
          this.favoriteIds.add(cleanerId);
          console.log(`Added ${cleanerId} to favorites`);
        }),
        tap({
          error: (error) => {
            console.error(`Error adding ${cleanerId} to favorites:`, error);
          },
        })
      );
    } catch (error) {
      console.error('Error getting user ID for adding favorite:', error);
      return new Observable((observer) => {
        observer.error(new Error('User not authenticated'));
      });
    }
  }

  // === DELETE ===
  removeFromFavorites(cleanerId: string): Observable<void> {
    try {
      const clientId = this.getCurrentUserId();
      const headers = this.getAuthHeaders();

      console.log(
        `Attempting to remove favorite: clientId=${clientId}, cleanerId=${cleanerId}`
      );
      console.log(`DELETE URL: ${this.BASE_URL}/${clientId}/${cleanerId}`);

      return this.http
        .delete<void>(`${this.BASE_URL}/${clientId}/${cleanerId}`, { headers })
        .pipe(
          tap(() => {
            this.favoriteIds.delete(cleanerId);
            console.log(`✅ Successfully removed ${cleanerId} from favorites`);
          }),
          tap({
            error: (error) => {
              console.error(
                `❌ Error removing ${cleanerId} from favorites:`,
                error
              );
              console.error(
                'Full error details:',
                JSON.stringify(error, null, 2)
              );
            },
          })
        );
    } catch (error) {
      console.error('Error getting user ID for removing favorite:', error);
      return new Observable((observer) => {
        observer.error(new Error('User not authenticated'));
      });
    }
  }

  // === UTILITY ===
  isFavorite(cleanerId: string): boolean {
    return this.favoriteIds.has(cleanerId);
  }
}
