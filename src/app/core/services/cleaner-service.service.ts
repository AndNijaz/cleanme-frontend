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

@Injectable({ providedIn: 'root' })
export class CleanerService {
  private readonly BASE_URL = `${environment.url}/cleaners`;

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
          const profile: PublicCleanerProfile = {
            fullName: `${cleaner.firstName} ${cleaner.lastName}`,
            address: this.formatLocation(cleaner),
            bio: cleaner.bio || 'No bio available',
            zones: cleaner.zones || [],
            hourlyRate: cleaner.hourlyRate || 0,
            minHours: cleaner.minHours || 1,
            rating: cleaner.averageRating || 0,
            reviewCount: cleaner.reviewCount || 0,
            ratingLabel: this.getRatingLabel(cleaner.averageRating),
            services: cleaner.services_offered,
          };
          console.log(cleaner.services_offered);
          // Format services with specific descriptions based on service names
          if (typeof cleaner.services === 'string') {
            profile.services = this.formatDetailedServicesWithDescriptions(
              cleaner.services
            );
          } else if (Array.isArray(cleaner.services)) {
            profile.services = this.formatDetailedServicesWithDescriptions(
              cleaner.services.map((s: any) => s.name).join(', ')
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
          console.error('Error fetching cleaner profile:', error);
          // Return mock data as fallback
          const mockProfiles: { [key: string]: PublicCleanerProfile } = {
            '1': {
              fullName: 'Bahra Zedic',
              address: 'Bojnik, Otes, Bjelave, Dobrinja',
              bio: 'Pedantna, pouzdana i brza – čišćenje mi nije posao, nego zadovoljstvo. Imam više od 4 godine iskustva.',
              zones: ['Bojnik', 'Otes', 'Dobrinja'],
              hourlyRate: 15,
              minHours: 2,
              rating: 4.8,
              reviewCount: 128,
              ratingLabel: 'excellent',
              services: [
                {
                  icon: '🏡',
                  name: 'Deep Cleaning',
                  description:
                    'Temeljito čišćenje svih površina u stanu, uključujući kuhinju, kupatilo i podove.',
                },
                {
                  icon: '🪟',
                  name: 'Window Washing',
                  description:
                    'Čišćenje svih unutrašnjih i vanjskih prozora s profesionalnim sredstvima.',
                },
              ],
            },
            '2': {
              fullName: 'Azra Mustafić',
              address: 'Ilidža, Grbavica',
              bio: 'Pouzdana i tačna. Čistim stanove i poslovne prostore. Profesionalan pristup svakom klijentu.',
              zones: ['Ilidža', 'Grbavica'],
              hourlyRate: 17,
              minHours: 3,
              rating: 4.6,
              reviewCount: 95,
              ratingLabel: 'very good',
              services: [
                {
                  icon: '🧼',
                  name: 'Floor Cleaning',
                  description: 'Usisavanje, pranje i poliranje svih podova.',
                },
                {
                  icon: '🏢',
                  name: 'Office Cleaning',
                  description:
                    'Profesionalno čišćenje radnih prostora i tehničke opreme.',
                },
              ],
            },
            '3': {
              fullName: 'Emira Hodžić',
              address: 'Stup, Hrasno, Grbavica',
              bio: 'Iskustvo od 5 godina. Koristim ekološka sredstva. Fokus na detalje i kvalitetnu uslugu.',
              zones: ['Stup', 'Hrasno', 'Grbavica'],
              hourlyRate: 18,
              minHours: 2,
              rating: 4.9,
              reviewCount: 140,
              ratingLabel: 'outstanding',
              services: [
                {
                  icon: '🧽',
                  name: 'Bathroom Deep Clean',
                  description:
                    'Dezinfekcija, uklanjanje kamenca i čišćenje fuga.',
                },
                {
                  icon: '🪑',
                  name: 'Furniture Cleaning',
                  description: 'Čišćenje tapaciranog i drvenog namještaja.',
                },
              ],
            },
          };
          return of(mockProfiles[cleanerId] || mockProfiles['1']);
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
        // Return mock data as fallback
        return of([
          {
            id: '1',
            fullName: 'Bahra Zedic',
            rating: 4.8,
            reviewCount: 128,
            location: 'Bojnik, Otes, Bjelave, Dobrinja',
            shortBio: 'Lorem Ipsum Dolor Sit Amet Latinski jezik Jak Bas',
            services: ['Deep Cleaning', 'Window Washing'],
            price: 100,
            currency: '$',
          },
          {
            id: '2',
            fullName: 'Azra Mustafić',
            rating: 4.6,
            reviewCount: 95,
            location: 'Ilidža, Grbavica',
            shortBio: 'Pouzdana i tačna. Čistim stanove i poslovne prostore.',
            services: ['Floor Cleaning', 'Deep Cleaning'],
            price: 85,
            currency: '$',
          },
          {
            id: '3',
            fullName: 'Emira Hodžić',
            rating: 4.9,
            reviewCount: 140,
            location: 'Stup, Hrasno, Grbavica',
            shortBio: 'Iskustvo od 5 godina. Koristim ekološka sredstva.',
            services: ['Office Cleaning', 'Window Washing'],
            price: 95,
            currency: '$',
          },
        ]);
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
