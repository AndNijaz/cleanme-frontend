import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CleanerInfoService {
  services = [
    { src: 'icon-1.svg', text: 'Deep House Cleaning' },
    { src: 'icon-4.svg', text: 'Office Cleaning' },
    { src: 'icon-2.svg', text: 'Window Cleaning' },
    { src: 'icon-3.svg', text: 'Floor Cleaning' },
  ];

  getServices() {
    return this.services;
  }
}
