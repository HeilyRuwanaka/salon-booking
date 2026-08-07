"use client";

import { useState } from "react";
import type { Service } from "@/lib/types";

export function AdminServices({ initial }: { initial: Service[] }) {
  const [services, setServices] = useState(initial);
  const [name, setName] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [priceLkr, setPriceLkr] = useState(800);

  async function save(payload: Partial<Service> & { name: string; durationMinutes: number; priceLkr: number }) {
    const res = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok) setServices(data);
  }

  async function toggle(s: Service) {
    await save({ ...s, isActive: !s.isActive });
  }

  async function add() {
    if (!name.trim()) return;
    await save({ name, durationMinutes, priceLkr, isActive: true });
    setName("");
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-mute">
        Update prices and times here when your friend confirms the real list.
      </p>

      <div className="rounded-2xl border border-line bg-white p-4 space-y-3">
        <p className="font-semibold">Add service</p>
        <input
          className="field"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-2">
          <label className="text-sm">
            Minutes
            <input
              type="number"
              className="field mt-1"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
            />
          </label>
          <label className="text-sm">
            Price LKR
            <input
              type="number"
              className="field mt-1"
              value={priceLkr}
              onChange={(e) => setPriceLkr(Number(e.target.value))}
            />
          </label>
        </div>
        <button type="button" className="btn btn-primary w-full" onClick={add}>
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {services.map((s) => (
          <li key={s.id} className="rounded-2xl border border-line bg-white px-4 py-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{s.name}</p>
                <p className="text-sm text-mute">
                  {s.durationMinutes} min · LKR {s.priceLkr.toLocaleString("en-LK")}
                </p>
              </div>
              <button
                type="button"
                className={`text-sm font-semibold ${s.isActive ? "text-ok" : "text-mute"}`}
                onClick={() => toggle(s)}
              >
                {s.isActive ? "Active" : "Hidden"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
