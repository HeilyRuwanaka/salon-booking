"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const tabs = [
  { href: "/admin", label: "Bookings" },
  { href: "/admin/closed", label: "Closed" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

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
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`rounded-xl py-2.5 text-center text-[11px] font-semibold leading-tight sm:text-sm ${
                  active ? "bg-ink text-stone" : "bg-sand text-ink"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <div className="px-4 py-4 pb-24">{children}</div>
    </div>
  );
}
