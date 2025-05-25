import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private favoriteIds: Set<string> = new Set(); // local mock for now

  // === GET ===
  getFavorites(): Observable<string[]> {
    // TODO: Replace with real backend GET
    // return this.http.get<string[]>('/api/users/me/favorites');

    return of(Array.from(this.favoriteIds));
  }

  // === POST ===
  addToFavorites(cleanerId: string): Observable<void> {
    // TODO: POST to backend
    // return this.http.post<void>(`/api/users/me/favorites/${cleanerId}`, {});

    this.favoriteIds.add(cleanerId);
    return of(void 0);
  }

  // === DELETE ===
  removeFromFavorites(cleanerId: string): Observable<void> {
    // TODO: DELETE from backend
    // return this.http.delete<void>(`/api/users/me/favorites/${cleanerId}`);

    this.favoriteIds.delete(cleanerId);
    return of(void 0);
  }
}
