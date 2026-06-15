"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PolishLogin() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");

  const signIn = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Invalid password");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-[#2e2e2e] bg-[#0a0a0a] px-8 py-10">
        <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[#666]">
          Polish
        </p>
        <h1 className="text-[17px] font-semibold text-white">Friction Dashboard</h1>
        <p className="mt-1.5 text-[13px] text-[#666]">
          Enter your password to continue.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && signIn()}
            placeholder="Password"
            autoComplete="current-password"
            className="w-full rounded-md border border-[#2e2e2e] bg-[#111] px-3 py-2 text-[13px] text-white outline-none placeholder:text-[#444] focus:border-[#555]"
          />
          <button
            onClick={signIn}
            disabled={busy}
            className="w-full rounded-md bg-white py-2 text-[13px] font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </div>

        {error && <p className="mt-3 text-[12px] text-red-400">{error}</p>}
      </div>
    </div>
  );
}
