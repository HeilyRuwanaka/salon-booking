import type { Metadata } from "next";
import { BookingWizard } from "@/components/BookingWizard";
import { listServices } from "@/lib/store";

export const metadata: Metadata = {
  title: "Book Now",
};

export const dynamic = "force-dynamic";

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const sp = await searchParams;
  const services = await listServices(true);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-copper-deep">
        Book now
      </p>
      <h1 className="font-display mt-3 text-4xl tracking-tight sm:text-5xl">
        Book an appointment
      </h1>
      <p className="mt-3 mb-10 max-w-xl text-mute">
        Choose a service and time. Pay at the salon when you visit.
      </p>
      <BookingWizard services={services} initialServiceId={sp.service} />
    </div>
  );
}
