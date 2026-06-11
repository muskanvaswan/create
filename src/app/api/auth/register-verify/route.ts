import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { NextRequest, NextResponse } from "next/server";
import {
  CHALLENGE_COOKIE,
  SESSION_COOKIE,
  createSessionValue,
  expectedOrigin,
  expectedRpID,
  hasRegisteredPasskey,
  readChallengeValue,
  trySaveCredential,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (hasRegisteredPasskey()) {
    return NextResponse.json(
      { error: "A passkey is already registered" },
      { status: 403 },
    );
  }

  const challenge = readChallengeValue(req.cookies.get(CHALLENGE_COOKIE)?.value);
  if (!challenge) {
    return NextResponse.json({ error: "Challenge expired" }, { status: 400 });
  }

  const body = await req.json();
  const verification = await verifyRegistrationResponse({
    response: body,
    expectedChallenge: challenge,
    expectedOrigin: expectedOrigin(req),
    expectedRPID: expectedRpID(req),
  });

  if (!verification.verified || !verification.registrationInfo) {
    return NextResponse.json({ verified: false }, { status: 400 });
  }

  const { credential } = verification.registrationInfo;
  const stored = {
    id: credential.id,
    publicKey: Buffer.from(credential.publicKey).toString("base64url"),
    counter: credential.counter,
    transports: credential.transports,
  };
  const persisted = trySaveCredential(stored);

  // On read-only hosts the credential can't be written to disk; hand it back
  // so the owner can store it in the PASSKEY_CREDENTIAL environment variable.
  const res = NextResponse.json(
    persisted
      ? { verified: true }
      : { verified: true, credentialEnv: JSON.stringify(stored) },
  );
  res.cookies.delete(CHALLENGE_COOKIE);
  res.cookies.set(SESSION_COOKIE, createSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });
  return res;
}
