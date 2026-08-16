import Link from "next/link";
import { capabilityIcons, ArrowIcon, Logo } from "@/components/icons";
import { Button, Card, CtaBand, Section, SectionHeader } from "@/components/ui";
import {
  approach,
  capabilities,
  company,
  industries,
  services,
  spectrums,
  stats,
} from "@/content/site";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Capabilities />
      <Spectrums />
      <Approach />
      <Philosophy />
      <ServicesPreview />
      <Industries />
      <CtaBand />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-sunken">
      <div className="grid-backdrop absolute inset-0" aria-hidden="true" />
      <div
        className="absolute -left-32 top-10 h-[26rem] w-[26rem] rounded-full bg-brand/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -right-24 bottom-0 h-[22rem] w-[22rem] rounded-full bg-brand-deep/25 blur-3xl"
        aria-hidden="true"
      />
      <div className="container-page relative py-20 sm:py-28 lg:py-32">
        <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="animate-fade-up">
            <p className="eyebrow text-brand">
              <span className="h-px w-6 bg-brand/50" />
              {company.tagline}
            </p>
            <h1 className="heading-xl mt-5 max-w-[16ch] text-heading">
              Technology leadership and security your business can{" "}
              <span className="text-brand">stand behind</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              CATEYE was formed by a group of entrepreneurs with offices in the
              US and India and business operations around the globe, providing
              technology thought leadership, cybersecurity services and digital
              transformation services.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button href="/get-started" withArrow>
                Get started
              </Button>
              <Button href="/services" variant="ghost">
                Explore services
              </Button>
            </div>
            <dl className="mt-14 grid max-w-lg grid-cols-2 gap-x-8 gap-y-6 border-t border-white/10 pt-8 sm:grid-cols-4 sm:gap-x-4">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-2xl font-semibold tracking-tight text-heading">
                    {stat.value}
                  </dt>
                  <dd className="mt-1 text-[0.78rem] leading-snug text-muted">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <Logo className="h-10 w-10 text-brand" />
                <span className="rounded-full bg-brand/15 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-brand">
                  Six spectrums
                </span>
              </div>
              <ul className="mt-7 space-y-3.5">
                {spectrums.map((spectrum) => (
                  <li
                    key={spectrum.title}
                    className="flex items-center gap-3 border-b border-white/[0.07] pb-3.5 last:border-0 last:pb-0"
                  >
                    <span className="h-1.5 w-1.5 flex-none rounded-full bg-brand" />
                    <span className="text-sm font-medium text-body">
                      {spectrum.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Capabilities() {
  return (
    <Section>
      <SectionHeader
        eyebrow="What we do"
        title="A focused approach, built around your objectives"
        description="Digital needs differ across businesses, sectors and industries, requiring a focused approach towards the achievement of company-specific objectives. Our approach helps organizations optimize their capabilities and resources while enabling businesses digitally and securely."
      />
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {capabilities.map((capability) => {
          const Icon = capabilityIcons[capability.icon];
          return (
            <Card key={capability.title}>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand/15 text-brand">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-[1.05rem] font-semibold text-heading">
                {capability.title}
              </h3>
              <p className="mt-2.5 text-[0.93rem] leading-relaxed text-muted">
                {capability.description}
              </p>
            </Card>
          );
        })}
      </div>
    </Section>
  );
}

function Spectrums() {
  return (
    <Section className="border-y border-line bg-sunken">
      <SectionHeader
        eyebrow="Service spectrums"
        title="Six spectrums, one accountable partner"
        description="We offer services across six broad spectrums, so the same team that assesses your environment can also lead, remediate, train and automate."
      />
      <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line-strong bg-line sm:grid-cols-2 lg:grid-cols-3">
        {spectrums.map((spectrum, index) => (
          <div
            key={spectrum.title}
            className="bg-raised p-7 transition-colors duration-300 hover:bg-brand/[0.06]"
          >
            <span className="text-xs font-semibold tabular-nums text-brand">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-3 text-[1.05rem] font-semibold text-heading">
              {spectrum.title}
            </h3>
            <p className="mt-2.5 text-[0.93rem] leading-relaxed text-muted">
              {spectrum.description}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Approach() {
  return (
    <Section id="approach">
      <SectionHeader
        eyebrow="Our approach"
        title="Understand, assess, design, operate"
        description="Security work only holds when it is grounded in the way your organization actually runs. We start with your objectives and stay through operation."
      />
      <ol className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {approach.map((phase) => (
          <li key={phase.step} className="relative">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold tabular-nums text-brand">
                {phase.step}
              </span>
              <span className="h-px flex-1 bg-line-strong" />
            </div>
            <h3 className="mt-4 text-[1.05rem] font-semibold text-heading">
              {phase.title}
            </h3>
            <p className="mt-2.5 text-[0.93rem] leading-relaxed text-muted">
              {phase.description}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function Philosophy() {
  return (
    <section className="relative overflow-hidden bg-sunken">
      <div className="grid-backdrop absolute inset-0" aria-hidden="true" />
      <div className="container-page relative py-20 sm:py-24">
        <figure className="mx-auto max-w-3xl text-center">
          <Logo className="mx-auto h-10 w-10 text-brand" />
          <blockquote className="mt-7 text-2xl font-medium leading-snug tracking-[-0.01em] text-heading sm:text-[1.85rem]">
            &ldquo;{company.philosophy}&rdquo;
          </blockquote>
          <figcaption className="mt-6 text-sm text-muted">
            The CATEYE team
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

function ServicesPreview() {
  return (
    <Section>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeader
          eyebrow="Services"
          title="Where organizations bring us in"
          description="From an on-demand CISO to a full penetration test, engagements are scoped to the problem in front of you."
        />
        <Link
          href="/services"
          className="group inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-soft"
        >
          All services
          <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.slice(0, 6).map((service) => (
          <Link key={service.slug} href={`/services/${service.slug}`} className="h-full">
            <Card className="group flex h-full flex-col">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-brand">
                {service.eyebrow}
              </p>
              <h3 className="mt-3 text-[1.15rem] font-semibold text-heading">
                {service.title}
              </h3>
              <p className="mt-3 flex-1 text-[0.93rem] leading-relaxed text-muted">
                {service.summary}
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand">
                Learn more
                <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </Section>
  );
}

function Industries() {
  return (
    <Section className="border-t border-line bg-sunken">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <SectionHeader
          eyebrow="Industries"
          title="Expertise that travels across verticals"
          description="Our team of entrepreneurs comes with decades of rich experience, covering industry verticals where uptime, privacy and trust are non-negotiable."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {industries.map((industry) => (
            <div
              key={industry}
              className="flex items-center gap-3 rounded-xl border border-line bg-raised px-5 py-4"
            >
              <span className="h-2 w-2 flex-none rounded-full bg-brand" />
              <span className="text-[0.95rem] font-medium text-heading">
                {industry}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
