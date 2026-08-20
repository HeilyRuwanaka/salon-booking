import { NextResponse } from "next/server";
import { salon } from "@/lib/salon.config";
import { getService, listBookings, listClosedDays } from "@/lib/store";
import { getAvailableSlots, getDaySlots } from "@/lib/slots";
import { isValidIsoDate, isValidServiceId, sanitizeText } from "@/lib/validate";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const serviceId = sanitizeText(searchParams.get("serviceId"), 64);
  const date = sanitizeText(searchParams.get("date"), 10);
  if (!serviceId || !date) {
    return NextResponse.json({ error: "serviceId and date required" }, { status: 400 });
  }
  if (!isValidServiceId(serviceId) || !isValidIsoDate(date)) {
    return NextResponse.json({ error: "Invalid serviceId or date" }, { status: 400 });
  }
  const service = await getService(serviceId);
  if (!service || !service.isActive) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }
  const [bookings, closedDays] = await Promise.all([listBookings(), listClosedDays()]);
  const closed = closedDays.some((d) => d.date === date);
  const daySlots = getDaySlots({
    dateKey: date,
    service,
    bookings,
    closedDays,
  });
  const slots = getAvailableSlots({
    dateKey: date,
    service,
    bookings,
    closedDays,
  });

  return NextResponse.json({
    slots,
    daySlots,
    closed,
    hours: {
      open: salon.hoursLabel,
      openHour: salon.openHour,
      closeHour: salon.closeHour,
    },
    service: {
      id: service.id,
      name: service.name,
      durationMinutes: service.durationMinutes,
    },
  });
}
