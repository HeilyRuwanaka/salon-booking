import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  createAdminSessionValue,
} from "@/lib/auth";
import { verifyAdminPassword } from "@/lib/admin-password";
import { sanitizeText } from "@/lib/validate";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const password = sanitizeText(body.password, 200);
  if (!password) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }
  const ok = await verifyAdminPassword(password);
  if (!ok) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, createAdminSessionValue(), adminCookieOptions());
  return res;
}
