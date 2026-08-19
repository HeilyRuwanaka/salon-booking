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

export async function GET() {
  const ok = await isAdminLoggedIn();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await listBookings());
}

export async function POST(request: Request) {
  const body = await request.json();
  const serviceId = String(body.serviceId || "");
  const customerName = String(body.customerName || "").trim();
  const customerPhone = String(body.customerPhone || "").trim();
  const startsAt = String(body.startsAt || "");
  const notes = body.notes ? String(body.notes).trim() : undefined;
  const walkIn = body.walkIn === true;
  const admin = await isAdminLoggedIn();

  if (walkIn && !admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!serviceId || !customerName || !customerPhone || !startsAt) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
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
    // Walk-in: still block closed days and hard overlaps with pending/confirmed
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

  const body = await request.json();
  const bookingId = String(body.id || "");
  if (!bookingId) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  // Reschedule
  if (body.startsAt && body.serviceId) {
    const service = await getService(String(body.serviceId));
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }
    const start = new Date(String(body.startsAt));
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
    const updated = await updateBooking(bookingId, {
      serviceId: service.id,
      startsAt: start.toISOString(),
      endsAt,
      status: body.status || "confirmed",
    });
    return NextResponse.json(updated);
  }

  const updated = await updateBooking(bookingId, {
    status: body.status,
    notes: body.notes,
  });
  return NextResponse.json(updated);
}
