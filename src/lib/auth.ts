import { cookies } from "next/headers";

export const ADMIN_COOKIE = "ranu_admin_session";

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
