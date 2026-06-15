"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLogin() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        throw new Error((await res.json()).error ?? "Invalid password");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="text-5xl" aria-hidden="true">
        🔒
      </span>
      <h1 className="text-2xl font-bold">Locked Notes</h1>
      <p className="max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
        Enter your password to unlock the editor.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoComplete="current-password"
          className="w-full max-w-[16rem] rounded-full border border-neutral-300 bg-white/60 px-4 py-2 text-center text-[15px] outline-none focus:border-[#e0a30c] dark:border-neutral-600 dark:bg-black/30 dark:focus:border-[#a17321]"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-[#e0a30c] px-6 py-2.5 text-[15px] font-semibold text-white shadow-md hover:bg-[#c89209] disabled:opacity-50 dark:bg-[#a17321] dark:hover:bg-[#b5832a]"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
