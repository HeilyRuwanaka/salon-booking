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
        Change your admin password here. No email “forgot password” yet — if you
        lock yourself out, reset via Vercel env (below).
      </p>

      <AdminChangePassword />

      <section className="mt-4 space-y-3 rounded-2xl border border-line bg-white p-4 text-sm">
        <h2 className="font-semibold">If you forget the password</h2>
        <ol className="list-decimal space-y-2 pl-5 text-mute">
          <li>
            Vercel → Project → Settings → Environment Variables → set{" "}
            <code className="text-ink">ADMIN_PASSWORD</code> to a temporary password
          </li>
          <li>
            In Supabase → Table Editor → <code className="text-ink">app_settings</code> →
            delete the row with key <code className="text-ink">admin_password_hash</code>{" "}
            (so env password works again)
          </li>
          <li>Redeploy Vercel, log in with that temporary password, then change it here</li>
        </ol>
      </section>

      <section className="mt-4 space-y-2 rounded-2xl border border-line bg-white p-4 text-sm">
        <h2 className="font-semibold">Tips</h2>
        <ul className="list-disc space-y-1 pl-5 text-mute">
          <li>Use Reports for daily / weekly / monthly earnings + PDF</li>
          <li>Mark Done only when the cut is finished (that counts as earnings)</li>
          <li>Use No-show when the customer never arrives</li>
          <li>Walk-in booking is on the Bookings tab</li>
        </ul>
      </section>
    </AdminShell>
  );
}
