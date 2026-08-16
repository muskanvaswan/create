import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowIcon, CheckIcon } from "./icons";

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  withArrow?: boolean;
};

const buttonStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-brand-600 text-white shadow-[0_10px_24px_-12px_rgba(8,139,171,0.9)] hover:bg-brand-700 active:bg-brand-800",
  secondary:
    "bg-white text-ink-800 ring-1 ring-inset ring-ink-200 hover:ring-ink-300 hover:bg-ink-50",
  ghost:
    "bg-white/10 text-white ring-1 ring-inset ring-white/25 backdrop-blur hover:bg-white/20",
};

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
  withArrow = false,
}: ButtonProps) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors duration-200 ${buttonStyles[variant]} ${className}`}
    >
      {children}
      {withArrow ? (
        <ArrowIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
      ) : null}
    </Link>
  );
}

export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`py-20 sm:py-24 ${className}`}>
      <div className="container-page">{children}</div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "light",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
}) {
  return (
    <div
      className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}
    >
      {eyebrow ? (
        <p className={`eyebrow ${tone === "dark" ? "text-brand-300" : ""}`}>
          <span
            className={`h-px w-6 ${tone === "dark" ? "bg-brand-400/60" : "bg-brand-500/50"}`}
          />
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={`heading-lg mt-4 ${tone === "dark" ? "text-white" : ""}`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-4 text-[1.05rem] leading-relaxed ${
            tone === "dark" ? "text-ink-200" : "text-ink-500"
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-ink-100 bg-white p-7 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-ink-200 hover:shadow-lift ${className}`}
    >
      {children}
    </div>
  );
}

export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-[0.98rem] text-ink-600">
          <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand-50 text-brand-700">
            <CheckIcon className="h-3.5 w-3.5" />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Dark banner used at the bottom of every page to close on a next step. */
export function CtaBand({
  title = "Let's talk about where you are today",
  description = "Tell us what you are trying to protect, migrate or modernize. We will come back with a candid view of the work involved — no obligation.",
  primary = { href: "/get-started", label: "Get started" },
  secondary = { href: "/contact-us", label: "Contact us" },
}: {
  title?: string;
  description?: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="relative overflow-hidden bg-ink-900">
      <div className="grid-backdrop absolute inset-0" aria-hidden="true" />
      <div
        className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl"
        aria-hidden="true"
      />
      <div className="container-page relative py-16 sm:py-20">
        <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <h2 className="heading-lg text-white">{title}</h2>
            <p className="mt-4 leading-relaxed text-ink-200">{description}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href={primary.href} withArrow>
              {primary.label}
            </Button>
            <Button href={secondary.href} variant="ghost">
              {secondary.label}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Compact dark hero used by every page other than the home page. */
export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="relative overflow-hidden bg-ink-900 pb-16 pt-14 sm:pb-20 sm:pt-20">
      <div className="grid-backdrop absolute inset-0" aria-hidden="true" />
      <div
        className="absolute left-1/2 top-0 h-64 w-[46rem] -translate-x-1/2 rounded-full bg-brand-500/15 blur-3xl"
        aria-hidden="true"
      />
      <div className="container-page relative">
        <div className="max-w-3xl animate-fade-up">
          {eyebrow ? (
            <p className="eyebrow text-brand-300">
              <span className="h-px w-6 bg-brand-400/60" />
              {eyebrow}
            </p>
          ) : null}
          <h1 className="heading-xl mt-4 text-white">{title}</h1>
          {description ? (
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-200">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </header>
  );
}
