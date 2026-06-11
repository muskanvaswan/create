import crypto from "crypto";
import fs from "fs";
import { join } from "path";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export const SESSION_COOKIE = "notes_session";
export const CHALLENGE_COOKIE = "notes_challenge";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// Credential and signing secret live outside the repo content; _auth/ is gitignored.
const authDir = join(process.cwd(), "_auth");
const credentialPath = join(authDir, "passkey.json");
const secretPath = join(authDir, "secret");

export type StoredCredential = {
  id: string;
  publicKey: string;
  counter: number;
  transports?: string[];
};

function getSecret(): Buffer {
  const fromEnv = process.env.AUTH_SECRET;
  if (fromEnv) return Buffer.from(fromEnv);
  try {
    if (!fs.existsSync(secretPath)) {
      fs.mkdirSync(authDir, { recursive: true });
      fs.writeFileSync(secretPath, crypto.randomBytes(32).toString("hex"), {
        mode: 0o600,
      });
    }
    return Buffer.from(fs.readFileSync(secretPath, "utf8").trim(), "hex");
  } catch {
    throw new Error(
      "No writable filesystem for the signing secret. Set the AUTH_SECRET environment variable.",
    );
  }
}

function sign(value: string): string {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("base64url");
}

export function constantTimeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

export function hasRegisteredPasskey(): boolean {
  return Boolean(process.env.PASSKEY_CREDENTIAL) || fs.existsSync(credentialPath);
}

export function loadCredential(): StoredCredential | null {
  const fromEnv = process.env.PASSKEY_CREDENTIAL;
  if (fromEnv) return JSON.parse(fromEnv) as StoredCredential;
  if (!fs.existsSync(credentialPath)) return null;
  return JSON.parse(fs.readFileSync(credentialPath, "utf8")) as StoredCredential;
}

/**
 * Persists the credential to disk when possible. Returns false on read-only
 * hosts (e.g. Vercel), where the credential must be stored in the
 * PASSKEY_CREDENTIAL environment variable instead.
 */
export function trySaveCredential(credential: StoredCredential): boolean {
  try {
    fs.mkdirSync(authDir, { recursive: true });
    fs.writeFileSync(credentialPath, JSON.stringify(credential, null, 2), {
      mode: 0o600,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Registration gate. With SETUP_PASSWORD set, the provided password must
 * match. Without it, registration is only open in local development.
 */
export function isSetupAllowed(password: string | undefined): boolean {
  const expected = process.env.SETUP_PASSWORD;
  if (expected) return Boolean(password) && constantTimeEqual(password!, expected);
  return process.env.NODE_ENV !== "production";
}

/** "expiry.signature" value for the session cookie. */
export function createSessionValue(): string {
  const expiry = String(Date.now() + SESSION_TTL_MS);
  return `${expiry}.${sign(`session:${expiry}`)}`;
}

export function isValidSessionValue(value: string | undefined): boolean {
  if (!value) return false;
  const [expiry, signature] = value.split(".");
  if (!expiry || !signature) return false;
  if (Number(expiry) < Date.now()) return false;
  return constantTimeEqual(signature, sign(`session:${expiry}`));
}

/** Session check for server components. */
export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return isValidSessionValue(store.get(SESSION_COOKIE)?.value);
}

/** Session check for route handlers. */
export function isAuthenticatedRequest(req: NextRequest): boolean {
  return isValidSessionValue(req.cookies.get(SESSION_COOKIE)?.value);
}

/** Signed value for the short-lived WebAuthn challenge cookie. */
export function createChallengeValue(challenge: string): string {
  return `${challenge}.${sign(`challenge:${challenge}`)}`;
}

export function readChallengeValue(value: string | undefined): string | null {
  if (!value) return null;
  const [challenge, signature] = value.split(".");
  if (!challenge || !signature) return null;
  if (!constantTimeEqual(signature, sign(`challenge:${challenge}`))) return null;
  return challenge;
}

export function expectedRpID(req: NextRequest): string {
  return req.nextUrl.hostname;
}

export function expectedOrigin(req: NextRequest): string {
  return req.nextUrl.origin;
}
