"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { salon } from "@/lib/salon.config";

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
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="font-display text-2xl tracking-tight text-ink">
          {salon.name}
        </Link>

        {/* Desktop links */}
        <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm ${pathname === l.href ? "font-semibold text-copper-deep" : "text-mute hover:text-ink"}`}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/book" className="btn btn-accent text-sm">
            Book Now
          </Link>
        </nav>

        {/* Phone / small screen: opens the page list */}
        <button
          type="button"
          className="btn btn-ghost relative z-50 min-w-[5.5rem] px-4 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          className="border-t border-line bg-surface px-4 py-3 shadow-sm md:hidden"
          aria-label="Mobile"
        >
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-3 py-3.5 text-base ${
                  pathname === l.href
                    ? "bg-stone font-semibold text-copper-deep"
                    : "text-ink hover:bg-stone"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/book"
              onClick={() => setOpen(false)}
              className="btn btn-accent mt-2 w-full"
            >
              Book Now
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
