import type { BookingStatus } from "./types";

const CONTROL_CHARS = /[\u0000-\u001F\u007F]/g;

/** Strip control chars and cap length (ORM still used for DB — this is defense in depth). */
export function sanitizeText(input: unknown, maxLen: number): string {
  return String(input ?? "")
    .replace(CONTROL_CHARS, "")
    .trim()
    .slice(0, maxLen);
}

export function isValidPhone(phone: string): boolean {
  return /^[0-9+\s\-()]{7,20}$/.test(phone);
}

export function isValidServiceId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{2,64}$/.test(id);
}

export function isValidBookingId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{2,80}$/.test(id);
}

export function isValidIsoDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

const ALLOWED_STATUS = new Set<BookingStatus>([
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
]);

export function parseBookingStatus(input: unknown): BookingStatus | null {
  const s = String(input ?? "");
  return ALLOWED_STATUS.has(s as BookingStatus) ? (s as BookingStatus) : null;
}

export function parsePositiveInt(input: unknown, max: number): number | null {
  const n = Number(input);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1 || n > max) return null;
  return n;
}
