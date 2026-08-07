import { cookies } from "next/headers";

export const ADMIN_COOKIE = "ranu_admin_session";

/** Admin password from env — set ADMIN_PASSWORD in .env.local and Vercel */
export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "RanuBook2026";
}

export async function isAdminLoggedIn() {
  const jar = await cookies();
  return jar.get(ADMIN_COOKIE)?.value === "ok";
}

export async function requireAdmin() {
  const ok = await isAdminLoggedIn();
  if (!ok) {
    throw new Error("Unauthorized");
  }
}
