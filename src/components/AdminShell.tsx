"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { salon } from "@/lib/salon.config";
import type { Booking } from "@/lib/types";

const tabs = [
  { href: "/admin", label: "Bookings", badge: true as const },
  { href: "/admin/closed", label: "Closed" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState(0);
  const prevPending = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function tick() {
      try {
        const res = await fetch("/api/bookings");
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as Booking[];
        const count = data.filter((b) => b.status === "pending").length;
        if (cancelled) return;

        const prev = prevPending.current;
        if (prev !== null && count > prev) {
          const added = count - prev;
          if (typeof window !== "undefined" && "Notification" in window) {
            if (Notification.permission === "granted") {
              new Notification(`${salon.name}: new booking`, {
                body: `${added} new pending booking${added === 1 ? "" : "s"} — open Bookings.`,
              });
            }
          }
        }
        prevPending.current = count;
        setPendingCount(count);
      } catch {
        /* ignore */
      }
    }

    void tick();
    const onChange = () => void tick();
    window.addEventListener("admin-bookings-changed", onChange);
    const id = window.setInterval(tick, 20000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      window.removeEventListener("admin-bookings-changed", onChange);
    };
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="mx-auto min-h-[100dvh] max-w-lg bg-stone">
      <header className="sticky top-0 z-30 border-b border-line bg-stone/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <p className="font-display text-xl">Ranu Admin</p>
          <button type="button" onClick={logout} className="text-sm text-mute underline">
            Log out
          </button>
        </div>
        <nav className="mt-3 grid grid-cols-5 gap-1.5">
          {tabs.map((t) => {
            const active =
              t.href === "/admin" ? pathname === "/admin" : pathname.startsWith(t.href);
            const showBadge = "badge" in t && t.badge && pendingCount > 0;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`relative rounded-xl py-2.5 text-center text-[11px] font-semibold leading-tight sm:text-sm ${
                  active ? "bg-ink text-stone" : "bg-sand text-ink"
                }`}
              >
                {t.label}
                {showBadge && (
                  <span
                    className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white"
                    aria-label={`${pendingCount} pending bookings`}
                  >
                    {pendingCount > 9 ? "9+" : pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </header>
      <div className="px-4 py-4 pb-24">{children}</div>
    </div>
  );
}
