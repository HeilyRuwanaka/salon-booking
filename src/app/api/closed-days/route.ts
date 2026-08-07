import { NextResponse } from "next/server";
import { isAdminLoggedIn } from "@/lib/auth";
import { addClosedDay, listClosedDays, removeClosedDay } from "@/lib/store";

export async function GET() {
  return NextResponse.json(await listClosedDays());
}

export async function POST(request: Request) {
  const ok = await isAdminLoggedIn();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const date = String(body.date || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "date must be YYYY-MM-DD" }, { status: 400 });
  }
  try {
    const row = await addClosedDay(date, body.reason ? String(body.reason) : undefined);
    return NextResponse.json(row, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  const ok = await isAdminLoggedIn();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await removeClosedDay(id);
  return NextResponse.json({ ok: true });
}
