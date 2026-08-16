import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon } from "@/components/icons";
import { Card, CtaBand, PageHero, Section, SectionHeader } from "@/components/ui";
import { approach, services } from "@/content/site";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Cyber security services, VA/PT, IT security audit, IT security strategy, on-demand IT leadership, digital transformation, GRC and cybersecurity trainings.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="From strategy on a whiteboard to controls in production"
        description="Every engagement is scoped to a specific objective — reduce breach risk, pass an audit, migrate securely, or put senior technology leadership in the room."
      />

      <Section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="h-full"
            >
              <Card className="group flex h-full flex-col">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-brand-600">
                  {service.eyebrow}
                </p>
                <h2 className="mt-3 text-[1.15rem] font-semibold text-ink-900">
                  {service.title}
                </h2>
                <p className="mt-3 flex-1 text-[0.93rem] leading-relaxed text-ink-500">
                  {service.summary}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
                  Learn more
                  <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </Section>

      <Section className="border-t border-ink-100 bg-ink-50/50">
        <SectionHeader
          eyebrow="How we engage"
          title="The same four steps, whatever the service"
        />
        <ol className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {approach.map((phase) => (
            <li key={phase.step}>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold tabular-nums text-brand-600">
                  {phase.step}
                </span>
                <span className="h-px flex-1 bg-ink-200" />
              </div>
              <h3 className="mt-4 text-[1.05rem] font-semibold text-ink-900">
                {phase.title}
              </h3>
              <p className="mt-2.5 text-[0.93rem] leading-relaxed text-ink-500">
                {phase.description}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      <CtaBand />
    </>
  );
}
