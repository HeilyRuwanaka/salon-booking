import { NextResponse } from "next/server";
import { isAdminLoggedIn } from "@/lib/auth";
import { changeAdminPassword } from "@/lib/admin-password";

export async function POST(request: Request) {
  if (!(await isAdminLoggedIn())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const currentPassword = String(body.currentPassword || "");
  const newPassword = String(body.newPassword || "");

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
