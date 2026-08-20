import { NextResponse } from "next/server";
import { isAdminLoggedIn } from "@/lib/auth";
import { listServices, upsertService } from "@/lib/store";
import {
  isValidServiceId,
  parsePositiveInt,
  sanitizeText,
} from "@/lib/validate";

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
  const body = await request.json().catch(() => ({}));

  const name = sanitizeText(body.name, 80);
  const durationMinutes = parsePositiveInt(body.durationMinutes, 480);
  const priceLkr = parsePositiveInt(body.priceLkr, 1_000_000);
  const description = body.description != null ? sanitizeText(body.description, 300) : undefined;
  const idRaw = body.id != null ? sanitizeText(body.id, 64) : undefined;

  if (!name || durationMinutes == null || priceLkr == null) {
    return NextResponse.json({ error: "Invalid service fields" }, { status: 400 });
  }
  if (idRaw && !isValidServiceId(idRaw)) {
    return NextResponse.json({ error: "Invalid service id" }, { status: 400 });
  }

  const services = await upsertService({
    id: idRaw,
    name,
    durationMinutes,
    priceLkr,
    isActive: body.isActive !== false,
    description: description || undefined,
  });
  return NextResponse.json(services);
}
