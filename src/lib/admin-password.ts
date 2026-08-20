import { getSupabaseAdmin } from "./supabase";
import { hashPassword, verifyPassword } from "./password";

const HASH_KEY = "admin_password_hash";

export async function getAdminPasswordHash(): Promise<string | null> {
  try {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb
      .from("app_settings")
      .select("value")
      .eq("key", HASH_KEY)
      .maybeSingle();
    if (error || !data?.value) return null;
    return String(data.value);
  } catch {
    return null;
  }
}

export async function setAdminPasswordHash(password: string): Promise<void> {
  const sb = getSupabaseAdmin();
  const value = hashPassword(password);
  const { error } = await sb.from("app_settings").upsert({
    key: HASH_KEY,
    value,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    if (error.code === "PGRST205" || /app_settings/i.test(error.message)) {
      throw new Error(
        "Database table missing. In Supabase → SQL Editor, run supabase/app-settings.sql once, then try again.",
      );
    }
    throw new Error(error.message);
  }
}

/** Env bootstrap password (used until owner sets one in admin) */
export function getBootstrapPassword() {
  return process.env.ADMIN_PASSWORD || "RanuBook2026";
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (!password) return false;
  const stored = await getAdminPasswordHash();
  if (stored) return verifyPassword(password, stored);
  return password === getBootstrapPassword();
}

export async function changeAdminPassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  const ok = await verifyAdminPassword(input.currentPassword);
  if (!ok) throw new Error("Current password is wrong");
  const next = input.newPassword.trim();
  if (next.length < 6) throw new Error("New password must be at least 6 characters");
  if (next === input.currentPassword) throw new Error("New password must be different");
  await setAdminPasswordHash(next);
}
