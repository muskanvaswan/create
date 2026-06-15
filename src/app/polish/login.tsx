"use client";

import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function PolishLogin({ hasPasskey }: { hasPasskey: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "password" | "passkey">(null);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [credentialEnv, setCredentialEnv] = useState<string | null>(null);

  const signInWithPassword = async () => {
    setBusy("password");
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
      setBusy(null);
    }
  };

  const runPasskey = async (flow: "register" | "login") => {
    setBusy("passkey");
    setError(null);
    try {
      const optionsRes = await fetch(`/api/auth/${flow}-options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: flow === "register" ? JSON.stringify({ password }) : undefined,
      });
      if (!optionsRes.ok) throw new Error((await optionsRes.json()).error ?? "Request failed");
      const optionsJSON = await optionsRes.json();

      const credential =
        flow === "register"
          ? await startRegistration({ optionsJSON })
          : await startAuthentication({ optionsJSON });

      const verifyRes = await fetch(`/api/auth/${flow}-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credential),
      });
      const result = await verifyRes.json();
      if (!result.verified) throw new Error("Passkey could not be verified");
      if (result.credentialEnv) { setCredentialEnv(result.credentialEnv); return; }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(null);
    }
  };

  // ── Post-registration: credential env display ────────────────────────────
  if (credentialEnv) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-lg border border-[#2e2e2e] bg-[#0a0a0a] px-8 py-10">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[#666]">
            Polish
          </p>
          <h1 className="text-[17px] font-semibold text-white">Passkey created</h1>
          <p className="mt-2 text-[13px] leading-relaxed text-[#666]">
            This host can&apos;t persist the credential to disk. Add the environment variable{" "}
            <code className="font-mono text-[#888]">PASSKEY_CREDENTIAL</code> with the value
            below, then redeploy.
          </p>
          <textarea
            readOnly
            value={credentialEnv}
            onFocus={(e) => e.target.select()}
            rows={4}
            className="mt-4 w-full rounded-md border border-[#2e2e2e] bg-[#111] px-3 py-2 font-mono text-[11px] text-[#aaa] outline-none"
          />
          <button
            onClick={() => navigator.clipboard.writeText(credentialEnv)}
            className="mt-3 w-full rounded-md bg-white py-2 text-[13px] font-semibold text-black transition-opacity hover:opacity-90"
          >
            Copy to clipboard
          </button>
          <button
            onClick={() => router.refresh()}
            className="mt-3 w-full text-center text-[12px] text-[#555] underline hover:text-[#888]"
          >
            Continue to dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Login ────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-[#2e2e2e] bg-[#0a0a0a] px-8 py-10">
        <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[#666]">
          Polish
        </p>
        <h1 className="text-[17px] font-semibold text-white">Friction Dashboard</h1>
        <p className="mt-1.5 text-[13px] text-[#666]">
          {hasPasskey
            ? "Enter your password, or sign in with your passkey."
            : "Enter your password to continue. You can also create a passkey for this device."}
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && signInWithPassword()}
            placeholder="Password"
            autoComplete="current-password"
            className="w-full rounded-md border border-[#2e2e2e] bg-[#111] px-3 py-2 text-[13px] text-white outline-none placeholder:text-[#444] focus:border-[#555]"
          />
          <button
            onClick={signInWithPassword}
            disabled={busy !== null}
            className="w-full rounded-md bg-white py-2 text-[13px] font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {busy === "password" ? "Signing in…" : "Sign in"}
          </button>

          <div className="flex items-center gap-3 text-[11px] text-[#555]">
            <span className="h-px flex-1 bg-[#2e2e2e]" />
            or
            <span className="h-px flex-1 bg-[#2e2e2e]" />
          </div>

          <button
            onClick={() => runPasskey(hasPasskey ? "login" : "register")}
            disabled={busy !== null}
            className="w-full rounded-md border border-[#2e2e2e] bg-transparent py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#111] disabled:opacity-40"
          >
            {busy === "passkey"
              ? "Waiting for passkey…"
              : hasPasskey
                ? "Sign in with passkey"
                : "Create passkey"}
          </button>
        </div>

        {error && <p className="mt-3 text-[12px] text-red-400">{error}</p>}
      </div>
    </div>
  );
}
