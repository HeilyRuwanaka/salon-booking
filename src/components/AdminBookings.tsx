"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Booking, Service } from "@/lib/types";
import { formatBookingWhen, formatSlotLabel, toDateKey } from "@/lib/slots";
import { salon } from "@/lib/salon.config";

type Filter = "pending" | "today" | "upcoming" | "all";

type Props = {
  initialBookings: Booking[];
  services: Service[];
};

function normPhone(phone: string) {
  return phone.replace(/\D/g, "").replace(/^0/, "94");
}

function waDigits(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("0") ? `94${digits.slice(1)}` : digits;
}

export function AdminBookings({ initialBookings, services }: Props) {
  const [bookings, setBookings] = useState(initialBookings);
  const [filter, setFilter] = useState<Filter>("today");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState("");
  const [rescheduleId, setRescheduleId] = useState("");
  const [dateKey, setDateKey] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [walkIn, setWalkIn] = useState({
    serviceId: services.find((s) => s.isActive)?.id || "",
    customerName: "",
    customerPhone: "",
    date: toDateKey(new Date()),
    startsAt: "",
    notes: "",
  });
  const [walkSlots, setWalkSlots] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState("");
  const knownPending = useRef(new Set(initialBookings.filter((b) => b.status === "pending").map((b) => b.id)));
  const [pendingFlash, setPendingFlash] = useState(0);

  const todayKey = toDateKey(new Date());
  const activeServices = services.filter((s) => s.isActive);

  const serviceMap = useMemo(() => {
    const m = new Map(services.map((s) => [s.id, s]));
    return m;
  }, [services]);

  const visitCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const b of bookings) {
      const key = normPhone(b.customerPhone);
      if (!key) continue;
      m.set(key, (m.get(key) || 0) + 1);
    }
    return m;
  }, [bookings]);

  const todayStats = useMemo(() => {
    const today = bookings.filter((b) => toDateKey(new Date(b.startsAt)) === todayKey);
    return {
      pending: today.filter((b) => b.status === "pending").length,
      confirmed: today.filter((b) => b.status === "confirmed").length,
      completed: today.filter((b) => b.status === "completed").length,
      total: today.length,
    };
  }, [bookings, todayKey]);

  const pendingCount = useMemo(
    () => bookings.filter((b) => b.status === "pending").length,
    [bookings],
  );

  const nextCustomerId = useMemo(() => {
    const now = Date.now();
    const next = bookings
      .filter((b) => b.status === "confirmed" && new Date(b.startsAt).getTime() >= now - 60_000)
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())[0];
    return next?.id || "";
  }, [bookings]);

  const visible = useMemo(() => {
    const now = Date.now();
    const q = search.trim().toLowerCase();
    return bookings
      .filter((b) => {
        if (filter === "pending") return b.status === "pending";
        if (b.status === "cancelled" || b.status === "no_show") return filter === "all";
        if (filter === "today") return toDateKey(new Date(b.startsAt)) === todayKey;
        if (filter === "upcoming") return new Date(b.startsAt).getTime() >= now - 60_000;
        return true;
      })
      .filter((b) => {
        if (!q) return true;
        return (
          b.customerName.toLowerCase().includes(q) ||
          b.customerPhone.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  }, [bookings, filter, todayKey, search]);

  // Poll for new pending bookings
  useEffect(() => {
    let cancelled = false;
    async function tick() {
      try {
        const res = await fetch("/api/bookings");
        if (!res.ok) return;
        const data = (await res.json()) as Booking[];
        if (cancelled) return;
        const pendingIds = data.filter((b) => b.status === "pending").map((b) => b.id);
        const fresh = pendingIds.filter((id) => !knownPending.current.has(id));
        if (fresh.length > 0) {
          setPendingFlash((n) => n + fresh.length);
          if (typeof window !== "undefined" && "Notification" in window) {
            if (Notification.permission === "granted") {
              new Notification(`${salon.name}: new booking`, {
                body: `${fresh.length} pending booking(s) need a decision.`,
              });
            }
          }
          try {
            const ctx = new AudioContext();
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.connect(g);
            g.connect(ctx.destination);
            o.frequency.value = 880;
            g.gain.value = 0.05;
            o.start();
            o.stop(ctx.currentTime + 0.15);
          } catch {
            /* ignore audio errors */
          }
        }
        knownPending.current = new Set(pendingIds);
        setBookings(data);
        window.dispatchEvent(new Event("admin-bookings-changed"));
      } catch {
        /* ignore */
      }
    }
    const id = window.setInterval(tick, 25000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

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
      window.dispatchEvent(new Event("admin-bookings-changed"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusyId("");
    }
  }

  async function saveNotes(b: Booking) {
    const notes = (noteDraft[b.id] ?? b.notes ?? "").trim();
    setBusyId(b.id);
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: b.id, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save notes");
      setBookings((prev) => prev.map((x) => (x.id === b.id ? data : x)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save notes");
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

  async function loadWalkSlots(serviceId: string, day: string) {
    if (!serviceId || !day) {
      setWalkSlots([]);
      return;
    }
    const res = await fetch(`/api/slots?serviceId=${serviceId}&date=${day}`);
    const data = await res.json();
    setWalkSlots(data.slots || []);
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

  async function submitWalkIn(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!walkIn.startsAt) {
      setError("Pick a time slot");
      return;
    }
    setBusyId("walk-in");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walkIn: true,
          serviceId: walkIn.serviceId,
          customerName: walkIn.customerName,
          customerPhone: walkIn.customerPhone,
          startsAt: walkIn.startsAt,
          notes: walkIn.notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Walk-in failed");
      setBookings((prev) => [...prev, data]);
      setShowWalkIn(false);
      setWalkIn((w) => ({
        ...w,
        customerName: "",
        customerPhone: "",
        startsAt: "",
        notes: "",
      }));
      setWalkSlots([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Walk-in failed");
    } finally {
      setBusyId("");
    }
  }

  function waLink(phone: string, text: string) {
    return `https://wa.me/${waDigits(phone)}?text=${encodeURIComponent(text)}`;
  }

  function confirmMessage(b: Booking) {
    const svc = serviceMap.get(b.serviceId)?.name || "appointment";
    return `Hi ${b.customerName}, your ${svc} at ${salon.name} is confirmed for ${formatBookingWhen(b.startsAt)}. See you then!`;
  }

  async function copyDetails(b: Booking) {
    const svc = serviceMap.get(b.serviceId)?.name || "Service";
    const text = `${b.customerName} · ${svc} · ${formatBookingWhen(b.startsAt)} · ${b.customerPhone}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(b.id);
      window.setTimeout(() => setCopiedId(""), 1500);
    } catch {
      setError("Could not copy");
    }
  }

  function requestNotify() {
    if (typeof window !== "undefined" && "Notification" in window) {
      void Notification.requestPermission();
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-line bg-white px-4 py-3 text-sm">
        <p className="font-semibold">Today</p>
        <p className="mt-1 text-mute">
          {todayStats.pending} pending · {todayStats.confirmed} confirmed ·{" "}
          {todayStats.completed} done · {todayStats.total} total
        </p>
        {pendingCount > 0 && (
          <p className="mt-2 text-warn font-semibold">
            {pendingCount} pending overall
            {pendingFlash > 0 ? ` · +${pendingFlash} new this session` : ""}
          </p>
        )}
        <button type="button" className="mt-2 text-xs underline text-mute" onClick={requestNotify}>
          Enable browser alerts
        </button>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className="btn btn-accent flex-1 text-sm"
          onClick={() => {
            setShowWalkIn((v) => !v);
            if (!showWalkIn && walkIn.serviceId) {
              void loadWalkSlots(walkIn.serviceId, walkIn.date);
            }
          }}
        >
          {showWalkIn ? "Close walk-in" : "Walk-in booking"}
        </button>
      </div>

      {showWalkIn && (
        <form onSubmit={submitWalkIn} className="space-y-3 rounded-2xl border border-line bg-white p-4">
          <p className="font-semibold">Add walk-in</p>
          <label className="block text-sm">
            Service
            <select
              className="field mt-1"
              value={walkIn.serviceId}
              onChange={(e) => {
                const serviceId = e.target.value;
                setWalkIn((w) => ({ ...w, serviceId, startsAt: "" }));
                void loadWalkSlots(serviceId, walkIn.date);
              }}
              required
            >
              {activeServices.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Name
            <input
              className="field mt-1"
              value={walkIn.customerName}
              onChange={(e) => setWalkIn((w) => ({ ...w, customerName: e.target.value }))}
              required
            />
          </label>
          <label className="block text-sm">
            Phone
            <input
              className="field mt-1"
              value={walkIn.customerPhone}
              onChange={(e) => setWalkIn((w) => ({ ...w, customerPhone: e.target.value }))}
              required
            />
          </label>
          <label className="block text-sm">
            Date
            <input
              type="date"
              className="field mt-1"
              value={walkIn.date}
              onChange={(e) => {
                const date = e.target.value;
                setWalkIn((w) => ({ ...w, date, startsAt: "" }));
                void loadWalkSlots(walkIn.serviceId, date);
              }}
              required
            />
          </label>
          <div>
            <p className="text-sm mb-2">Time</p>
            <div className="grid grid-cols-3 gap-2">
              {walkSlots.map((iso) => (
                <button
                  key={iso}
                  type="button"
                  className={`rounded-lg px-2 py-2 text-xs border ${
                    walkIn.startsAt === iso ? "bg-ink text-stone" : "bg-white border-line"
                  }`}
                  onClick={() => setWalkIn((w) => ({ ...w, startsAt: iso }))}
                >
                  {formatSlotLabel(iso)}
                </button>
              ))}
            </div>
            {walkSlots.length === 0 && (
              <p className="mt-2 text-xs text-mute">No free slots — pick another day.</p>
            )}
          </div>
          <label className="block text-sm">
            Notes
            <input
              className="field mt-1"
              value={walkIn.notes}
              onChange={(e) => setWalkIn((w) => ({ ...w, notes: e.target.value }))}
            />
          </label>
          <button type="submit" className="btn btn-primary w-full" disabled={busyId === "walk-in"}>
            Save walk-in
          </button>
        </form>
      )}

      <input
        className="field"
        placeholder="Search name or phone"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid grid-cols-4 gap-2">
        {(
          [
            ["pending", "Pending"],
            ["today", "Today"],
            ["upcoming", "Next"],
            ["all", "All"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-xl py-2 text-xs font-semibold ${
              filter === key ? "bg-copper text-ink" : "bg-white border border-line"
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
        const visits = visitCounts.get(normPhone(b.customerPhone)) || 1;
        const isNext = b.id === nextCustomerId;
        return (
          <article
            key={b.id}
            className={`rounded-2xl border bg-white p-4 ${
              isNext ? "border-copper ring-2 ring-copper/30" : "border-line"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                {isNext && (
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-copper-deep">
                    Next customer
                  </p>
                )}
                <p className="text-lg font-semibold">{b.customerName}</p>
                <p className="text-sm text-mute">{formatBookingWhen(b.startsAt)}</p>
                <p className="mt-1 text-sm">
                  {svc?.name || "Service"} · LKR {svc?.priceLkr.toLocaleString("en-LK") ?? "—"}
                </p>
                {visits > 1 && (
                  <p className="mt-1 text-xs font-medium text-copper-deep">
                    Seen before ({visits} visits)
                  </p>
                )}
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${
                  b.status === "pending"
                    ? "bg-warn/15 text-warn"
                    : b.status === "confirmed"
                      ? "bg-ok/15 text-ok"
                      : b.status === "completed"
                        ? "bg-sand text-mute"
                        : b.status === "no_show"
                          ? "bg-warn/10 text-warn"
                          : "bg-danger/10 text-danger"
                }`}
              >
                {b.status.replace("_", " ")}
              </span>
            </div>

            <label className="mt-3 block text-sm">
              Notes
              <textarea
                className="field mt-1 min-h-[2.5rem] text-sm"
                rows={2}
                value={noteDraft[b.id] ?? b.notes ?? ""}
                onChange={(e) =>
                  setNoteDraft((d) => ({ ...d, [b.id]: e.target.value }))
                }
                placeholder="e.g. wants fade, with kid"
              />
            </label>
            <button
              type="button"
              className="mt-1 text-xs font-semibold text-copper-deep underline"
              disabled={busyId === b.id}
              onClick={() => saveNotes(b)}
            >
              Save notes
            </button>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <a href={`tel:${b.customerPhone}`} className="btn btn-ghost text-sm">
                Call
              </a>
              <a
                href={waLink(
                  b.customerPhone,
                  `Hi ${b.customerName}, this is ${salon.name} about your appointment.`,
                )}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost text-sm"
              >
                WhatsApp
              </a>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              {b.status === "pending" && (
                <>
                  <button
                    type="button"
                    disabled={busyId === b.id}
                    className="btn btn-primary text-sm"
                    onClick={() => setStatus(b.id, "confirmed")}
                  >
                    Confirm
                  </button>
                  <a
                    href={waLink(b.customerPhone, confirmMessage({ ...b, status: "confirmed" }))}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-accent text-sm"
                    onClick={() => void setStatus(b.id, "confirmed")}
                  >
                    Confirm + WA
                  </a>
                </>
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
              {b.status === "confirmed" && (
                <a
                  href={waLink(b.customerPhone, confirmMessage(b))}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-ghost text-sm"
                >
                  WA confirm text
                </a>
              )}
              {b.status !== "cancelled" && b.status !== "no_show" && (
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
                <>
                  <button
                    type="button"
                    disabled={busyId === b.id}
                    className="btn btn-ghost text-sm"
                    onClick={() => setStatus(b.id, "no_show")}
                  >
                    No-show
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost text-sm"
                    onClick={() => loadSlots(b, toDateKey(new Date(b.startsAt)))}
                  >
                    Reschedule
                  </button>
                </>
              )}
              <button
                type="button"
                className="btn btn-ghost text-sm"
                onClick={() => copyDetails(b)}
              >
                {copiedId === b.id ? "Copied" : "Copy"}
              </button>
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
