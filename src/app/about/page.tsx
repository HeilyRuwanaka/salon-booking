import type { Metadata } from "next";
import Link from "next/link";
import { salon } from "@/lib/salon.config";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center">
      <div
        className="min-h-[320px] bg-cover bg-center"
        style={{ backgroundImage: `url(${salon.aboutImage})` }}
        role="img"
        aria-label="Salon atmosphere"
      />
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-copper-deep">
          About us
        </p>
        <h1 className="font-display mt-3 text-4xl tracking-tight text-ink sm:text-5xl">
          {salon.aboutLead}
        </h1>
        <div className="mt-6 space-y-4 text-mute leading-relaxed">
          {salon.aboutParagraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <p>
            Run by {salon.ownerName}. Prefer a chat first? WhatsApp us, or book
            a slot online and we will confirm.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/book" className="btn btn-primary">
            Book an appointment
          </Link>
          <Link href="/services" className="btn btn-ghost">
            View services
          </Link>
        </div>
      </div>
    </div>
  );
}
