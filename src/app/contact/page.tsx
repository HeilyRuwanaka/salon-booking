import type { Metadata } from "next";
import Link from "next/link";
import { mapEmbedUrl, salon, telUrl, whatsappUrl } from "@/lib/salon.config";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <>
      {/* Intro + get in touch (no message form) */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-copper-deep">
          Contact
        </p>
        <h1 className="font-display mt-3 text-4xl tracking-tight sm:text-5xl">
          Get in touch
        </h1>

        <div className="mt-10 grid gap-10 border-y border-line py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-mute">
              Location
            </p>
            <p className="mt-3 text-lg font-semibold text-ink">{salon.address}</p>
            <p className="mt-2 text-sm text-mute">{salon.addressNote}</p>
            {salon.mapUrl && (
              <a
                href={salon.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-sm font-semibold text-copper-deep underline-offset-4 hover:underline"
              >
                Open in Google Maps
              </a>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-mute">
              Hours
            </p>
            <p className="mt-3 text-lg font-semibold text-ink">{salon.hoursLabel}</p>
            <p className="mt-2 text-sm text-mute">{salon.hoursDetail}</p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-mute">
              Phone
            </p>
            <a
              href={telUrl()}
              className="mt-3 block text-lg font-semibold text-ink hover:text-copper-deep"
            >
              {salon.phoneDisplay}
            </a>
            <a
              href={whatsappUrl("Hi, I want to book at Ranu Salon")}
              className="mt-2 inline-block text-sm font-semibold text-copper-deep underline-offset-4 hover:underline"
            >
              WhatsApp chat
            </a>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-mute">
              Book
            </p>
            <p className="mt-3 text-sm text-mute">
              Reserve a time online — fast on your phone.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/book" className="btn btn-accent text-sm">
                Book Now
              </Link>
              <Link href="/services" className="btn btn-ghost text-sm">
                Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Full-bleed map — like the sample, without a contact form */}
      <section className="w-full border-t border-line" aria-label="Salon location map">
        <div className="relative h-[min(70vh,520px)] w-full bg-sand">
          <iframe
            title={`${salon.name} on Google Maps`}
            src={mapEmbedUrl()}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <p className="text-sm text-mute">Pin shows the salon location.</p>
          {salon.mapUrl && (
            <a
              href={salon.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary text-sm"
            >
              Open map app
            </a>
          )}
        </div>
      </section>
    </>
  );
}
