"use client";

import { useRef, useState } from "react";
import { contact } from "@/content/site";
import { INTEREST_OPTIONS, type FieldErrors } from "@/lib/enquiry";
import { ArrowIcon, CheckIcon } from "./icons";

const fieldClass =
  "w-full rounded-xl border border-line-strong bg-page px-4 py-3 text-[0.95rem] text-heading placeholder:text-faint transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25";

const labelClass = "block text-sm font-medium text-heading";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  // Used by the server to reject submissions completed implausibly fast.
  const startedAt = useRef(Date.now());

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    setStatus("sending");
    setErrors({});
    setFormError(null);

    const body = new FormData(form);
    body.set("startedAt", String(startedAt.current));

    try {
      const response = await fetch("/api/contact", { method: "POST", body });
      const data = await response.json().catch(() => ({}));

      if (response.ok && data.ok) {
        setStatus("sent");
        form.reset();
        return;
      }

      if (response.status === 422 && data.errors) {
        setErrors(data.errors as FieldErrors);
        setFormError("Please check the highlighted fields.");
      } else {
        setFormError(
          data.error ??
            "Something went wrong sending your message. Please try again.",
        );
      }
      setStatus("error");
    } catch {
      setFormError(
        `We could not reach the server. Please email ${contact.emails.general} directly.`,
      );
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div
        className="rounded-2xl border border-brand/30 bg-brand/[0.06] p-8"
        role="status"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/15 text-brand">
          <CheckIcon className="h-5 w-5" />
        </span>
        <h3 className="mt-5 text-[1.15rem] font-semibold text-heading">
          Thank you — your message is with us
        </h3>
        <p className="mt-2.5 text-[0.95rem] leading-relaxed text-muted">
          A consultant will come back to you by email or phone, whichever you
          asked for. If it is urgent, reach us directly at{" "}
          <a
            href={`mailto:${contact.emails.general}`}
            className="font-medium text-brand underline underline-offset-4"
          >
            {contact.emails.general}
          </a>
          .
        </p>
        <button
          type="button"
          onClick={() => {
            startedAt.current = Date.now();
            setStatus("idle");
          }}
          className="mt-6 text-sm font-semibold text-brand hover:text-brand-soft"
        >
          Send another message
        </button>
      </div>
    );
  }

  const busy = status === "sending";

  return (
    <form className="space-y-5" onSubmit={onSubmit} noValidate>
      {/* Hidden from people and assistive tech; bots fill it in. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="name"
          label="Full name"
          placeholder="Jane Doe"
          autoComplete="name"
          error={errors.name}
          required
        />
        <Field
          id="company"
          label="Company"
          placeholder="Acme Inc."
          autoComplete="organization"
          error={errors.company}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="email"
          label="Work email"
          type="email"
          placeholder="jane@acme.com"
          autoComplete="email"
          error={errors.email}
          required
        />
        <Field
          id="phone"
          label="Phone"
          type="tel"
          optional
          placeholder="+1 555 000 0000"
          autoComplete="tel"
          error={errors.phone}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="interest">
          What can we help with?
        </label>
        <select id="interest" name="interest" className={`${fieldClass} mt-2`}>
          {INTEREST_OPTIONS.map((option) => (
            <option key={option}>{option}</option>
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
          required
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
          placeholder="Your environment, timelines, and what prompted you to get in touch."
          className={`${fieldClass} mt-2 resize-y ${
            errors.message ? "border-red-400/70" : ""
          }`}
        />
        {errors.message ? (
          <p id="message-error" className="mt-2 text-sm text-red-300">
            {errors.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={busy}
          className="group inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-ink shadow-glow transition-colors hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Sending…" : "Send enquiry"}
          {busy ? (
            <Spinner />
          ) : (
            <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          )}
        </button>
        {formError ? (
          <p className="text-sm text-red-300" role="alert">
            {formError}
          </p>
        ) : null}
      </div>

      <p className="text-xs leading-relaxed text-faint">
        If you use the contact form, we will use that data to reach you through
        phone or email as per your preference. See our{" "}
        <a
          href="/privacy-policy"
          className="underline underline-offset-2 hover:text-muted"
        >
          privacy policy
        </a>
        .
      </p>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  optional = false,
  required = false,
  ...props
}: {
  id: string;
  label: string;
  error?: string;
  optional?: boolean;
  required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className={labelClass} htmlFor={id}>
        {label}{" "}
        {optional ? <span className="font-normal text-faint">(optional)</span> : null}
      </label>
      <input
        id={id}
        name={id}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${fieldClass} mt-2 ${error ? "border-red-400/70" : ""}`}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        opacity="0.25"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
