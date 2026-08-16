import type { Metadata } from "next";
import { CtaBand, PageHero, Section, SectionHeader } from "@/components/ui";
import { contact, industries } from "@/content/site";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Join CATEYE TECHNOLOGY — consulting roles across cybersecurity, assessment, GRC and digital transformation, in the US and India.",
};

const practices = [
  {
    title: "Assessment",
    description:
      "Vulnerability assessment, penetration testing and security audit work across networks, applications and APIs.",
  },
  {
    title: "Advisory & GRC",
    description:
      "Governance, risk and compliance consultants who can structure a program and then help operate it.",
  },
  {
    title: "Digital transformation",
    description:
      "Cloud migration, process automation and application engineering for clients modernizing their estate.",
  },
  {
    title: "Leadership on-demand",
    description:
      "Senior CIO, CTO and CISO practitioners taking fractional and interim roles with our clients.",
  },
];

export default function CareersPage() {
  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="Build a practice, not just a resume"
        description="We are a team of entrepreneurs with decades of experience, working with clients across the US, India and beyond."
      />

      <Section>
        <SectionHeader
          eyebrow="Where we hire"
          title="Practices we are always interested in"
          description="We do not always have a posting open, but we always read introductions from strong practitioners."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {practices.map((practice) => (
            <div
              key={practice.title}
              className="rounded-2xl border border-ink-100 bg-white p-7 shadow-card"
            >
              <h3 className="text-[1.05rem] font-semibold text-ink-900">
                {practice.title}
              </h3>
              <p className="mt-2.5 text-[0.93rem] leading-relaxed text-ink-500">
                {practice.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="border-t border-ink-100 bg-ink-50/50">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <SectionHeader
            eyebrow="What the work looks like"
            title="Client-facing from day one"
            description="Our consultants work directly with the teams they advise, across industry verticals where the stakes are real."
          />
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {industries.map((industry) => (
                <div
                  key={industry}
                  className="flex items-center gap-3 rounded-xl border border-ink-100 bg-white px-5 py-4"
                >
                  <span className="h-2 w-2 flex-none rounded-full bg-brand-500" />
                  <span className="text-[0.95rem] font-medium text-ink-800">
                    {industry}
                  </span>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-ink-100 bg-white p-7">
              <h3 className="text-[1.05rem] font-semibold text-ink-900">
                No current opening that fits?
              </h3>
              <p className="mt-2.5 text-[0.93rem] leading-relaxed text-ink-500">
                Send your resume and a short note about the work you want to do
                to{" "}
                <a
                  href={`mailto:${contact.emails.general}`}
                  className="font-medium text-brand-700 underline underline-offset-4 hover:text-brand-800"
                >
                  {contact.emails.general}
                </a>
                . We keep introductions on file and come back when a matching
                engagement opens.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <CtaBand
        title="Interested in joining CATEYE?"
        description="Tell us about the problems you like solving and where you want to take your practice."
        primary={{ href: "/contact-us", label: "Get in touch" }}
        secondary={{ href: "/about-us", label: "About us" }}
      />
    </>
  );
}
