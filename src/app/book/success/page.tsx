import type { Metadata } from "next";
import Link from "next/link";
import { whatsappUrl } from "@/lib/salon.config";

export const metadata: Metadata = {
  title: "Booking received",
};

export default async function BookSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const sp = await searchParams;

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-copper-deep">
        Booking sent
      </p>
      <h1 className="font-display mt-3 text-4xl tracking-tight">
        Thank you
      </h1>
      <p className="mt-4 text-mute">
        We’ve received your request. The salon will confirm soon — keep WhatsApp
        nearby.
      </p>
      {sp.id && (
        <p className="mt-2 text-xs text-mute">Booking ID: {sp.id}</p>
      )}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/" className="btn btn-primary">
          Back to home
        </Link>
        <a
          href={whatsappUrl("Hi, I just booked online at Ranu Salon")}
          className="btn btn-ghost"
        >
          WhatsApp salon
        </a>
      </div>
    </div>
  );
}
