import { services } from "@/content/site";

export type Enquiry = {
  name: string;
  company: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
};

export type FieldErrors = Partial<Record<keyof Enquiry, string>>;

export const INTEREST_OPTIONS = [
  "Not sure yet — advise me",
  ...services.map((service) => service.title),
];

const LIMITS = {
  name: 120,
  company: 160,
  email: 254,
  phone: 40,
  message: 5000,
} as const;

/**
 * Deliberately permissive: the goal is to reject the obviously malformed, not
 * to adjudicate the RFC. Anything that gets through is treated as untrusted
 * text everywhere downstream.
 */
const EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

function text(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Strips CR/LF so a submitted value cannot inject extra headers when it is
 * interpolated into the outbound email's subject or Reply-To.
 */
function singleLine(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

export function parseEnquiry(form: FormData): {
  enquiry: Enquiry;
  errors: FieldErrors;
} {
  const enquiry: Enquiry = {
    name: singleLine(text(form.get("name"))),
    company: singleLine(text(form.get("company"))),
    email: singleLine(text(form.get("email"))),
    phone: singleLine(text(form.get("phone"))),
    interest: singleLine(text(form.get("interest"))),
    message: text(form.get("message")),
  };

  const errors: FieldErrors = {};

  if (enquiry.name.length < 2) {
    errors.name = "Please tell us your name.";
  } else if (enquiry.name.length > LIMITS.name) {
    errors.name = `Please keep this under ${LIMITS.name} characters.`;
  }

  if (!enquiry.email) {
    errors.email = "We need an email address to reply to.";
  } else if (!EMAIL.test(enquiry.email) || enquiry.email.length > LIMITS.email) {
    errors.email = "That does not look like a valid email address.";
  }

  if (enquiry.company.length > LIMITS.company) {
    errors.company = `Please keep this under ${LIMITS.company} characters.`;
  }

  if (enquiry.phone.length > LIMITS.phone) {
    errors.phone = "That phone number looks too long.";
  }

  if (enquiry.message.length < 10) {
    errors.message = "A sentence or two about what you need, please.";
  } else if (enquiry.message.length > LIMITS.message) {
    errors.message = `Please keep this under ${LIMITS.message} characters.`;
  }

  // An unrecognised value means the select was tampered with; fall back rather
  // than reject, since the enquiry itself is still worth receiving.
  if (!INTEREST_OPTIONS.includes(enquiry.interest)) {
    enquiry.interest = INTEREST_OPTIONS[0];
  }

  return { enquiry, errors };
}

/**
 * Two cheap bot checks that cost a real visitor nothing: a field that is
 * hidden from humans and must stay empty, and a minimum time on the form.
 */
export function looksAutomated(form: FormData): boolean {
  if (text(form.get("website")) !== "") return true;

  const startedAt = Number(form.get("startedAt"));
  if (!Number.isFinite(startedAt)) return false;

  return Date.now() - startedAt < 2500;
}
