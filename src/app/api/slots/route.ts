import { NextResponse } from "next/server";
import { getService, listBookings, listClosedDays } from "@/lib/store";
import { getAvailableSlots } from "@/lib/slots";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get("serviceId");
  const date = searchParams.get("date");
  if (!serviceId || !date) {
    return NextResponse.json({ error: "serviceId and date required" }, { status: 400 });
  }
  const service = await getService(serviceId);
  if (!service || !service.isActive) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }
  const [bookings, closedDays] = await Promise.all([listBookings(), listClosedDays()]);
  const slots = getAvailableSlots({
    dateKey: date,
    service,
    bookings,
    closedDays,
  });
  return NextResponse.json({ slots, closed: closedDays.some((d) => d.date === date) });
}
