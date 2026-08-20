import { NextResponse } from "next/server";
import { isAdminLoggedIn } from "@/lib/auth";
import { buildReport, type ReportRange } from "@/lib/reports";
import { listBookings, listServices } from "@/lib/store";
import { isValidIsoDate, sanitizeText } from "@/lib/validate";

export async function GET(request: Request) {
  const ok = await isAdminLoggedIn();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const range = (searchParams.get("range") || "day") as ReportRange;
  if (!["day", "week", "month"].includes(range)) {
    return NextResponse.json({ error: "Invalid range" }, { status: 400 });
  }

  const dateParam = sanitizeText(searchParams.get("date"), 10);
  if (dateParam && !isValidIsoDate(dateParam)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }
  const anchor = dateParam ? new Date(`${dateParam}T12:00:00+05:30`) : new Date();
  if (Number.isNaN(anchor.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const [bookings, services] = await Promise.all([listBookings(), listServices(false)]);
  const report = buildReport(bookings, services, range, anchor);
  return NextResponse.json(report);
}
