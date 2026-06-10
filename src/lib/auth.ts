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
  if (!fs.existsSync(secretPath)) {
    fs.mkdirSync(authDir, { recursive: true });
    fs.writeFileSync(secretPath, crypto.randomBytes(32).toString("hex"), {
      mode: 0o600,
    });
  }
  return Buffer.from(fs.readFileSync(secretPath, "utf8").trim(), "hex");
}

function sign(value: string): string {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function constantTimeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

export function hasRegisteredPasskey(): boolean {
  return fs.existsSync(credentialPath);
}

export function loadCredential(): StoredCredential | null {
  if (!hasRegisteredPasskey()) return null;
  return JSON.parse(fs.readFileSync(credentialPath, "utf8")) as StoredCredential;
}

export function saveCredential(credential: StoredCredential): void {
  fs.mkdirSync(authDir, { recursive: true });
  fs.writeFileSync(credentialPath, JSON.stringify(credential, null, 2), {
    mode: 0o600,
  });
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
