import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable, of, shareReplay, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';

export interface PublicCleanerProfile {
  fullName: string;
  address: string;
  bio: string;
  zones: string[];
  hourlyRate: number;
  minHours: number;
  rating: number;
  reviewCount: number;
  ratingLabel: string;
  availability?: { [day: string]: { from: string; to: string } }[];
  services: {
    icon: string;
    name: string;
    description: string;
  }[];
}

// This is your card model
export interface CleanerCardModel {
  id: string;
  fullName: string;
  rating: number;
  reviewCount: number;
  location: string;
  shortBio: string;
  services: string[];
  price: number;
  currency: string;
  isFavorite?: boolean;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  // ... any other fields
}

@Injectable({ providedIn: 'root' })
export class CleanerService {
  private readonly BASE_URL = `${environment['NG_APP_BASE_URL']}/cleaners`;

  // OPTIMIZATION: Add caching for frequently accessed data
  private cleanersCache$: Observable<CleanerCardModel[]> | null = null;
  private cleanerProfileCache = new Map<
    string,
    Observable<PublicCleanerProfile>
  >();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.storageService.getToken();
    console.log(
      '🔑 Using token for cleaner service:',
      token ? 'Token present' : 'No token'
    );
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  // OPTIMIZED: Cache cleaner profile requests
  getCleanerPublicProfile(cleanerId: string): Observable<PublicCleanerProfile> {
    // Check cache first
    if (this.cleanerProfileCache.has(cleanerId)) {
      console.log('🚀 Returning cached cleaner profile for:', cleanerId);
      return this.cleanerProfileCache.get(cleanerId)!;
    }

    const headers = this.getAuthHeaders();
    console.log('🌐 Fetching cleaner profile from API for:', cleanerId);

    const request$ = this.http
      .get<any>(`${this.BASE_URL}/${cleanerId}`, { headers })
      .pipe(
        map((cleaner: any) => {
          console.log('🔍 Raw backend cleaner data:', cleaner);

          const profile: PublicCleanerProfile & { id: string } = {
            id: cleaner.id,
            fullName: `${cleaner.firstName} ${cleaner.lastName}`,
            address: cleaner.email || 'Email not available',
            bio: Array.isArray(cleaner.bio)
              ? cleaner.bio.join(', ')
              : cleaner.bio || 'No bio available',
            zones: [],
            hourlyRate: cleaner.hourlyRate || 0,
            minHours: 1,
            rating: 0,
            reviewCount: 0,
            ratingLabel: this.getRatingLabel(0),
            availability: cleaner.availability || [],
            services: [],
          };

          if (
            cleaner.servicesOffered &&
            typeof cleaner.servicesOffered === 'string'
          ) {
            profile.services = this.formatDetailedServicesWithDescriptions(
              cleaner.servicesOffered
            );
          } else {
            profile.services = [
              {
                icon: '🧹',
                name: 'Standard Cleaning',
                description:
                  'Basic cleaning service including dusting and vacuuming',
              },
            ];
          }

          return profile;
        }),
        shareReplay({ bufferSize: 1, refCount: true }), // Cache the result
        catchError((error) => {
          this.cleanerProfileCache.delete(cleanerId); // Remove from cache on error
          throw error;
        })
      );

    // Cache the request
    this.cleanerProfileCache.set(cleanerId, request$);

    // Auto-expire cache after 5 minutes
    setTimeout(() => {
      this.cleanerProfileCache.delete(cleanerId);
    }, this.cacheExpiry);

    return request$;
  }

  // OPTIMIZED: Cache cleaners list
  getCleaners(): Observable<CleanerCardModel[]> {
    // Return cached data if available
    if (this.cleanersCache$) {
      console.log('🚀 Returning cached cleaners list');
      return this.cleanersCache$;
    }

    console.log('🌐 Fetching cleaners list from API');
    const headers = this.getAuthHeaders();

    this.cleanersCache$ = this.http
      .get<any[]>(`${this.BASE_URL}`, { headers })
      .pipe(
        map((cleaners: any[]) => {
          console.log('🔍 Raw backend cleaners data:', cleaners);
          return cleaners.map((cleaner) => ({
            id: cleaner.id,
            fullName: `${cleaner.firstName} ${cleaner.lastName}`,
            rating: 0,
            reviewCount: 0,
            location: cleaner.email || 'Email not available',
            shortBio: Array.isArray(cleaner.bio)
              ? cleaner.bio.join(', ')
              : cleaner.bio || 'No bio available',
            services: this.formatServices(cleaner),
            price: cleaner.hourlyRate || 0,
            currency: '$',
            isFavorite: false,
          }));
        }),
        shareReplay({ bufferSize: 1, refCount: true }), // Cache the result
        catchError(() => {
          this.clearCleanersCache(); // Clear cache on error
          return of([]);
        })
      );

    // Auto-expire cache after 5 minutes
    setTimeout(() => {
      this.clearCleanersCache();
    }, this.cacheExpiry);

    return this.cleanersCache$;
  }

  // OPTIMIZATION: Add cache clearing methods
  clearCleanersCache(): void {
    this.cleanersCache$ = null;
    console.log('🗑️ Cleaners cache cleared');
  }

  clearCleanerProfileCache(cleanerId?: string): void {
    if (cleanerId) {
      this.cleanerProfileCache.delete(cleanerId);
      console.log(`🗑️ Cleaner profile cache cleared for: ${cleanerId}`);
    } else {
      this.cleanerProfileCache.clear();
      console.log('🗑️ All cleaner profile caches cleared');
    }
  }

  // OPTIMIZATION: Prefetch data for better performance
  prefetchCleanerProfiles(cleanerIds: string[]): void {
    cleanerIds.forEach((id) => {
      if (!this.cleanerProfileCache.has(id)) {
        this.getCleanerPublicProfile(id).subscribe(); // Trigger prefetch
      }
    });
  }

  private getRatingLabel(rating: number): string {
    if (!rating) return 'no ratings';
    if (rating >= 4.8) return 'outstanding';
    if (rating >= 4.5) return 'excellent';
    if (rating >= 4.0) return 'very good';
    if (rating >= 3.0) return 'good';
    return 'average';
  }

  private formatDetailedServicesWithDescriptions(
    servicesString: string
  ): { icon: string; name: string; description: string }[] {
    const serviceDescriptions: { [key: string]: string } = {
      'Deep Cleaning':
        'Temeljito čišćenje svih površina u stanu, uključujući kuhinju, kupatilo i podove.',
      'Window Washing':
        'Čišćenje svih unutrašnjih i vanjskih prozora s profesionalnim sredstvima.',
      'Floor Cleaning': 'Usisavanje, pranje i poliranje svih podova.',
      'Office Cleaning':
        'Profesionalno čišćenje radnih prostora i tehničke opreme.',
      'Bathroom Deep Clean':
        'Dezinfekcija, uklanjanje kamenca i čišćenje fuga.',
      'Furniture Cleaning': 'Čišćenje tapaciranog i drvenog namještaja.',
    };

    return servicesString.split(',').map((serviceName) => {
      const trimmedName = serviceName.trim();
      return {
        icon: this.getServiceIcon(trimmedName),
        name: trimmedName,
        description:
          serviceDescriptions[trimmedName] || `${trimmedName} service`,
      };
    });
  }

  private getServiceIcon(serviceName: string): string {
    const iconMap: { [key: string]: string } = {
      'Deep Cleaning': '🧼',
      'Window Washing': '🪟',
      'Floor Cleaning': '🧹',
      'Office Cleaning': '🏢',
      'Bathroom Clean': '🚽',
      'Kitchen Cleaning': '🍳',
    };
    return iconMap[serviceName] || '🧹';
  }

  private formatLocation(cleaner: any): string {
    // Backend doesn't return address field, use email as fallback
    if (cleaner.email) {
      return cleaner.email;
    }
    return 'Contact information not available';
  }

  private formatServices(cleaner: any): string[] {
    if (
      cleaner.servicesOffered &&
      typeof cleaner.servicesOffered === 'string'
    ) {
      return cleaner.servicesOffered.split(',').map((s: string) => s.trim());
    }
    return ['Standard Cleaning'];
  }

  getCleanerCardById(id: string): Observable<CleanerCardModel | null> {
    return this.getCleaners().pipe(
      map((cleaners) => cleaners.find((cleaner) => cleaner.id === id) || null)
    );
  }
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly BASE_URL = `${environment['NG_APP_BASE_URL']}/user`;

  constructor(private http: HttpClient) {}

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.BASE_URL}/profile`);
  }

  updateCurrentUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.BASE_URL}/profile`, user);
  }
}
