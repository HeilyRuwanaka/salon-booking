import { salon } from "./salon.config";
import type { Booking, ClosedDay, Service } from "./types";

/** Format a Date as YYYY-MM-DD in Asia/Colombo */
export function toDateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: salon.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Build a Date for a Colombo calendar day + hour:minute (hour 24 = next midnight) */
export function colomboDateTime(dateKey: string, hour: number, minute: number): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  if (hour >= 24) {
    const next = new Date(Date.UTC(y, m - 1, d + 1));
    const key = `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}-${String(next.getUTCDate()).padStart(2, "0")}`;
    return new Date(`${key}T00:00:00+05:30`);
  }
  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");
  return new Date(`${dateKey}T${hh}:${mm}:00+05:30`);
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

export function isClosed(dateKey: string, closedDays: ClosedDay[]) {
  return closedDays.some((d) => d.date === dateKey);
}

/**
 * Generate free start times for a service on a given day.
 * Open window: salon.openHour → midnight.
 */
export function getAvailableSlots(options: {
  dateKey: string;
  service: Service;
  bookings: Booking[];
  closedDays: ClosedDay[];
  now?: Date;
}): string[] {
  const { dateKey, service, bookings, closedDays, now = new Date() } = options;

  if (isClosed(dateKey, closedDays)) return [];

  const dayStart = colomboDateTime(dateKey, salon.openHour, salon.openMinute);
  const hardEnd = colomboDateTime(dateKey, salon.closeHour, 0);

  const activeBookings = bookings.filter(
    (b) => b.status === "pending" || b.status === "confirmed",
  );

  const slots: string[] = [];
  const stepMs = 15 * 60 * 1000;
  const durationMs = service.durationMinutes * 60 * 1000;

  for (
    let t = dayStart.getTime();
    t + durationMs <= hardEnd.getTime();
    t += stepMs
  ) {
    const start = t;
    const end = t + durationMs;
    if (start < now.getTime() + 15 * 60 * 1000) continue;

    const conflict = activeBookings.some((b) =>
      overlaps(start, end, new Date(b.startsAt).getTime(), new Date(b.endsAt).getTime()),
    );
    if (conflict) continue;

    slots.push(new Date(start).toISOString());
  }

  return slots;
}

export function formatSlotLabel(iso: string) {
  return new Intl.DateTimeFormat("en-LK", {
    timeZone: salon.timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

export function formatBookingWhen(iso: string) {
  return new Intl.DateTimeFormat("en-LK", {
    timeZone: salon.timezone,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}
