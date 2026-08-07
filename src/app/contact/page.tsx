import type { Metadata } from "next";
import { salon, telUrl, whatsappUrl } from "@/lib/salon.config";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-copper-deep">
        Contact
      </p>
      <h1 className="font-display mt-3 text-4xl tracking-tight sm:text-5xl">
        Reach {salon.name}
      </h1>
      <p className="mt-4 max-w-xl text-mute">
        Prefer chatting? Use WhatsApp. Prefer booking straight away? Use Book Now.
        Address and map link will be added when the owner shares them.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <a
          href={telUrl()}
          className="rounded-3xl border border-line bg-white/70 p-6 transition hover:border-copper"
        >
          <p className="text-sm uppercase tracking-wide text-mute">Phone</p>
          <p className="mt-2 text-xl font-semibold">{salon.phoneDisplay}</p>
        </a>
        <a
          href={whatsappUrl()}
          className="rounded-3xl border border-line bg-white/70 p-6 transition hover:border-copper"
        >
          <p className="text-sm uppercase tracking-wide text-mute">WhatsApp</p>
          <p className="mt-2 text-xl font-semibold">Chat with us</p>
        </a>
        <div className="rounded-3xl border border-line bg-white/70 p-6">
          <p className="text-sm uppercase tracking-wide text-mute">Hours</p>
          <p className="mt-2 text-xl font-semibold">1:00 PM – 12:00 AM</p>
          <p className="mt-1 text-sm text-mute">Every day</p>
        </div>
        <div className="rounded-3xl border border-line bg-white/70 p-6 sm:col-span-2 lg:col-span-3">
          <p className="text-sm uppercase tracking-wide text-mute">Location</p>
          <p className="mt-2 text-xl font-semibold">{salon.address}</p>
          <p className="mt-2 text-sm text-mute">
            {salon.mapUrl
              ? "Map link ready"
              : "Google Maps link coming soon — easy to drop into settings later."}
          </p>
          {salon.mapUrl && (
            <a
              href={salon.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary mt-4"
            >
              Open map
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
