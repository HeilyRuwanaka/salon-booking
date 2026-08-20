import { redirect } from "next/navigation";
import { AdminChangePassword } from "@/components/AdminChangePassword";
import { AdminShell } from "@/components/AdminShell";
import { isAdminLoggedIn } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  if (!(await isAdminLoggedIn())) redirect("/admin/login");

  return (
    <AdminShell>
      <h1 className="mb-3 text-lg font-semibold">Settings</h1>
      <p className="mb-4 text-sm text-mute">
        Change your admin password here.
      </p>

      <AdminChangePassword />

      <section className="mt-4 space-y-3 rounded-2xl border border-line bg-white p-4 text-sm">
        <h2 className="font-semibold">Forgot password?</h2>
        <ol className="list-decimal space-y-2 pl-5 text-mute">
          <li>
            In Vercel, set <code className="text-ink">ADMIN_PASSWORD</code> to a
            temporary password and redeploy
          </li>
          <li>
            In Supabase → <code className="text-ink">app_settings</code>, delete
            the <code className="text-ink">admin_password_hash</code> row
          </li>
          <li>Log in with the temporary password, then set a new one here</li>
        </ol>
      </section>
    </AdminShell>
  );
}
