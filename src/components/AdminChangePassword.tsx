"use client";

import { useState } from "react";
import { PasswordField } from "@/components/PasswordField";

export function AdminChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setDone(false);
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not change password");
      setDone(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not change password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-line bg-white p-4">
      <h2 className="font-semibold">Change admin password</h2>
      <p className="text-sm text-mute">
        Choose a new password for the admin panel.
      </p>

      <label className="block text-sm">
        Current password
        <PasswordField
          value={currentPassword}
          onChange={setCurrentPassword}
          autoComplete="current-password"
          required
        />
      </label>
      <label className="block text-sm">
        New password
        <PasswordField
          value={newPassword}
          onChange={setNewPassword}
          autoComplete="new-password"
          minLength={6}
          required
        />
      </label>
      <label className="block text-sm">
        Confirm new password
        <PasswordField
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
          minLength={6}
          required
        />
      </label>

      {error && (
        <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
      )}
      {done && (
        <p className="rounded-xl bg-ok/10 px-3 py-2 text-sm text-ok">
          Password updated. Use the new one next time you log in.
        </p>
      )}

      <button type="submit" className="btn btn-primary w-full" disabled={busy}>
        {busy ? "Saving…" : "Save new password"}
      </button>
    </form>
  );
}
