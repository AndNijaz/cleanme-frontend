export interface Booking {
  rid: string; // UUID from backend
  date: string; // LocalDate from backend
  time: string; // LocalTime from backend
  location: string; // String from backend
  status: string; // ReservationStatus enum from backend
  comment: string; // String from backend
  cleanerName: string; // String from backend
  clientName: string; // String from backend - client's full name
  clientPhone: string; // String from backend - client's phone number
  // Legacy fields for backward compatibility
  id?: string;
  cleanerId?: string;
  message?: string;
  profileImage?: string;
  bookingId?: string;
}

export interface ReservationRequest {
  userId: string;
  cleanerId: string;
  date: string;
  times: string[]; // or a single time range string if that's your model
  location: string;
  comment: string;
  status?: 'PENDING';
}

// Updated to match backend ReservationDto
export interface Reservation {
  rid: string;
  date: string; // Will be LocalDate from backend, converted to string
  time: string; // Will be LocalTime from backend, converted to string
  location: string;
  status: string; // Will be ReservationStatus enum from backend
  comment: string;
  cleanerName: string;
}

// Backend DTOs for reference (to understand the mapping)
export interface BackendReservationDto {
  rid: string;
  date: string; // LocalDate
  time: string; // LocalTime
  location: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  comment: string;
  cleanerName: string;
}
