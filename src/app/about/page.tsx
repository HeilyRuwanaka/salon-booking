import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { salon } from "@/lib/salon.config";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="bg-surface">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:py-20">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-sand">
          <Image
            src={salon.aboutImage}
            alt="Salon atmosphere"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </div>
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
    </div>
  );
}
