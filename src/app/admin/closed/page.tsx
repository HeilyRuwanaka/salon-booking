import { redirect } from "next/navigation";
import { AdminClosedDays } from "@/components/AdminClosedDays";
import { AdminShell } from "@/components/AdminShell";
import { isAdminLoggedIn } from "@/lib/auth";
import { listClosedDays } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminClosedPage() {
  if (!(await isAdminLoggedIn())) redirect("/admin/login");
  const days = await listClosedDays();
  return (
    <AdminShell>
      <h1 className="mb-3 text-lg font-semibold">Closed days</h1>
      <AdminClosedDays initial={days} />
    </AdminShell>
  );
}
