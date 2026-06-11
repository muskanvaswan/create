"use client";

import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  canRegister: boolean;
};

export function AdminLogin({ canRegister }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  // Set when the host can't persist the credential (e.g. Vercel): the JSON the
  // owner must store in the PASSKEY_CREDENTIAL environment variable.
  const [credentialEnv, setCredentialEnv] = useState<string | null>(null);

  const run = async (flow: "register" | "login") => {
    setBusy(true);
    setError(null);
    try {
      const optionsRes = await fetch(`/api/auth/${flow}-options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: flow === "register" ? JSON.stringify({ password }) : undefined,
      });
      if (!optionsRes.ok) {
        throw new Error((await optionsRes.json()).error ?? "Request failed");
      }
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
      if (!result.verified) {
        throw new Error("Passkey could not be verified");
      }
      if (result.credentialEnv) {
        setCredentialEnv(result.credentialEnv);
        return;
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  if (credentialEnv) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="text-5xl" aria-hidden="true">
          🔑
        </span>
        <h1 className="text-2xl font-bold">One last step</h1>
        <p className="max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
          Your passkey was created, but this host can&apos;t save it to disk.
          Add an environment variable named{" "}
          <code className="font-mono">PASSKEY_CREDENTIAL</code> with the value
          below, then redeploy.
        </p>
        <textarea
          readOnly
          value={credentialEnv}
          onFocus={(e) => e.target.select()}
          rows={5}
          className="w-full max-w-sm rounded-lg border border-neutral-300 bg-white/60 p-2 font-mono text-xs dark:border-neutral-600 dark:bg-black/30"
        />
        <button
          onClick={() => navigator.clipboard.writeText(credentialEnv)}
          className="rounded-full bg-[#e0a30c] px-6 py-2.5 text-[15px] font-semibold text-white shadow-md hover:bg-[#c89209] dark:bg-[#a17321] dark:hover:bg-[#b5832a]"
        >
          Copy to clipboard
        </button>
        <button
          onClick={() => router.refresh()}
          className="text-sm text-neutral-500 underline dark:text-neutral-400"
        >
          Continue to editor
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="text-5xl" aria-hidden="true">
        🔒
      </span>
      <h1 className="text-2xl font-bold">Locked Notes</h1>
      <p className="max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
        {canRegister
          ? "No passkey is set up yet. Enter the setup password, then create a passkey with Touch ID or your device's screen lock to claim this editor."
          : "Use your passkey to unlock the editor."}
      </p>
      {canRegister && (
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Setup password"
          autoComplete="off"
          className="w-full max-w-[16rem] rounded-full border border-neutral-300 bg-white/60 px-4 py-2 text-center text-[15px] outline-none focus:border-[#e0a30c] dark:border-neutral-600 dark:bg-black/30 dark:focus:border-[#a17321]"
        />
      )}
      <button
        onClick={() => run(canRegister ? "register" : "login")}
        disabled={busy}
        className="rounded-full bg-[#e0a30c] px-6 py-2.5 text-[15px] font-semibold text-white shadow-md hover:bg-[#c89209] disabled:opacity-50 dark:bg-[#a17321] dark:hover:bg-[#b5832a]"
      >
        {busy
          ? "Waiting for passkey..."
          : canRegister
            ? "Create passkey"
            : "Sign in with passkey"}
      </button>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
