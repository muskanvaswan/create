import type { Metadata } from "next";
import { CtaBand, PageHero, Section, SectionHeader } from "@/components/ui";
import { company, industries, spectrums, stats } from "@/content/site";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "CATEYE was formed by a group of entrepreneurs with offices in the US and India, providing technology thought leadership, cybersecurity and digital transformation services.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title="Entrepreneurs who have run the systems they now secure"
        description="CATEYE was formed by a group of entrepreneurs, with offices in the US and India and business operations around the globe."
      />

      <Section>
        <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="prose-page">
            <h2>Who we are</h2>
            <p>
              CATEYE was formed by a group of entrepreneurs, with offices in the
              US and India, having business operations around the globe,
              providing technology thought leadership, cybersecurity services
              and digital transformation services.
            </p>
            <p>
              Our team of entrepreneurs comes with decades of rich experience.
              That experience covers industry verticals such as technology and
              media, e-commerce portals, healthcare and retail — sectors where
              availability, privacy and customer trust are the business.
            </p>
            <h2>What we believe</h2>
            <p>{company.philosophy}</p>
            <p>
              Digital needs differ across businesses, sectors and industries,
              requiring a focused approach towards the achievement of
              company-specific objectives. Our approach helps organizations
              optimize their capabilities and resources while enabling
              businesses digitally and securely.
            </p>
            <h2>How we help</h2>
            <p>
              We support our clients with risk assessments, solutions to their
              security challenges, digital transformation through process
              automation, and the development of their digital presence through
              software, web, mobile and customer interaction solutions.
            </p>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-line bg-raised/60 p-8">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-heading">
                At a glance
              </h3>
              <dl className="mt-6 grid grid-cols-2 gap-6">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <dt className="text-2xl font-semibold tracking-tight text-heading">
                      {stat.value}
                    </dt>
                    <dd className="mt-1 text-[0.82rem] leading-snug text-muted">
                      {stat.detail}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="rounded-2xl border border-line bg-raised p-8 shadow-card">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-heading">
                Industry verticals
              </h3>
              <ul className="mt-5 space-y-3">
                {industries.map((industry) => (
                  <li
                    key={industry}
                    className="flex items-center gap-3 text-[0.95rem] text-body"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                    {industry}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      <Section className="border-t border-line bg-sunken">
        <SectionHeader
          eyebrow="Our offering"
          title="Services across six broad spectrums"
          description="Leadership On-Demand, Assessment, GRC, Professional Services, Cybersecurity Trainings and Automation Services — under one engagement."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {spectrums.map((spectrum) => (
            <div
              key={spectrum.title}
              className="rounded-2xl border border-line bg-raised p-7 shadow-card"
            >
              <h3 className="text-[1.05rem] font-semibold text-heading">
                {spectrum.title}
              </h3>
              <p className="mt-2.5 text-[0.93rem] leading-relaxed text-muted">
                {spectrum.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <CtaBand
        title="Work with a team that has been on your side of the table"
        description="Tell us about your environment and objectives. We will tell you honestly what we would do first."
      />
    </>
  );
}
