import type { Metadata } from "next";
import Link from "next/link";
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
        Prefer chatting? Use WhatsApp. Ready to lock a time? Book online in a
        minute.
      </p>

      <dl className="mt-10 grid gap-8 border-y border-line py-10 sm:grid-cols-2">
        <div>
          <dt className="text-sm uppercase tracking-wide text-mute">Phone</dt>
          <dd className="mt-2 text-xl font-semibold">
            <a href={telUrl()} className="hover:text-copper-deep">
              {salon.phoneDisplay}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-sm uppercase tracking-wide text-mute">WhatsApp</dt>
          <dd className="mt-2 text-xl font-semibold">
            <a href={whatsappUrl()} className="hover:text-copper-deep">
              Chat with us
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-sm uppercase tracking-wide text-mute">Hours</dt>
          <dd className="mt-2 text-xl font-semibold">{salon.hoursLabel}</dd>
          <dd className="mt-1 text-sm text-mute">{salon.hoursDetail}</dd>
        </div>
        <div>
          <dt className="text-sm uppercase tracking-wide text-mute">Location</dt>
          <dd className="mt-2 text-xl font-semibold">{salon.address}</dd>
          <dd className="mt-2 text-sm text-mute">
            {salon.mapUrl ? "Map ready below." : salon.addressNote}
          </dd>
          {salon.mapUrl && (
            <dd className="mt-4">
              <a
                href={salon.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
              >
                Open map
              </a>
            </dd>
          )}
        </div>
      </dl>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/book" className="btn btn-accent">
          Book Now
        </Link>
        <Link href="/qr" className="btn btn-ghost">
          Shop QR code
        </Link>
      </div>
    </div>
  );
}
