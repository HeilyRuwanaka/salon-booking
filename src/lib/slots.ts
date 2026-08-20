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

export type SlotStatus = "available" | "past" | "busy";

export type DaySlot = {
  startsAt: string;
  endsAt: string;
  status: SlotStatus;
};

/**
 * Full day timeline for one service.
 * - Starts every 15 min from open → last start that still ends by close
 * - Duration comes from the selected service (30 min → 11:00–11:30, 45 → 11:00–11:45)
 * - Overlaps with pending/confirmed bookings → busy (faded)
 * - Too little gap before next booking → busy (not offered as free)
 * - Already passed today → past (faded)
 */
export function getDaySlots(options: {
  dateKey: string;
  service: Service;
  bookings: Booking[];
  closedDays: ClosedDay[];
  now?: Date;
}): DaySlot[] {
  const { dateKey, service, bookings, closedDays, now = new Date() } = options;

  if (isClosed(dateKey, closedDays)) return [];

  const dayStart = colomboDateTime(dateKey, salon.openHour, salon.openMinute);
  const hardEnd = colomboDateTime(dateKey, salon.closeHour, 0);
  const stepMs = 15 * 60 * 1000;
  const durationMs = service.durationMinutes * 60 * 1000;
  const leadMs = 15 * 60 * 1000;

  const activeBookings = bookings.filter(
    (b) => b.status === "pending" || b.status === "confirmed",
  );

  const slots: DaySlot[] = [];

  for (
    let t = dayStart.getTime();
    t + durationMs <= hardEnd.getTime();
    t += stepMs
  ) {
    const start = t;
    const end = t + durationMs;
    const startsAt = new Date(start).toISOString();
    const endsAt = new Date(end).toISOString();

    if (start < now.getTime() + leadMs) {
      slots.push({ startsAt, endsAt, status: "past" });
      continue;
    }

    const conflict = activeBookings.some((b) =>
      overlaps(start, end, new Date(b.startsAt).getTime(), new Date(b.endsAt).getTime()),
    );

    slots.push({
      startsAt,
      endsAt,
      status: conflict ? "busy" : "available",
    });
  }

  return slots;
}

/** Free starts only (API booking checks + admin walk-in) */
export function getAvailableSlots(options: {
  dateKey: string;
  service: Service;
  bookings: Booking[];
  closedDays: ClosedDay[];
  now?: Date;
}): string[] {
  return getDaySlots(options)
    .filter((s) => s.status === "available")
    .map((s) => s.startsAt);
}

export function formatSlotLabel(iso: string) {
  return new Intl.DateTimeFormat("en-LK", {
    timeZone: salon.timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

export function formatSlotRange(startsAt: string, endsAt: string) {
  return `${formatSlotLabel(startsAt)} – ${formatSlotLabel(endsAt)}`;
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
