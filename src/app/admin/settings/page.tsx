import { redirect } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { isAdminLoggedIn } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  if (!(await isAdminLoggedIn())) redirect("/admin/login");

  return (
    <AdminShell>
      <h1 className="mb-3 text-lg font-semibold">Settings</h1>
      <p className="mb-4 text-sm text-mute">
        Phone admin basics. Secure in-app password change (hashed) can come later.
      </p>

      <section className="space-y-3 rounded-2xl border border-line bg-white p-4 text-sm">
        <h2 className="font-semibold">Change admin password</h2>
        <ol className="list-decimal space-y-2 pl-5 text-mute">
          <li>
            On your PC: edit <code className="text-ink">.env.local</code> →{" "}
            <code className="text-ink">ADMIN_PASSWORD=your-new-password</code>
          </li>
          <li>
            On Vercel: Project → Settings → Environment Variables → edit{" "}
            <code className="text-ink">ADMIN_PASSWORD</code> to the same value
          </li>
          <li>Redeploy the Vercel project</li>
          <li>Log out and log in with the new password</li>
        </ol>
        <p className="text-mute">
          Steps are also in <code className="text-ink">scripts/vercel-set-admin-password.txt</code>.
        </p>
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
