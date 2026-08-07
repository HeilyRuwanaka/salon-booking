import { redirect } from "next/navigation";
import { AdminServices } from "@/components/AdminServices";
import { AdminShell } from "@/components/AdminShell";
import { isAdminLoggedIn } from "@/lib/auth";
import { listServices } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  if (!(await isAdminLoggedIn())) redirect("/admin/login");
  const services = await listServices(false);
  return (
    <AdminShell>
      <h1 className="mb-3 text-lg font-semibold">Services</h1>
      <AdminServices initial={services} />
    </AdminShell>
  );
}
