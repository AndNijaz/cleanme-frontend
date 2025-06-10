export interface ServiceType {
  id: string;
  name: string;
  icon: string;
  emoji: string;
  description: string;
  shortDescription: string;
}

export const PREDEFINED_SERVICES: ServiceType[] = [
  {
    id: 'deep-house-cleaning',
    name: 'Deep House Cleaning',
    icon: 'icon-1.svg',
    emoji: '🧹',
    description:
      'Comprehensive deep cleaning service including all rooms, dusting, vacuuming, mopping, kitchen deep clean, bathroom sanitization, and thorough window cleaning',
    shortDescription: 'Complete deep cleaning of all rooms and surfaces',
  },
  {
    id: 'office-cleaning',
    name: 'Office Cleaning',
    icon: 'icon-4.svg',
    emoji: '🏢',
    description:
      'Professional office cleaning including workspace sanitization, trash removal, floor cleaning, desk organization, and common area maintenance',
    shortDescription: 'Professional workspace cleaning and sanitization',
  },
  {
    id: 'window-cleaning',
    name: 'Window Cleaning',
    icon: 'icon-2.svg',
    emoji: '🪟',
    description:
      'Professional window cleaning service for interior and exterior windows, including frames, sills, and glass surfaces for crystal clear results',
    shortDescription: 'Interior and exterior window cleaning service',
  },
  {
    id: 'floor-cleaning',
    name: 'Floor Cleaning',
    icon: 'icon-3.svg',
    emoji: '🧽',
    description:
      'Specialized floor cleaning service for all floor types including hardwood, tile, carpet, and laminate with appropriate cleaning methods and products',
    shortDescription: 'Specialized cleaning for all floor types',
  },
];
