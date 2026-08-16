import { NextResponse } from "next/server";
import { looksAutomated, parseEnquiry } from "@/lib/enquiry";
import { storeEnquiry } from "@/lib/enquiry-store";
import { isMailConfigured, sendEnquiry } from "@/lib/mailer";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const limit = checkRateLimit(clientKey(request.headers));
  if (!limit.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "Too many enquiries from this connection. Please try again later.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "We could not read that submission." },
      { status: 400 },
    );
  }

  // Answer bots with the same success shape a human gets, so a failed attempt
  // reveals nothing about which check caught it.
  if (looksAutomated(form)) {
    return NextResponse.json({ ok: true });
  }

  const { enquiry, errors } = parseEnquiry(form);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const receivedAt = new Date().toISOString();

  let delivered = false;
  let deliveryError: unknown = null;
  try {
    const result = await sendEnquiry(enquiry, receivedAt);
    delivered = result.delivered;
    if (!result.delivered && result.reason === "smtp-not-configured") {
      console.warn(
        "[contact] SMTP is not configured; enquiry recorded to the store only.",
      );
    }
  } catch (error) {
    deliveryError = error;
    console.error("[contact] mail delivery failed:", error);
  }

  const stored = await storeEnquiry({ ...enquiry, receivedAt, delivered });

  // Only fail the request if the enquiry reached neither the inbox nor disk;
  // otherwise it is recoverable and the visitor should not be asked to retype.
  if (!delivered && !stored) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "We could not record your message. Please email info@cateyetech.com directly.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    delivered,
    // Surfaced so a deployment can be verified without reading server logs.
    mailConfigured: isMailConfigured(),
    mailFailed: Boolean(deliveryError),
  });
}
