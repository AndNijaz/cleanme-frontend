import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of } from 'rxjs';

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
  private readonly BASE_URL = 'http://localhost:8080/cleaner';

  constructor(private http: HttpClient) {}

  getCleanerPublicProfile(cleanerId: string): Observable<PublicCleanerProfile> {
    // 🔁 Uncomment this line when backend is ready:
    // return this.http.get<PublicCleanerProfile>(`${this.BASE_URL}/${cleanerId}/public`);

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
    // TODO: Replace with real API call
    // return this.http.get<CleanerCardModel[]>('http://localhost:8080/api/cleaners');

    // MOCK data (temporary)
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
  }

  getCleanerCardById(id: string): Observable<CleanerCardModel | null> {
    return this.getCleaners().pipe(
      // map is from rxjs/operators
      map((cleaners) => cleaners.find((c) => c.id === id) ?? null)
    );
  }
}
