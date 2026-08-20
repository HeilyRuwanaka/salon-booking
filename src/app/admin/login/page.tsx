"use client";

import Image from "next/image";
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
    <div className="min-h-[100dvh] bg-stone">
      {/* Hero-style brand band — logo only, no buttons/copy */}
      <section className="relative h-52 overflow-hidden bg-[#010101] sm:h-60">
        <Image
          src={salon.heroImage}
          alt=""
          fill
          priority
          className="object-cover object-[center_30%] scale-105"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#010101] via-[#010101]/75 to-[#010101]/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#010101]/55 via-transparent to-transparent" />

        <div className="relative flex h-full items-end px-5 pb-6 sm:px-8 sm:pb-7">
          <div className="hero-logo-mark">
            <Image
              src={salon.logoMarkImage}
              alt={salon.name}
              width={320}
              height={256}
              priority
              className="h-auto w-40 object-contain object-left sm:w-48"
            />
            <div
              className="mt-4 h-px w-20 bg-gradient-to-r from-copper via-copper/70 to-transparent sm:w-24"
              aria-hidden
            />
          </div>
        </div>
      </section>

      {/* Login form — same as before */}
      <div className="mx-auto max-w-md px-4 py-8">
        <h1 className="text-xl font-semibold">Owner login</h1>
        <p className="mt-2 text-sm text-mute">
          Enter your password to open the admin panel.
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
    </div>
  );
}
