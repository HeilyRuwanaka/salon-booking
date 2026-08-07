"use client";

import { useState } from "react";
import type { ClosedDay } from "@/lib/types";

export function AdminClosedDays({ initial }: { initial: ClosedDay[] }) {
  const [days, setDays] = useState(initial);
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  async function addDay() {
    setError("");
    const res = await fetch("/api/closed-days", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, reason }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    setDays((prev) => [...prev, data].sort((a, b) => a.date.localeCompare(b.date)));
    setDate("");
    setReason("");
  }

  async function remove(id: string) {
    const res = await fetch(`/api/closed-days?id=${id}`, { method: "DELETE" });
    if (!res.ok) return;
    setDays((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-mute">
        Close the salon when sick or busy. Customers will not see free slots on those days.
        Reschedule existing bookings from the Bookings tab.
      </p>
      <label className="block text-sm">
        Date
        <input
          type="date"
          className="field mt-1"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>
      <label className="block text-sm">
        Reason (optional)
        <input
          className="field mt-1"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Sick / family / busy"
        />
      </label>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button type="button" className="btn btn-primary w-full" disabled={!date} onClick={addDay}>
        Close this day
      </button>

      <ul className="space-y-2">
        {days.map((d) => (
          <li
            key={d.id}
            className="flex items-center justify-between rounded-2xl border border-line bg-white px-4 py-3"
          >
            <div>
              <p className="font-semibold">{d.date}</p>
              {d.reason && <p className="text-sm text-mute">{d.reason}</p>}
            </div>
            <button type="button" className="text-sm text-danger underline" onClick={() => remove(d.id)}>
              Reopen
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
