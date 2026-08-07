import type { Metadata } from "next";
import Link from "next/link";
import { listServices } from "@/lib/store";

export const metadata: Metadata = {
  title: "Services",
};

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const services = await listServices(true);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-copper-deep">
          Services
        </p>
        <h1 className="font-display mt-3 text-4xl tracking-tight sm:text-5xl">
          Time &amp; price, clearly listed
        </h1>
        <p className="mt-4 text-mute">
          Duration and price for each service. The owner can update this list
          anytime from the phone admin.
        </p>
      </div>

      <ul className="mt-10 divide-y divide-line border-y border-line">
        {services.map((s) => (
          <li
            key={s.id}
            className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h2 className="text-xl font-semibold text-ink">{s.name}</h2>
              {s.description && (
                <p className="mt-1 text-sm text-mute">{s.description}</p>
              )}
              <p className="mt-2 text-sm text-mute">{s.durationMinutes} min</p>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-lg font-semibold">
                LKR {s.priceLkr.toLocaleString("en-LK")}
              </p>
              <Link
                href={`/book?service=${s.id}`}
                className="btn btn-primary text-sm"
              >
                Book
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
