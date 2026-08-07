"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-stone/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="font-display text-2xl tracking-tight text-ink">
          {salon.name}
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm ${pathname === l.href ? "text-copper-deep font-semibold" : "text-mute hover:text-ink"}`}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/book" className="btn btn-accent text-sm">
            Book Now
          </Link>
        </nav>

        <button
          type="button"
          className="btn btn-ghost md:hidden px-3"
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
        >
          Menu
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-stone px-4 py-3 md:hidden">
          <div className="flex flex-col gap-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-base hover:bg-sand"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/book"
              onClick={() => setOpen(false)}
              className="btn btn-accent mt-1"
            >
              Book Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
