import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { NextRequest, NextResponse } from "next/server";
import type { AuthenticatorTransportFuture } from "@simplewebauthn/server";
import {
  CHALLENGE_COOKIE,
  SESSION_COOKIE,
  createSessionValue,
  expectedOrigin,
  expectedRpID,
  loadCredential,
  readChallengeValue,
  saveCredential,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  const credential = loadCredential();
  if (!credential) {
    return NextResponse.json({ error: "No passkey registered" }, { status: 404 });
  }

  const challenge = readChallengeValue(req.cookies.get(CHALLENGE_COOKIE)?.value);
  if (!challenge) {
    return NextResponse.json({ error: "Challenge expired" }, { status: 400 });
  }

  const body = await req.json();
  const verification = await verifyAuthenticationResponse({
    response: body,
    expectedChallenge: challenge,
    expectedOrigin: expectedOrigin(req),
    expectedRPID: expectedRpID(req),
    credential: {
      id: credential.id,
      publicKey: new Uint8Array(Buffer.from(credential.publicKey, "base64url")),
      counter: credential.counter,
      transports: credential.transports as
        | AuthenticatorTransportFuture[]
        | undefined,
    },
  });

  if (!verification.verified) {
    return NextResponse.json({ verified: false }, { status: 401 });
  }

  saveCredential({
    ...credential,
    counter: verification.authenticationInfo.newCounter,
  });

  const res = NextResponse.json({ verified: true });
  res.cookies.delete(CHALLENGE_COOKIE);
  res.cookies.set(SESSION_COOKIE, createSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });
  return res;
}
