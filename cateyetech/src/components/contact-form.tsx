"use client";

import { useState } from "react";
import { contact, services } from "@/content/site";
import { ArrowIcon, CheckIcon } from "./icons";

const fieldClass =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-[0.95rem] text-ink-800 placeholder:text-ink-300 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

const labelClass = "block text-sm font-medium text-ink-800";

/**
 * The site has no backend, so the form composes a pre-filled email to
 * info@cateyetech.com rather than pretending to submit somewhere.
 */
export function ContactForm() {
  const [sent, setSent] = useState(false);

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const body = [
          `Name: ${data.get("name")}`,
          `Company: ${data.get("company")}`,
          `Email: ${data.get("email")}`,
          `Phone: ${data.get("phone")}`,
          `Interested in: ${data.get("interest")}`,
          "",
          String(data.get("message") ?? ""),
        ].join("\n");

        window.location.href = `mailto:${contact.emails.general}?subject=${encodeURIComponent(
          `Enquiry from ${data.get("name") || "the website"}`,
        )}&body=${encodeURIComponent(body)}`;
        setSent(true);
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            name="name"
            required
            autoComplete="name"
            placeholder="Jane Doe"
            className={`${fieldClass} mt-2`}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="company">
            Company
          </label>
          <input
            id="company"
            name="company"
            autoComplete="organization"
            placeholder="Acme Inc."
            className={`${fieldClass} mt-2`}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="email">
            Work email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="jane@acme.com"
            className={`${fieldClass} mt-2`}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="phone">
            Phone{" "}
            <span className="font-normal text-ink-400">(optional)</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+1 555 000 0000"
            className={`${fieldClass} mt-2`}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="interest">
          What can we help with?
        </label>
        <select id="interest" name="interest" className={`${fieldClass} mt-2`}>
          <option>Not sure yet — advise me</option>
          {services.map((service) => (
            <option key={service.slug}>{service.title}</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor="message">
          Tell us a little more
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder="Your environment, timelines, and what prompted you to get in touch."
          className={`${fieldClass} mt-2 resize-y`}
        />
      </div>

      <button
        type="submit"
        className="group inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
      >
        Send enquiry
        <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </button>

      {sent ? (
        <p className="flex items-center gap-2 text-sm text-brand-700">
          <CheckIcon className="h-4 w-4" />
          Your email client should have opened with the message ready to send.
          If it did not, write to us at {contact.emails.general}.
        </p>
      ) : (
        <p className="text-xs leading-relaxed text-ink-400">
          If you use the contact form, we will use that data to reach you
          through phone or email as per your preference. See our{" "}
          <a
            href="/privacy-policy"
            className="underline underline-offset-2 hover:text-ink-600"
          >
            privacy policy
          </a>
          .
        </p>
      )}
    </form>
  );
}
