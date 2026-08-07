import { cookies } from "next/headers";

export const ADMIN_COOKIE = "ranu_admin_session";

/** Local learning password — replace with Supabase Auth later */
export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "ranu1234";
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
