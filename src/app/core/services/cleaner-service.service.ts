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
}
