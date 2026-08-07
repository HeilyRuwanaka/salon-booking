import Link from "next/link";
import { salon, telUrl, whatsappUrl } from "@/lib/salon.config";

export default function HomePage() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Full-bleed hero */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${salon.heroImage})` }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/35" />

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
          <a href={whatsappUrl("Hi, I want to book at Ranu Salon")} className="btn btn-ghost border-white/25 text-stone">
            WhatsApp
          </a>
          <a href={telUrl()} className="btn btn-ghost border-white/25 text-stone">
            Call
          </a>
        </div>
        <p className="mt-8 text-sm text-sand/70">Open every day · 1:00 PM – midnight</p>
      </div>
    </section>
  );
}
