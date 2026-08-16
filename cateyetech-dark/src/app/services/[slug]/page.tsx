import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowIcon } from "@/components/icons";
import {
  CheckList,
  CtaBand,
  PageHero,
  Section,
} from "@/components/ui";
import { getService, services } from "@/content/site";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};

  return {
    title: service.title,
    description: service.summary,
    openGraph: {
      title: `${service.title} — CATEYE TECHNOLOGY`,
      description: service.summary,
    },
  };
}

export default async function ServicePage({ params }: Params) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const related = services.filter((item) => item.slug !== service.slug).slice(0, 3);

  return (
    <>
      <PageHero
        eyebrow={service.eyebrow}
        title={service.title}
        description={service.summary}
      />

      <Section>
        <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="prose-page">
            {service.intro.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-line bg-raised/60 p-8">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-heading">
                What you walk away with
              </h2>
              <div className="mt-5">
                <CheckList items={service.outcomes} />
              </div>
            </div>

            <div className="rounded-2xl bg-sunken p-8">
              <h2 className="text-[1.05rem] font-semibold text-heading">
                Talk to a consultant
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">
                A short call is usually enough for us to tell you whether this
                is the right first engagement.
              </p>
              <Link
                href="/get-started"
                className="group mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-heading transition-colors hover:bg-brand-soft"
              >
                Get started
                <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </aside>
        </div>

        <div className="mt-16 border-t border-line pt-14">
          <h2 className="heading-md">What the engagement covers</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {service.highlights.map((highlight) => (
              <div
                key={highlight.title}
                className="rounded-2xl border border-line bg-raised p-7 shadow-card"
              >
                <h3 className="text-[1.02rem] font-semibold text-heading">
                  {highlight.title}
                </h3>
                <p className="mt-2.5 text-[0.92rem] leading-relaxed text-muted">
                  {highlight.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="border-t border-line bg-sunken">
        <h2 className="heading-md">Related services</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {related.map((item) => (
            <Link
              key={item.slug}
              href={`/services/${item.slug}`}
              className="group flex flex-col rounded-2xl border border-line bg-raised p-7 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
            >
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-brand">
                {item.eyebrow}
              </p>
              <h3 className="mt-3 text-[1.05rem] font-semibold text-heading">
                {item.title}
              </h3>
              <p className="mt-2.5 flex-1 text-[0.9rem] leading-relaxed text-muted">
                {item.summary}
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand">
                Learn more
                <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
