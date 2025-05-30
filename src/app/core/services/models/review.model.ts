export interface Review {
  id: string;
  cleanerId: string;
  bookingId: string; // <-- NEW
  cleanerName: string;
  profileImage?: string;
  rating: number;
  message: string;
  date: string;
  comment?: string;
}

export interface BookingWithReview {
  bookingId: string;
  date: string;
  time: string;
  location: string;
  comment: string;
  cleanerName: string;
  cleanerId: string;
  review?: Review;
}

export interface ReviewDto {
  reviewId?: string;
  rating: number;
  message: string;
}

export interface CleanerCardModel {
  id: string;
  fullName: string;
  rating?: number;
  reviewCount?: number;
  location?: string;
  shortBio?: string;
  services?: string[];
  price?: number;
  currency?: string;
  imageUrl?: string;
  isFavorite?: boolean;
}
