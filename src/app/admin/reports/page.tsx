import { redirect } from "next/navigation";
import { AdminReports } from "@/components/AdminReports";
import { AdminShell } from "@/components/AdminShell";
import { isAdminLoggedIn } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  if (!(await isAdminLoggedIn())) redirect("/admin/login");

  return (
    <AdminShell>
      <h1 className="mb-3 text-lg font-semibold">Reports &amp; earnings</h1>
      <p className="mb-4 text-sm text-mute">
        Daily, weekly, or monthly totals from completed bookings. Download a PDF for
        your records.
      </p>
      <AdminReports />
    </AdminShell>
  );
}
