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
    // Get the token from local storage
    const token = localStorage.getItem('token'); // or whatever key you use to store the token
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
          // Get base profile data
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

          // Format services from servicesOffered string
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
          console.error(
            `❌ Error fetching cleaner profile for ID ${cleanerId}:`,
            error
          );
          console.error(
            "Backend probably doesn't have cleaner_details for this ID"
          );

          // Instead of returning wrong profile, throw the error
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
  // New helper function for service descriptions
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

  // Helper function to get appropriate icon for service
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
        // Transform each cleaner from backend format to CleanerCardModel
        return cleaners.map((cleaner) => ({
          id: cleaner.id,
          fullName: `${cleaner.firstName} ${cleaner.lastName}`,
          rating: cleaner.averageRating || 0, // Default to 0 if no rating
          reviewCount: cleaner.reviewCount || 0,
          location: this.formatLocation(cleaner), // Helper function to format location
          shortBio: cleaner.bio || 'No bio available',
          services: this.formatServices(cleaner), // Helper function to format services
          price: cleaner.hourlyRate || 0, // Assuming hourlyRate is the price
          currency: '$', // Default currency
          isFavorite: false, // Default to not favorite
        }));
      }),

      catchError((error) => {
        console.error('Error fetching cleaners:', error);
        // Return empty array instead of mock data
        return of([]);
      })
    );
  }

  // Helper function to format location
  private formatLocation(cleaner: any): string {
    if (cleaner.address) {
      return cleaner.address;
    }
    if (cleaner.zones && cleaner.zones.length > 0) {
      return cleaner.zones.join(', ');
    }
    return 'Location not specified';
  }

  // Helper function to format services
  private formatServices(cleaner: any): string[] {
    if (cleaner.services && cleaner.services.length > 0) {
      return cleaner.services.map((service: any) => service.name);
    }
    return ['Standard Cleaning']; // Default service
  }

  getCleanerCardById(id: string): Observable<CleanerCardModel | null> {
    return this.getCleaners().pipe(
      // map is from rxjs/operators
      map((cleaners) => cleaners.find((c) => c.id === id) ?? null)
    );
  }
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly BASE_URL = `${environment['NG_APP_BASE_URL']}/user`;

  constructor(private http: HttpClient) {}

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.BASE_URL}/me`);
  }

  updateCurrentUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.BASE_URL}/me`, user);
  }
}
