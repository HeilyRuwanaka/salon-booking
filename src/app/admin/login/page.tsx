"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PasswordField } from "@/components/PasswordField";
import { salon } from "@/lib/salon.config";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center px-4 py-10">
      <p className="font-display text-3xl">{salon.name}</p>
      <h1 className="mt-2 text-xl font-semibold">Owner login</h1>
      <p className="mt-2 text-sm text-mute">
        For the phone admin. Use the password from Settings (or the bootstrap
        ADMIN_PASSWORD until you change it once).
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm text-mute">Password</span>
          <PasswordField
            className="text-lg"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            inputMode="text"
          />
        </label>
        {error && (
          <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
        )}
        <button type="submit" className="btn btn-primary w-full text-lg" disabled={loading}>
          {loading ? "Signing in…" : "Open admin"}
        </button>
      </form>
    </div>
  );
}
