import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cleaner-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cleaner-dashboard.component.html',
})
export class CleanerDashboardComponent {
  appointments = [
    {
      clientName: 'Amer Hadzikadic',
      date: '21.3.2023',
      timeRange: '17:00 to 21:00',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris lacus neque, mattis ut dictum ut, convallis eget mauris. Nullam placerat lorem sed est consectetur.',
    },
    {
      clientName: 'Amer Hadzikadic',
      date: '21.3.2023',
      timeRange: '17:00 to 21:00',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris lacus neque, mattis ut dictum ut, convallis eget mauris. Nullam placerat lorem sed est consectetur.',
    },
    {
      clientName: 'Amer Hadzikadic',
      date: '21.3.2023',
      timeRange: '17:00 to 21:00',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris lacus neque, mattis ut dictum ut, convallis eget mauris. Nullam placerat lorem sed est consectetur.',
    },
  ];
}
