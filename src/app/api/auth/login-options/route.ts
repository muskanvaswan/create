import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { NextRequest, NextResponse } from "next/server";
import type { AuthenticatorTransportFuture } from "@simplewebauthn/server";
import {
  CHALLENGE_COOKIE,
  createChallengeValue,
  expectedRpID,
  loadCredential,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  const credential = loadCredential();
  if (!credential) {
    return NextResponse.json({ error: "No passkey registered" }, { status: 404 });
  }

  const options = await generateAuthenticationOptions({
    rpID: expectedRpID(req),
    userVerification: "preferred",
    allowCredentials: [
      {
        id: credential.id,
        transports: credential.transports as
          | AuthenticatorTransportFuture[]
          | undefined,
      },
    ],
  });

  const res = NextResponse.json(options);
  res.cookies.set(CHALLENGE_COOKIE, createChallengeValue(options.challenge), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 300,
    path: "/",
  });
  return res;
}
