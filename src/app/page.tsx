import Image from "next/image";
import Link from "next/link";
import { salon, telUrl, whatsappUrl } from "@/lib/salon.config";
import { listServices } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let services: Awaited<ReturnType<typeof listServices>> = [];
  let servicesError = false;
  try {
    services = (await listServices(true)).slice(0, 6);
  } catch {
    servicesError = true;
  }

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-ink">
        <Image
          src={salon.heroImage}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/40" />

        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-20">
          <p className="animate-rise font-display text-5xl leading-none tracking-tight text-stone sm:text-7xl md:text-8xl">
            {salon.name}
          </p>
          <p className="animate-rise-delay mt-5 max-w-xl text-lg text-sand/90 sm:text-xl">
            {salon.tagline}
          </p>
          <div className="animate-rise-delay-2 mt-8 flex flex-wrap gap-3">
            <Link href="/book" className="btn btn-accent text-base">
              Book Now
            </Link>
            <a
              href={whatsappUrl("Hi, I want to book at Ranu Salon")}
              className="btn btn-ghost border-white/30 text-stone hover:bg-white/10"
            >
              WhatsApp
            </a>
            <a
              href={telUrl()}
              className="btn btn-ghost border-white/30 text-stone hover:bg-white/10"
            >
              Call
            </a>
          </div>
          <p className="mt-8 text-sm text-sand/70">{salon.hoursLabel}</p>
        </div>
      </section>

      {/* Services */}
      <section className="section-pad border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-copper-deep">
            Services
          </p>
          <h2 className="font-display mt-3 text-3xl tracking-tight text-ink sm:text-4xl">
            Clear time and price
          </h2>
          <p className="mt-3 max-w-xl text-mute">
            Pick a service, choose a slot, and we confirm.
          </p>

          {servicesError && (
            <p className="mt-6 rounded-xl bg-warn/10 px-4 py-3 text-sm text-warn">
              Services are temporarily unavailable. Try Book Now again shortly,
              or WhatsApp us.
            </p>
          )}

          <ul className="mt-10 divide-y divide-line border-y border-line">
            {services.map((s) => (
              <li
                key={s.id}
                className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold text-ink">{s.name}</h3>
                  <p className="mt-1 text-sm text-mute">{s.durationMinutes} min</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-semibold text-ink">
                    LKR {s.priceLkr.toLocaleString("en-LK")}
                  </p>
                  <Link href={`/book?service=${s.id}`} className="btn btn-primary text-sm">
                    Book
                  </Link>
                </div>
              </li>
            ))}
          </ul>

          <Link
            href="/services"
            className="mt-8 inline-block text-sm font-semibold text-copper-deep underline-offset-4 hover:underline"
          >
            See all services
          </Link>
        </div>
      </section>

      {/* About — solid band + reliable image */}
      <section className="section-pad border-t border-line bg-stone">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14">
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-sand">
            <Image
              src={salon.aboutImage}
              alt="Salon atmosphere"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-copper-deep">
              About
            </p>
            <h2 className="font-display mt-3 text-3xl tracking-tight text-ink sm:text-4xl">
              {salon.aboutLead}
            </h2>
            <p className="mt-4 text-mute leading-relaxed">{salon.aboutParagraphs[0]}</p>
            <p className="mt-3 text-mute leading-relaxed">{salon.aboutParagraphs[1]}</p>
            <Link href="/about" className="btn btn-ghost mt-8">
              More about us
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="section-pad border-t border-line bg-ink text-stone">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sand/60">
            Reviews
          </p>
          <h2 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">
            What clients say
          </h2>
          <ul className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
            {salon.reviews.map((r) => (
              <li key={r.quote} className="border-t border-white/12 pt-6">
                <blockquote className="text-base leading-relaxed text-sand/90">
                  “{r.quote}”
                </blockquote>
                <p className="mt-4 text-sm font-semibold text-stone">{r.name}</p>
                <p className="text-sm text-sand/55">{r.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Visit */}
      <section className="section-pad border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-copper-deep">
            Visit
          </p>
          <h2 className="font-display mt-3 text-3xl tracking-tight text-ink sm:text-4xl">
            Find us &amp; get in touch
          </h2>
          <div className="mt-10 grid gap-8 border-y border-line py-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-mute">Hours</p>
              <p className="mt-2 font-semibold text-ink">{salon.hoursLabel}</p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-wide text-mute">Phone</p>
              <a href={telUrl()} className="mt-2 block font-semibold text-ink hover:text-copper-deep">
                {salon.phoneDisplay}
              </a>
            </div>
            <div>
              <p className="text-sm uppercase tracking-wide text-mute">WhatsApp</p>
              <a
                href={whatsappUrl("Hi, I want to book at Ranu Salon")}
                className="mt-2 block font-semibold text-ink hover:text-copper-deep"
              >
                Chat to book
              </a>
            </div>
            <div>
              <p className="text-sm uppercase tracking-wide text-mute">Location</p>
              <p className="mt-2 font-semibold text-ink">{salon.address}</p>
              {salon.mapUrl ? (
                <a
                  href={salon.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm font-semibold text-copper-deep underline-offset-4 hover:underline"
                >
                  Open map
                </a>
              ) : (
                <p className="mt-2 text-sm text-mute">{salon.addressNote}</p>
              )}
            </div>
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/book" className="btn btn-accent">
              Book Now
            </Link>
            <Link href="/contact" className="btn btn-ghost">
              Contact details
            </Link>
            <Link href="/qr" className="btn btn-ghost">
              Shop QR code
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
