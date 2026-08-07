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
        className="min-h-[320px] rounded-3xl bg-cover bg-center shadow-sm"
        style={{ backgroundImage: `url(${salon.aboutImage})` }}
        role="img"
        aria-label="Salon atmosphere"
      />
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-copper-deep">
          About us
        </p>
        <h1 className="font-display mt-3 text-4xl tracking-tight text-ink sm:text-5xl">
          Care that fits your day
        </h1>
        <div className="mt-6 space-y-4 text-mute leading-relaxed">
          <p>
            Welcome to {salon.name}. We keep things simple: quality cuts, clear
            timing, and a booking flow you can finish on your phone in a minute.
          </p>
          <p>
            Whether you need a quick tidy-up or a fuller style refresh, reserve a
            slot online and we will confirm from our side. Open every day from
            afternoon into the night — so late appointments are easier.
          </p>
          <p>
            This story can be updated anytime with the owner’s own words. Photos
            of real clients can replace the stock images when ready.
          </p>
        </div>
        <Link href="/book" className="btn btn-primary mt-8">
          Book an appointment
        </Link>
      </div>
    </div>
  );
}
