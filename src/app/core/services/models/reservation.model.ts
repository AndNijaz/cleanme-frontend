export interface Booking {
  id: string;
  cleanerId: string;
  cleanerName: string;
  date: string;
  time: string;
  message: string;
  profileImage?: string;
  bookingId?: string;
}

export interface ReservationRequest {
  userId: string;
  cleanerId: string;
  date: string;
  times: string[]; // or a single time range string if that’s your model
  location: string;
  comment: string;
  status?: 'PENDING';
}

export interface Reservation {
  id: string;
  userId: string;
  cleanerId: string;
  cleanerName: string;
  date: string;
  times: string[];
  location: string;
  comment: string;
}
