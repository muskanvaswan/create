import nodemailer, { type Transporter } from "nodemailer";
import { contact } from "@/content/site";
import type { Enquiry } from "./enquiry";

/**
 * SMTP is configured entirely through the environment so no credential ever
 * reaches the repository. When it is absent the route still succeeds — the
 * enquiry is persisted by the store — but delivery is reported as skipped so
 * the failure is visible in logs rather than silent.
 */

let cached: Transporter | null = null;

export function isMailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);
}

function transport(): Transporter | null {
  if (!isMailConfigured()) return null;
  if (cached) return cached;

  const port = Number(process.env.SMTP_PORT ?? 587);

  cached = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    // Implicit TLS on 465; STARTTLS upgrade on everything else.
    secure: process.env.SMTP_SECURE
      ? process.env.SMTP_SECURE === "true"
      : port === 465,
    auth: {
      user: process.env.SMTP_USER as string,
      pass: process.env.SMTP_PASSWORD as string,
    },
  });

  return cached;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function render(enquiry: Enquiry, receivedAt: string) {
  const rows: [string, string][] = [
    ["Name", enquiry.name],
    ["Company", enquiry.company || "—"],
    ["Email", enquiry.email],
    ["Phone", enquiry.phone || "—"],
    ["Interested in", enquiry.interest],
    ["Received", receivedAt],
  ];

  const text = [
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    enquiry.message,
  ].join("\n");

  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#0f1724;line-height:1.6">
      <h2 style="margin:0 0 16px;font-size:18px">New website enquiry</h2>
      <table style="border-collapse:collapse;font-size:14px">
        ${rows
          .map(
            ([label, value]) =>
              `<tr><td style="padding:4px 16px 4px 0;color:#4b6285">${label}</td><td style="padding:4px 0"><strong>${escapeHtml(value)}</strong></td></tr>`,
          )
          .join("")}
      </table>
      <p style="margin:20px 0 0;font-size:14px;white-space:pre-wrap">${escapeHtml(enquiry.message)}</p>
    </div>
  `;

  return { text, html };
}

export async function sendEnquiry(
  enquiry: Enquiry,
  receivedAt: string,
): Promise<{ delivered: boolean; reason?: string }> {
  const mailer = transport();
  if (!mailer) return { delivered: false, reason: "smtp-not-configured" };

  const { text, html } = render(enquiry, receivedAt);

  await mailer.sendMail({
    // The From must be a domain we are authorised to send as, or SPF/DKIM
    // fails. The visitor's address goes in Reply-To instead.
    from: process.env.CONTACT_FROM ?? `CATEYE Website <${contact.emails.general}>`,
    to: process.env.CONTACT_TO ?? contact.emails.general,
    replyTo: `${enquiry.name} <${enquiry.email}>`,
    subject: `Website enquiry — ${enquiry.interest} — ${enquiry.name}`,
    text,
    html,
  });

  return { delivered: true };
}
