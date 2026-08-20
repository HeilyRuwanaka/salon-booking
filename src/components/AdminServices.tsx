"use client";

import { useState } from "react";
import type { Service } from "@/lib/types";

export function AdminServices({ initial }: { initial: Service[] }) {
  const [services, setServices] = useState(initial);
  const [name, setName] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [priceLkr, setPriceLkr] = useState(800);
  const [editingId, setEditingId] = useState("");
  const [editName, setEditName] = useState("");
  const [editMinutes, setEditMinutes] = useState(30);
  const [editPrice, setEditPrice] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save(payload: Partial<Service> & { name: string; durationMinutes: number; priceLkr: number }) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setServices(data);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function toggle(s: Service) {
    await save({ ...s, isActive: !s.isActive });
  }

  async function add() {
    if (!name.trim()) return;
    const ok = await save({ name, durationMinutes, priceLkr, isActive: true });
    if (ok) {
      setName("");
      setDurationMinutes(30);
      setPriceLkr(800);
    }
  }

  function startEdit(s: Service) {
    setEditingId(s.id);
    setEditName(s.name);
    setEditMinutes(s.durationMinutes);
    setEditPrice(s.priceLkr);
    setError("");
  }

  async function saveEdit(s: Service) {
    if (!editName.trim() || editMinutes < 5 || editPrice < 0) {
      setError("Check name, minutes, and price");
      return;
    }
    const ok = await save({
      id: s.id,
      name: editName.trim(),
      durationMinutes: editMinutes,
      priceLkr: editPrice,
      isActive: s.isActive,
      description: s.description,
    });
    if (ok) setEditingId("");
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-mute">
        Change name, minutes, or price anytime. Hide a service if you stop offering it.
      </p>

      {error && (
        <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
      )}

      <div className="space-y-3 rounded-2xl border border-line bg-white p-4">
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
        <button type="button" className="btn btn-primary w-full" disabled={busy} onClick={add}>
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {services.map((s) => (
          <li key={s.id} className="rounded-2xl border border-line bg-white px-4 py-3">
            {editingId === s.id ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-mute">Edit service</p>
                <input
                  className="field"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Name"
                />
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-sm">
                    Minutes
                    <input
                      type="number"
                      className="field mt-1"
                      value={editMinutes}
                      onChange={(e) => setEditMinutes(Number(e.target.value))}
                    />
                  </label>
                  <label className="text-sm">
                    Price LKR
                    <input
                      type="number"
                      className="field mt-1"
                      value={editPrice}
                      onChange={(e) => setEditPrice(Number(e.target.value))}
                    />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={busy}
                    onClick={() => setEditingId("")}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={busy}
                    onClick={() => saveEdit(s)}
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
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
                <button
                  type="button"
                  className="btn btn-ghost mt-3 w-full text-sm"
                  onClick={() => startEdit(s)}
                >
                  Edit name / time / price
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
