"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Service } from "@/lib/types";
import { formatSlotLabel } from "@/lib/slots";

type Props = {
  services: Service[];
  initialServiceId?: string;
};

function nextDays(count: number) {
  const days: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const key = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Colombo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
    const label = new Intl.DateTimeFormat("en-LK", {
      timeZone: "Asia/Colombo",
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(d);
    days.push({ key, label });
  }
  return days;
}

export function BookingWizard({ services, initialServiceId }: Props) {
  const router = useRouter();
  const days = useMemo(() => nextDays(14), []);
  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState(initialServiceId || "");
  const [dateKey, setDateKey] = useState(days[0]?.key || "");
  const [slots, setSlots] = useState<string[]>([]);
  const [closed, setClosed] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [startsAt, setStartsAt] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const service = services.find((s) => s.id === serviceId);

  useEffect(() => {
    if (!serviceId || !dateKey) return;
    let cancelled = false;
    setLoadingSlots(true);
    setStartsAt("");
    fetch(`/api/slots?serviceId=${serviceId}&date=${dateKey}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setSlots(data.slots || []);
        setClosed(Boolean(data.closed));
      })
      .catch(() => {
        if (!cancelled) setError("Could not load times");
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [serviceId, dateKey]);

  async function submit() {
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          customerName: name,
          customerPhone: phone,
          startsAt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");
      router.push(`/book/success?id=${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <ol className="mb-8 flex gap-2 text-sm">
        {["Service", "Date & time", "Your details"].map((label, i) => {
          const n = i + 1;
          const active = step === n;
          const done = step > n;
          return (
            <li
              key={label}
              className={`flex-1 rounded-full px-3 py-2 text-center ${
                active
                  ? "bg-ink text-stone"
                  : done
                    ? "bg-copper text-white"
                    : "bg-sand text-mute"
              }`}
            >
              {n}. {label}
            </li>
          );
        })}
      </ol>

      {step === 1 && (
        <div className="space-y-3">
          <h2 className="font-display text-2xl">Select a service</h2>
          {services.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setServiceId(s.id)}
              className={`w-full rounded-2xl border p-4 text-left transition ${
                serviceId === s.id
                  ? "border-copper bg-white shadow-sm"
                  : "border-line bg-white/60 hover:border-copper/50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-sm text-mute">{s.durationMinutes} min</p>
                </div>
                <p className="font-semibold">LKR {s.priceLkr.toLocaleString("en-LK")}</p>
              </div>
            </button>
          ))}
          <button
            type="button"
            className="btn btn-primary w-full"
            disabled={!serviceId}
            onClick={() => setStep(2)}
          >
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="font-display text-2xl">Pick date &amp; time</h2>
          <p className="text-sm text-mute">
            {service?.name} · {service?.durationMinutes} min
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {days.map((d) => (
              <button
                key={d.key}
                type="button"
                onClick={() => setDateKey(d.key)}
                className={`min-w-[5.5rem] rounded-2xl border px-3 py-3 text-sm ${
                  dateKey === d.key
                    ? "border-copper bg-ink text-stone"
                    : "border-line bg-white"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {loadingSlots && <p className="text-mute">Loading free times…</p>}
          {!loadingSlots && closed && (
            <p className="rounded-2xl bg-sand px-4 py-3 text-sm">
              Salon is closed this day. Please choose another date.
            </p>
          )}
          {!loadingSlots && !closed && slots.length === 0 && (
            <p className="rounded-2xl bg-sand px-4 py-3 text-sm">
              No free slots this day. Try another date.
            </p>
          )}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((iso) => (
              <button
                key={iso}
                type="button"
                onClick={() => setStartsAt(iso)}
                className={`rounded-xl border px-2 py-3 text-sm ${
                  startsAt === iso
                    ? "border-copper bg-copper text-white"
                    : "border-line bg-white"
                }`}
              >
                {formatSlotLabel(iso)}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button type="button" className="btn btn-ghost flex-1" onClick={() => setStep(1)}>
              Back
            </button>
            <button
              type="button"
              className="btn btn-primary flex-1"
              disabled={!startsAt}
              onClick={() => setStep(3)}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="font-display text-2xl">Your details</h2>
          <p className="text-sm text-mute">
            {service?.name} · {formatSlotLabel(startsAt)} on{" "}
            {days.find((d) => d.key === dateKey)?.label}
          </p>
          <label className="block">
            <span className="mb-1 block text-sm text-mute">Name</span>
            <input
              className="field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-mute">Phone (WhatsApp)</span>
            <input
              className="field"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="07X XXX XXXX"
              inputMode="tel"
              autoComplete="tel"
            />
          </label>
          {error && (
            <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
          )}
          <div className="flex gap-2">
            <button type="button" className="btn btn-ghost flex-1" onClick={() => setStep(2)}>
              Back
            </button>
            <button
              type="button"
              className="btn btn-accent flex-1"
              disabled={!name.trim() || !phone.trim() || submitting}
              onClick={submit}
            >
              {submitting ? "Booking…" : "Confirm request"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
