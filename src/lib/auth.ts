import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "ranu_admin_session";
const SESSION_DAYS = 30;

function sessionSecret() {
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error("Missing session secret env (ADMIN_SESSION_SECRET or ADMIN_PASSWORD)");
  }
  return secret;
}

/** Signed cookie value — cannot be forged by setting cookie=ok in the browser */
export function createAdminSessionValue() {
  const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = `v1.${exp}`;
  const sig = createHmac("sha256", sessionSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyAdminSessionValue(token: string | undefined): boolean {
  if (!token) return false;
  // Reject legacy forgeable value
  if (token === "ok") return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [ver, expStr, sig] = parts;
  if (ver !== "v1") return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  const payload = `${ver}.${expStr}`;
  const expected = createHmac("sha256", sessionSecret()).update(payload).digest("hex");
  try {
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function adminCookieOptions() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    secure: process.env.NODE_ENV === "production",
  };
}

export async function isAdminLoggedIn() {
  const jar = await cookies();
  return verifyAdminSessionValue(jar.get(ADMIN_COOKIE)?.value);
}

export async function requireAdmin() {
  const ok = await isAdminLoggedIn();
  if (!ok) throw new Error("Unauthorized");
}
