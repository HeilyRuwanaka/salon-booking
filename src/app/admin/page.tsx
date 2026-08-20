import { redirect } from "next/navigation";
import { AdminBookings } from "@/components/AdminBookings";
import { AdminShell } from "@/components/AdminShell";
import { isAdminLoggedIn } from "@/lib/auth";
import { listBookings, listServices } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdminLoggedIn())) redirect("/admin/login");
  const [bookings, services] = await Promise.all([listBookings(), listServices(false)]);

  return (
    <AdminShell>
      <h1 className="mb-3 text-lg font-semibold">Bookings</h1>
      <p className="mb-4 text-sm text-mute">
        Confirm, cancel, mark done, or add a walk-in.
      </p>
      <AdminBookings initialBookings={bookings} services={services} />
    </AdminShell>
  );
}
