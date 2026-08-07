import { getSupabaseAdmin } from "./supabase";
import type { Booking, ClosedDay, Service } from "./types";

/** DB row shapes (snake_case) → app types (camelCase) */

type ServiceRow = {
  id: string;
  name: string;
  duration_minutes: number;
  price_lkr: number;
  is_active: boolean;
  description: string | null;
};

type BookingRow = {
  id: string;
  service_id: string;
  customer_name: string;
  customer_phone: string;
  starts_at: string;
  ends_at: string;
  status: Booking["status"];
  notes: string | null;
  created_at: string;
};

type ClosedDayRow = {
  id: string;
  date: string;
  reason: string | null;
};

function mapService(row: ServiceRow): Service {
  return {
    id: row.id,
    name: row.name,
    durationMinutes: row.duration_minutes,
    priceLkr: row.price_lkr,
    isActive: row.is_active,
    description: row.description ?? undefined,
  };
}

function mapBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    serviceId: row.service_id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: row.status,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}

function mapClosedDay(row: ClosedDayRow): ClosedDay {
  return {
    id: row.id,
    date: row.date,
    reason: row.reason ?? undefined,
  };
}

function id(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function listServices(activeOnly = false) {
  const sb = getSupabaseAdmin();
  let query = sb.from("services").select("*").order("name");
  if (activeOnly) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as ServiceRow[]).map(mapService);
}

export async function getService(serviceId: string) {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("services")
    .select("*")
    .eq("id", serviceId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapService(data as ServiceRow) : null;
}

export async function upsertService(input: Omit<Service, "id"> & { id?: string }) {
  const sb = getSupabaseAdmin();
  const row = {
    id: input.id ?? id("svc"),
    name: input.name,
    duration_minutes: input.durationMinutes,
    price_lkr: input.priceLkr,
    is_active: input.isActive,
    description: input.description ?? null,
  };

  const { error } = await sb.from("services").upsert(row);
  if (error) throw new Error(error.message);
  return listServices(false);
}

export async function listBookings() {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("bookings")
    .select("*")
    .order("starts_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as BookingRow[]).map(mapBooking);
}

export async function createBooking(
  input: Omit<Booking, "id" | "createdAt" | "status"> & { status?: Booking["status"] },
) {
  const sb = getSupabaseAdmin();
  const row = {
    id: id("bk"),
    service_id: input.serviceId,
    customer_name: input.customerName,
    customer_phone: input.customerPhone,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    status: input.status ?? "pending",
    notes: input.notes ?? null,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await sb.from("bookings").insert(row).select("*").single();
  if (error) throw new Error(error.message);
  return mapBooking(data as BookingRow);
}

export async function updateBooking(
  bookingId: string,
  patch: Partial<Pick<Booking, "status" | "startsAt" | "endsAt" | "serviceId" | "notes">>,
) {
  const sb = getSupabaseAdmin();
  const row: Record<string, unknown> = {};
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.startsAt !== undefined) row.starts_at = patch.startsAt;
  if (patch.endsAt !== undefined) row.ends_at = patch.endsAt;
  if (patch.serviceId !== undefined) row.service_id = patch.serviceId;
  if (patch.notes !== undefined) row.notes = patch.notes;

  const { data, error } = await sb
    .from("bookings")
    .update(row)
    .eq("id", bookingId)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return mapBooking(data as BookingRow);
}

export async function listClosedDays() {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("closed_days")
    .select("*")
    .order("date", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as ClosedDayRow[]).map(mapClosedDay);
}

export async function addClosedDay(date: string, reason?: string) {
  const sb = getSupabaseAdmin();
  const row = { id: id("cd"), date, reason: reason ?? null };
  const { data, error } = await sb.from("closed_days").insert(row).select("*").single();
  if (error) {
    if (error.code === "23505") throw new Error("That day is already closed");
    throw new Error(error.message);
  }
  return mapClosedDay(data as ClosedDayRow);
}

export async function removeClosedDay(closedDayId: string) {
  const sb = getSupabaseAdmin();
  const { error } = await sb.from("closed_days").delete().eq("id", closedDayId);
  if (error) throw new Error(error.message);
}
