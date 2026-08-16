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
    "bg-brand text-brand-ink shadow-glow hover:bg-brand-soft active:bg-brand-deep active:text-heading",
  secondary:
    "bg-raised text-heading ring-1 ring-inset ring-line-strong hover:bg-raised/70 hover:ring-brand/40",
  ghost:
    "bg-white/[0.06] text-heading ring-1 ring-inset ring-white/15 backdrop-blur hover:bg-white/[0.12] hover:ring-white/25",
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
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow ? (
        <p className="eyebrow">
          <span className="h-px w-6 bg-brand/50" />
          {eyebrow}
        </p>
      ) : null}
      <h2 className="heading-lg mt-4">{title}</h2>
      {description ? (
        <p className="mt-4 text-[1.05rem] leading-relaxed text-muted">
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
      className={`rounded-2xl border border-line bg-raised p-7 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-lift ${className}`}
    >
      {children}
    </div>
  );
}

export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-[0.98rem] text-body">
          <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-brand/15 text-brand">
            <CheckIcon className="h-3.5 w-3.5" />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Deep band used at the bottom of every page to close on a next step. */
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
    <section className="relative overflow-hidden border-t border-line bg-sunken">
      <div className="grid-backdrop absolute inset-0" aria-hidden="true" />
      <div
        className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand/15 blur-3xl"
        aria-hidden="true"
      />
      <div className="container-page relative py-16 sm:py-20">
        <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <h2 className="heading-lg">{title}</h2>
            <p className="mt-4 leading-relaxed text-muted">{description}</p>
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

/** Compact hero used by every page other than the home page. */
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
    <header className="relative overflow-hidden border-b border-line bg-sunken pb-16 pt-14 sm:pb-20 sm:pt-20">
      <div className="grid-backdrop absolute inset-0" aria-hidden="true" />
      <div
        className="absolute left-1/2 top-0 h-64 w-[46rem] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl"
        aria-hidden="true"
      />
      <div className="container-page relative">
        <div className="max-w-3xl animate-fade-up">
          {eyebrow ? (
            <p className="eyebrow">
              <span className="h-px w-6 bg-brand/50" />
              {eyebrow}
            </p>
          ) : null}
          <h1 className="heading-xl mt-4">{title}</h1>
          {description ? (
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </header>
  );
}
