"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { salon, telUrl, whatsappUrl } from "@/lib/salon.config";

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="mt-auto border-t border-line bg-ink text-stone">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <BrandLogo href="/" height={72} className="rounded-sm" />
          <p className="mt-4 text-sm text-sand/80">{salon.tagline}</p>
        </div>
        <div className="text-sm">
          <p className="font-semibold uppercase tracking-wide text-copper">Hours</p>
          <p className="mt-2">{salon.hoursLabel}</p>
          <p className="mt-4 font-semibold uppercase tracking-wide text-copper">Contact</p>
          <p className="mt-2">
            <a className="underline decoration-copper/60" href={telUrl()}>
              {salon.phoneDisplay}
            </a>
          </p>
          <p className="mt-1">
            <a className="underline decoration-copper/60" href={whatsappUrl()}>
              WhatsApp
            </a>
          </p>
          <p className="mt-4 text-sand/80">{salon.address}</p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <Link href="/services" className="hover:text-copper">
            Services
          </Link>
          <Link href="/book" className="hover:text-copper">
            Book appointment
          </Link>
          <Link href="/qr" className="hover:text-copper">
            Shop QR code
          </Link>
          <Link href="/admin/login" className="text-sand/50 hover:text-sand">
            Owner login
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-sand/50">
        © {new Date().getFullYear()} {salon.name}
      </div>
    </footer>
  );
}
