"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
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

  const refreshPending = useCallback(async () => {
    try {
      const res = await fetch("/api/bookings", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as Booking[];
      const count = data.filter((b) => b.status === "pending").length;

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
  }, []);

  useEffect(() => {
    void refreshPending();
    const onChange = () => void refreshPending();
    const onFocus = () => void refreshPending();
    window.addEventListener("admin-bookings-changed", onChange);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    const id = window.setInterval(refreshPending, 12000);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("admin-bookings-changed", onChange);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [refreshPending]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="mx-auto min-h-[100dvh] max-w-lg bg-stone">
      <header className="sticky top-0 z-30 overflow-visible border-b border-line bg-stone/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <p className="font-display text-xl">Ranu Admin</p>
          <button type="button" onClick={logout} className="text-sm text-mute underline">
            Log out
          </button>
        </div>
        <nav className="mt-3 grid grid-cols-5 gap-1.5 overflow-visible pt-1">
          {tabs.map((t) => {
            const active =
              t.href === "/admin" ? pathname === "/admin" : pathname.startsWith(t.href);
            const showBadge = "badge" in t && t.badge && pendingCount > 0;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`relative overflow-visible rounded-xl py-2.5 text-center text-[11px] font-semibold leading-tight sm:text-sm ${
                  active ? "bg-ink text-stone" : "bg-sand text-ink"
                }`}
              >
                {t.label}
                {showBadge && (
                  <span
                    className="absolute right-0 top-0 z-20 flex h-[1.15rem] min-w-[1.15rem] -translate-y-1/3 translate-x-1/4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white shadow-sm"
                    style={{ background: "#c0392b" }}
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
