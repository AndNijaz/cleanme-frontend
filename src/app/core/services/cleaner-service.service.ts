import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { map } from 'rxjs/operators';
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
  private readonly BASE_URL = 'http://localhost:8080/cleaners';

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

    // 🔁 Uncomment this line when backend is ready:
    /* return this.http.get<PublicCleanerProfile>(
      `${this.BASE_URL}/${cleanerId}/public`
    );*/

    // 🧪 Mocked profiles (based on ID)
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
            description: 'Dezinfekcija, uklanjanje kamenca i čišćenje fuga.',
          },
          {
            icon: '🪑',
            name: 'Furniture Cleaning',
            description: 'Čišćenje tapaciranog i drvenog namještaja.',
          },
        ],
      },
    };

    // Return mock profile based on ID
    return of(mockProfiles[cleanerId] || mockProfiles['1']);
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
}
