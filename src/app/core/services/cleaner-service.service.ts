import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

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

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  getCleanerPublicProfile(cleanerId: string): Observable<PublicCleanerProfile> {
    const headers = this.getAuthHeaders();

    return this.http
      .get<any>(`${this.BASE_URL}/${cleanerId}`, { headers })
      .pipe(
        map((cleaner: any) => {
          const profile: PublicCleanerProfile & { id: string } = {
            id: cleaner.id,
            fullName: `${cleaner.firstName} ${cleaner.lastName}`,
            address: this.formatLocation(cleaner),
            bio: Array.isArray(cleaner.bio)
              ? cleaner.bio.join(', ')
              : cleaner.bio || 'No bio available',
            zones: cleaner.zones || [],
            hourlyRate: cleaner.hourlyRate || 0,
            minHours: cleaner.minHours || 1,
            rating: cleaner.averageRating || 0,
            reviewCount: cleaner.reviewCount || 0,
            ratingLabel: this.getRatingLabel(cleaner.averageRating),
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
        catchError((error) => {
          throw error;
        })
      );
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

  getCleaners(): Observable<CleanerCardModel[]> {
    const headers = this.getAuthHeaders();

    return this.http.get<any[]>(`${this.BASE_URL}`, { headers }).pipe(
      map((cleaners: any[]) => {
        return cleaners.map((cleaner) => ({
          id: cleaner.id,
          fullName: `${cleaner.firstName} ${cleaner.lastName}`,
          rating: cleaner.averageRating || 0,
          reviewCount: cleaner.reviewCount || 0,
          location: this.formatLocation(cleaner),
          shortBio: cleaner.bio || 'No bio available',
          services: this.formatServices(cleaner),
          price: cleaner.hourlyRate || 0,
          currency: '$',
          isFavorite: false,
        }));
      }),
      catchError(() => {
        return of([]);
      })
    );
  }

  private formatLocation(cleaner: any): string {
    if (cleaner.address) {
      return cleaner.address;
    }
    return 'Location not available';
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
