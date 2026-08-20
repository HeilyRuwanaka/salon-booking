import { NextResponse } from "next/server";
import { isAdminLoggedIn } from "@/lib/auth";
import { changeAdminPassword } from "@/lib/admin-password";
import { sanitizeText } from "@/lib/validate";

export async function POST(request: Request) {
  if (!(await isAdminLoggedIn())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const currentPassword = sanitizeText(body.currentPassword, 200);
  const newPassword = sanitizeText(body.newPassword, 200);

  try {
    await changeAdminPassword({ currentPassword, newPassword });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not change password" },
      { status: 400 },
    );
  }
}
