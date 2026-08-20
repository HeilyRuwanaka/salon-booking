import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/auth";
import { verifyAdminPassword } from "@/lib/admin-password";

export async function POST(request: Request) {
  const body = await request.json();
  const password = String(body.password || "");
  const ok = await verifyAdminPassword(password);
  if (!ok) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "ok", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
