"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { company, navigation, services } from "@/content/site";
import { ArrowIcon, Logo } from "./icons";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile sheet whenever the route changes.
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) =>
    href !== "/" && !href.startsWith("/#") && pathname.startsWith(href);

  return (
    <div className="sticky top-0 z-50">
      <header
        className={`border-b transition-colors duration-300 ${
          scrolled || open
            ? "border-line bg-raised/90 backdrop-blur-md"
            : "border-transparent bg-raised"
        }`}
      >
        <div className="container-page flex h-16 items-center justify-between gap-4 sm:h-[4.5rem]">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            aria-label={`${company.legalName} home`}
          >
            <Logo className="h-8 w-8 text-brand" />
            <span className="flex flex-col leading-none">
              <span className="text-[1.05rem] font-semibold tracking-[0.14em] text-heading">
                CATEYE
              </span>
              <span className="mt-1 text-[0.6rem] font-medium uppercase tracking-[0.22em] text-faint">
                Technology
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {navigation.primary.map((item) =>
              item.label === "Services" ? (
                <div key={item.href} className="group relative">
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? "text-brand"
                        : "text-body hover:text-heading"
                    }`}
                  >
                    {item.label}
                    <svg
                      viewBox="0 0 12 12"
                      className="h-3 w-3 text-faint transition-transform duration-200 group-hover:rotate-180"
                      aria-hidden="true"
                    >
                      <path
                        d="m3 4.8 3 3 3-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                  <div className="invisible absolute left-1/2 top-full w-[30rem] -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <div className="grid grid-cols-2 gap-1 rounded-2xl border border-line bg-raised p-2 shadow-lift">
                      {services.map((service) => (
                        <Link
                          key={service.slug}
                          href={`/services/${service.slug}`}
                          className="rounded-xl px-3 py-2.5 transition-colors hover:bg-white/5"
                        >
                          <span className="block text-sm font-medium text-heading">
                            {service.title}
                          </span>
                          <span className="mt-0.5 block text-xs leading-snug text-faint">
                            {service.eyebrow}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "text-brand"
                      : "text-body hover:text-heading"
                  }`}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/get-started"
              className="hidden items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-ink shadow-glow transition-colors hover:bg-brand-soft sm:inline-flex"
            >
              Get started
              <ArrowIcon className="h-3.5 w-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-body ring-1 ring-inset ring-line-strong lg:hidden"
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                {open ? (
                  <path
                    d="m6 6 12 12M18 6 6 18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M4 7h16M4 12h16M4 17h16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <div className="border-b border-line bg-raised lg:hidden">
          <nav className="container-page space-y-1 py-4" aria-label="Mobile">
            {navigation.primary.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-xl px-3 py-2.5 text-[0.95rem] font-medium text-heading hover:bg-white/5"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-line pt-3">
              <p className="px-3 pb-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-faint">
                Services
              </p>
              {services.map((service) => (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="block rounded-xl px-3 py-2 text-sm text-body hover:bg-white/5"
                >
                  {service.title}
                </Link>
              ))}
            </div>
            <Link
              href="/get-started"
              className="mt-3 flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-brand-ink"
            >
              Get started
              <ArrowIcon className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
