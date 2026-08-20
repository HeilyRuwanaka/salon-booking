import { NextResponse } from "next/server";
import { isAdminLoggedIn } from "@/lib/auth";
import {
  createBooking,
  getService,
  listBookings,
  listClosedDays,
  updateBooking,
} from "@/lib/store";
import { getAvailableSlots } from "@/lib/slots";
import {
  isValidBookingId,
  isValidPhone,
  isValidServiceId,
  parseBookingStatus,
  sanitizeText,
} from "@/lib/validate";

export async function GET() {
  const ok = await isAdminLoggedIn();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await listBookings());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const serviceId = sanitizeText(body.serviceId, 64);
  const customerName = sanitizeText(body.customerName, 80);
  const customerPhone = sanitizeText(body.customerPhone, 20);
  const startsAt = sanitizeText(body.startsAt, 40);
  const notesRaw = body.notes != null ? sanitizeText(body.notes, 500) : undefined;
  const notes = notesRaw || undefined;
  const walkIn = body.walkIn === true;
  const admin = await isAdminLoggedIn();

  if (walkIn && !admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!serviceId || !customerName || !customerPhone || !startsAt) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (!isValidServiceId(serviceId) || !isValidPhone(customerPhone)) {
    return NextResponse.json({ error: "Invalid name or phone" }, { status: 400 });
  }
  if (customerName.length < 2) {
    return NextResponse.json({ error: "Name is too short" }, { status: 400 });
  }

  const service = await getService(serviceId);
  if (!service || (!service.isActive && !walkIn)) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  const start = new Date(startsAt);
  if (Number.isNaN(start.getTime())) {
    return NextResponse.json({ error: "Invalid time" }, { status: 400 });
  }

  const dateKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(start);

  const [bookings, closedDays] = await Promise.all([listBookings(), listClosedDays()]);

  if (!walkIn) {
    const available = getAvailableSlots({
      dateKey,
      service,
      bookings,
      closedDays,
    });

    if (!available.includes(start.toISOString()) && !available.includes(startsAt)) {
      const startMs = start.getTime();
      const ok = available.some((s) => new Date(s).getTime() === startMs);
      if (!ok) {
        return NextResponse.json(
          { error: "That time is no longer available. Pick another slot." },
          { status: 409 },
        );
      }
    }
  } else {
    if (closedDays.some((d) => d.date === dateKey)) {
      return NextResponse.json({ error: "Salon is closed that day" }, { status: 409 });
    }
    const endsMs = start.getTime() + service.durationMinutes * 60 * 1000;
    const conflict = bookings.some((b) => {
      if (b.status !== "pending" && b.status !== "confirmed") return false;
      const bs = new Date(b.startsAt).getTime();
      const be = new Date(b.endsAt).getTime();
      return start.getTime() < be && bs < endsMs;
    });
    if (conflict) {
      return NextResponse.json({ error: "Overlaps another booking" }, { status: 409 });
    }
  }

  const endsAt = new Date(start.getTime() + service.durationMinutes * 60 * 1000).toISOString();
  const booking = await createBooking({
    serviceId,
    customerName,
    customerPhone,
    startsAt: start.toISOString(),
    endsAt,
    notes,
    status: walkIn ? "confirmed" : "pending",
  });

  return NextResponse.json(booking, { status: 201 });
}

export async function PATCH(request: Request) {
  const ok = await isAdminLoggedIn();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const bookingId = sanitizeText(body.id, 80);
  if (!bookingId || !isValidBookingId(bookingId)) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  // Reschedule
  if (body.startsAt && body.serviceId) {
    const serviceId = sanitizeText(body.serviceId, 64);
    if (!isValidServiceId(serviceId)) {
      return NextResponse.json({ error: "Invalid service" }, { status: 400 });
    }
    const service = await getService(serviceId);
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }
    const start = new Date(String(body.startsAt));
    if (Number.isNaN(start.getTime())) {
      return NextResponse.json({ error: "Invalid time" }, { status: 400 });
    }
    const dateKey = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Colombo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(start);

    const [bookings, closedDays] = await Promise.all([listBookings(), listClosedDays()]);
    const others = bookings.filter((b) => b.id !== bookingId);
    const available = getAvailableSlots({
      dateKey,
      service,
      bookings: others,
      closedDays,
    });
    const startMs = start.getTime();
    if (!available.some((s) => new Date(s).getTime() === startMs)) {
      return NextResponse.json({ error: "New slot not available" }, { status: 409 });
    }
    const endsAt = new Date(startMs + service.durationMinutes * 60 * 1000).toISOString();
    const status =
      body.status !== undefined ? parseBookingStatus(body.status) : ("confirmed" as const);
    if (body.status !== undefined && !status) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const updated = await updateBooking(bookingId, {
      serviceId: service.id,
      startsAt: start.toISOString(),
      endsAt,
      status: status || "confirmed",
    });
    return NextResponse.json(updated);
  }

  const patch: {
    status?: NonNullable<ReturnType<typeof parseBookingStatus>>;
    notes?: string;
  } = {};
  if (body.status !== undefined) {
    const status = parseBookingStatus(body.status);
    if (!status) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    patch.status = status;
  }
  if (body.notes !== undefined) {
    patch.notes = sanitizeText(body.notes, 500);
  }

  const updated = await updateBooking(bookingId, patch);
  return NextResponse.json(updated);
}
