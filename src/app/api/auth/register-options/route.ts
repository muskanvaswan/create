import { generateRegistrationOptions } from "@simplewebauthn/server";
import { NextRequest, NextResponse } from "next/server";
import {
  CHALLENGE_COOKIE,
  createChallengeValue,
  expectedRpID,
  hasRegisteredPasskey,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  // Single-owner site: once a passkey exists, registration is closed.
  if (hasRegisteredPasskey()) {
    return NextResponse.json(
      { error: "A passkey is already registered" },
      { status: 403 },
    );
  }

  const options = await generateRegistrationOptions({
    rpName: "Notes",
    rpID: expectedRpID(req),
    userName: "owner",
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },
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
