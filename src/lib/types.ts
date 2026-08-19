export type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export type Service = {
  id: string;
  name: string;
  durationMinutes: number;
  priceLkr: number;
  isActive: boolean;
  description?: string;
};

export type Booking = {
  id: string;
  serviceId: string;
  customerName: string;
  customerPhone: string;
  startsAt: string; // ISO
  endsAt: string; // ISO
  status: BookingStatus;
  notes?: string;
  createdAt: string;
};

export type ClosedDay = {
  id: string;
  date: string; // YYYY-MM-DD
  reason?: string;
};

export type DbShape = {
  services: Service[];
  bookings: Booking[];
  closedDays: ClosedDay[];
};
