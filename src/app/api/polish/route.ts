import { NextRequest, NextResponse } from "next/server";

import { defaultPolishConfig } from "@/polish/config";
import { ingest } from "@/polish/server/ingest";

// node:sqlite needs the Node runtime — never the Edge runtime.
export const runtime = "nodejs";
// This route mutates per-request; it must never be statically cached.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_json" }, { status: 400 });
  }

  const cookieValue = req.cookies.get(defaultPolishConfig.sessionCookie)?.value;
  const result = await ingest(body, cookieValue);

  // Always 204-style success for valid requests so the beacon never retries
  // on the client; real failures (bad payloads) return 4xx above.
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
