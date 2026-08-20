"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <header
      className="sticky top-0 z-40 border-t border-copper"
      style={{ backgroundColor: "#010101" }}
    >
      {/* Logo height = bar height so the mark fills the bar (same #010101 bg) */}
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <BrandLogo height={80} priority />

        <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`text-[12px] font-medium uppercase tracking-[0.14em] transition-colors ${
                  active ? "text-copper" : "text-stone/80 hover:text-copper"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <Link
            href="/book"
            className="rounded-full border border-copper bg-copper px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink transition hover:bg-copper-deep hover:text-stone hover:border-copper-deep"
          >
            Book Now
          </Link>
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/25 text-stone md:hidden"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <span className="text-2xl leading-none" aria-hidden>
              ×
            </span>
          ) : (
            <span className="flex flex-col gap-1.5" aria-hidden>
              <span className="block h-0.5 w-5 bg-stone" />
              <span className="block h-0.5 w-5 bg-stone" />
              <span className="block h-0.5 w-5 bg-stone" />
            </span>
          )}
        </button>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          className="border-t border-white/10 px-4 py-3 md:hidden"
          style={{ backgroundColor: "#010101" }}
          aria-label="Mobile"
        >
          <div className="flex flex-col gap-1">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-3 py-3.5 text-sm font-medium uppercase tracking-[0.12em] ${
                    active ? "bg-white/10 text-copper" : "text-stone/90 hover:bg-white/5"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
            <Link
              href="/book"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-copper px-5 py-3 text-center text-sm font-semibold uppercase tracking-[0.12em] text-ink"
            >
              Book Now
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
