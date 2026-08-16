import Link from "next/link";
import { company, contact, navigation, services } from "@/content/site";
import { Logo, MailIcon, PhoneIcon, PinIcon } from "./icons";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ink-100 bg-ink-50/60">
      <div className="container-page py-16">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <Logo className="h-8 w-8 text-brand-600" />
              <span className="flex flex-col leading-none">
                <span className="text-[1.05rem] font-semibold tracking-[0.14em] text-ink-900">
                  CATEYE
                </span>
                <span className="mt-1 text-[0.6rem] font-medium uppercase tracking-[0.22em] text-ink-400">
                  Technology
                </span>
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-500">
              {company.shortDescription}
            </p>
            <div className="mt-6 space-y-2 text-sm">
              <a
                href={`mailto:${contact.emails.general}`}
                className="flex items-center gap-2.5 text-ink-600 transition-colors hover:text-brand-700"
              >
                <MailIcon className="h-4 w-4 text-ink-400" />
                {contact.emails.general}
              </a>
              <a
                href={`mailto:${contact.emails.support}`}
                className="flex items-center gap-2.5 text-ink-600 transition-colors hover:text-brand-700"
              >
                <MailIcon className="h-4 w-4 text-ink-400" />
                {contact.emails.support}
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 lg:col-span-1">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-900">
                Services
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {services.slice(0, 6).map((service) => (
                  <li key={service.slug}>
                    <Link
                      href={`/services/${service.slug}`}
                      className="text-ink-500 transition-colors hover:text-brand-700"
                    >
                      {service.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-900">
                Company
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {navigation.primary.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-ink-500 transition-colors hover:text-brand-700"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/get-started"
                    className="text-ink-500 transition-colors hover:text-brand-700"
                  >
                    Get started
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-900">
              Offices
            </h3>
            <ul className="mt-4 space-y-5">
              {contact.offices.map((office) => (
                <li key={office.region} className="text-sm">
                  <p className="font-medium text-ink-800">{office.region}</p>
                  <p className="mt-1.5 flex gap-2.5 text-ink-500">
                    <PinIcon className="mt-0.5 h-4 w-4 flex-none text-ink-400" />
                    <span>
                      {office.address.map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                    </span>
                  </p>
                  <a
                    href={`tel:${office.phoneHref}`}
                    className="mt-1.5 flex items-center gap-2.5 text-ink-500 transition-colors hover:text-brand-700"
                  >
                    <PhoneIcon className="h-4 w-4 text-ink-400" />
                    {office.phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-ink-200/70 pt-6 text-sm text-ink-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {company.legalName}. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {navigation.legal.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-brand-700"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
