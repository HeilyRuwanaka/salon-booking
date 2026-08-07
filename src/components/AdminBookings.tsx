"use client";

import { useMemo, useState } from "react";
import type { Booking, Service } from "@/lib/types";
import { formatBookingWhen, formatSlotLabel } from "@/lib/slots";
import { toDateKey } from "@/lib/slots";

type Props = {
  initialBookings: Booking[];
  services: Service[];
};

export function AdminBookings({ initialBookings, services }: Props) {
  const [bookings, setBookings] = useState(initialBookings);
  const [filter, setFilter] = useState<"today" | "upcoming" | "all">("today");
  const [busyId, setBusyId] = useState("");
  const [rescheduleId, setRescheduleId] = useState("");
  const [dateKey, setDateKey] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [error, setError] = useState("");

  const todayKey = toDateKey(new Date());

  const serviceMap = useMemo(() => {
    const m = new Map(services.map((s) => [s.id, s]));
    return m;
  }, [services]);

  const visible = useMemo(() => {
    const now = Date.now();
    return bookings
      .filter((b) => b.status !== "cancelled" || filter === "all")
      .filter((b) => {
        const key = toDateKey(new Date(b.startsAt));
        if (filter === "today") return key === todayKey;
        if (filter === "upcoming") return new Date(b.startsAt).getTime() >= now - 60_000;
        return true;
      })
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  }, [bookings, filter, todayKey]);

  async function setStatus(id: string, status: Booking["status"]) {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setBookings((prev) => prev.map((b) => (b.id === id ? data : b)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusyId("");
    }
  }

  async function loadSlots(booking: Booking, day: string) {
    setDateKey(day);
    setRescheduleId(booking.id);
    const res = await fetch(`/api/slots?serviceId=${booking.serviceId}&date=${day}`);
    const data = await res.json();
    setSlots(data.slots || []);
  }

  async function applyReschedule(booking: Booking, startsAt: string) {
    setBusyId(booking.id);
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: booking.id,
          serviceId: booking.serviceId,
          startsAt,
          status: "confirmed",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reschedule failed");
      setBookings((prev) => prev.map((b) => (b.id === booking.id ? data : b)));
      setRescheduleId("");
      setSlots([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reschedule failed");
    } finally {
      setBusyId("");
    }
  }

  function waLink(phone: string, name: string) {
    const digits = phone.replace(/\D/g, "");
    const intl = digits.startsWith("0") ? `94${digits.slice(1)}` : digits;
    const text = encodeURIComponent(`Hi ${name}, this is Ranu Salon about your appointment.`);
    return `https://wa.me/${intl}?text=${text}`;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {(
          [
            ["today", "Today"],
            ["upcoming", "Upcoming"],
            ["all", "All"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-xl py-2 text-sm font-semibold ${
              filter === key ? "bg-copper text-white" : "bg-white border border-line"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
      )}

      {visible.length === 0 && (
        <p className="rounded-2xl bg-sand px-4 py-6 text-center text-mute">
          No bookings in this view yet.
        </p>
      )}

      {visible.map((b) => {
        const svc = serviceMap.get(b.serviceId);
        return (
          <article key={b.id} className="rounded-2xl border border-line bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-lg font-semibold">{b.customerName}</p>
                <p className="text-sm text-mute">{formatBookingWhen(b.startsAt)}</p>
                <p className="mt-1 text-sm">
                  {svc?.name || "Service"} · LKR {svc?.priceLkr.toLocaleString("en-LK") ?? "—"}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${
                  b.status === "pending"
                    ? "bg-warn/15 text-warn"
                    : b.status === "confirmed"
                      ? "bg-ok/15 text-ok"
                      : b.status === "completed"
                        ? "bg-sand text-mute"
                        : "bg-danger/10 text-danger"
                }`}
              >
                {b.status}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <a href={`tel:${b.customerPhone}`} className="btn btn-ghost text-sm">
                Call
              </a>
              <a
                href={waLink(b.customerPhone, b.customerName)}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost text-sm"
              >
                WhatsApp
              </a>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              {b.status === "pending" && (
                <button
                  type="button"
                  disabled={busyId === b.id}
                  className="btn btn-primary text-sm"
                  onClick={() => setStatus(b.id, "confirmed")}
                >
                  Confirm
                </button>
              )}
              {(b.status === "pending" || b.status === "confirmed") && (
                <button
                  type="button"
                  disabled={busyId === b.id}
                  className="btn btn-accent text-sm"
                  onClick={() => setStatus(b.id, "completed")}
                >
                  Done
                </button>
              )}
              {b.status !== "cancelled" && (
                <button
                  type="button"
                  disabled={busyId === b.id}
                  className="btn btn-ghost text-sm"
                  onClick={() => setStatus(b.id, "cancelled")}
                >
                  Cancel
                </button>
              )}
              {(b.status === "pending" || b.status === "confirmed") && (
                <button
                  type="button"
                  className="btn btn-ghost text-sm"
                  onClick={() => loadSlots(b, toDateKey(new Date(b.startsAt)))}
                >
                  Reschedule
                </button>
              )}
            </div>

            {rescheduleId === b.id && (
              <div className="mt-3 rounded-xl bg-sand p-3">
                <label className="block text-sm">
                  New date
                  <input
                    type="date"
                    className="field mt-1"
                    value={dateKey}
                    onChange={(e) => loadSlots(b, e.target.value)}
                  />
                </label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {slots.map((iso) => (
                    <button
                      key={iso}
                      type="button"
                      className="rounded-lg bg-white px-2 py-2 text-xs border border-line"
                      onClick={() => applyReschedule(b, iso)}
                    >
                      {formatSlotLabel(iso)}
                    </button>
                  ))}
                </div>
                {slots.length === 0 && (
                  <p className="mt-2 text-xs text-mute">No free slots that day.</p>
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
