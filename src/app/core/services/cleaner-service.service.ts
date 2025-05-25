import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

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
    // 🔁 Replace mock with real request:
    // return this.http.get<PublicCleanerProfile>(`${this.BASE_URL}/${cleanerId}/public`);

    // 🧪 Mocked for now
    return of({
      fullName: 'Ime Prezime',
      address: 'Sarajevo 123',
      bio: 'Pedantna, pouzdana i brza – čišćenje mi nije posao, nego zadovoljstvo. Imam više od 4 godine iskustva u održavanju stanova i poslovnih prostora. 4 godine iskustva u održavanju stanova',
      zones: ['Novo Sarajevo', 'Centar', 'Stari Grad'],
      hourlyRate: 15,
      minHours: 2,
      rating: 4.3,
      reviewCount: 20,
      ratingLabel: 'outstanding',
      services: [
        {
          icon: '🏡',
          name: 'Deep House Cleaning',
          description:
            'Temeljito čišćenje svih površina: Uključuje brisanje i dezinfekciju podova, zidova, prozora...',
        },
        {
          icon: '🧼',
          name: 'Floor Cleaning',
          description:
            'Uključuje usisavanje, pranje i sušenje svih vrsta podova, uz korištenje profesionalnih sredstava.',
        },
        {
          icon: '🏢',
          name: 'Office Cleaning',
          description:
            'Profesionalno čišćenje poslovnih prostora, radnih stolova, tehnike i zajedničkih prostorija.',
        },
        {
          icon: '🪟',
          name: 'Window Cleaning',
          description:
            'Pranje staklenih površina unutra i izvana, uključujući visoke prozore uz sigurnosnu opremu.',
        },
      ],
    });
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
}
