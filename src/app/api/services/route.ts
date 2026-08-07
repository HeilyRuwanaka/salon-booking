import { NextResponse } from "next/server";
import { isAdminLoggedIn } from "@/lib/auth";
import { listServices, upsertService } from "@/lib/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get("all") === "1";
  if (all) {
    const ok = await isAdminLoggedIn();
    if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json(await listServices(false));
  }
  return NextResponse.json(await listServices(true));
}

export async function POST(request: Request) {
  const ok = await isAdminLoggedIn();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const services = await upsertService({
    id: body.id,
    name: String(body.name || "").trim(),
    durationMinutes: Number(body.durationMinutes),
    priceLkr: Number(body.priceLkr),
    isActive: body.isActive !== false,
    description: body.description ? String(body.description) : undefined,
  });
  return NextResponse.json(services);
}
