import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { MailIcon, PhoneIcon } from "@/components/icons";
import { CheckList, PageHero, Section } from "@/components/ui";
import { contact, spectrums } from "@/content/site";

export const metadata: Metadata = {
  title: "Get Started",
  description:
    "Start an engagement with CATEYE TECHNOLOGY — tell us about your environment and objectives and we will propose the right first step.",
};

const steps = [
  {
    step: "01",
    title: "Tell us what you are solving",
    description:
      "A short brief is enough: the systems involved, what is driving the timeline, and who the decision makers are.",
  },
  {
    step: "02",
    title: "We propose a first engagement",
    description:
      "Usually an assessment or a leadership engagement — whichever gives you the most certainty for the least spend.",
  },
  {
    step: "03",
    title: "We agree scope and start",
    description:
      "Clear deliverables, named consultants, and a schedule you can hold us to.",
  },
];

export default function GetStartedPage() {
  return (
    <>
      <PageHero
        eyebrow="Get started"
        title="Your first engagement, scoped in a single conversation"
        description="We would rather understand the problem than sell a package. Share the context and we will tell you what we would do first — and what can wait."
      />

      <Section>
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1fr]">
          <div className="space-y-10">
            <ol className="space-y-8">
              {steps.map((item) => (
                <li key={item.step} className="flex gap-5">
                  <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-brand-50 text-xs font-semibold tabular-nums text-brand-700">
                    {item.step}
                  </span>
                  <div>
                    <h2 className="text-[1.05rem] font-semibold text-ink-900">
                      {item.title}
                    </h2>
                    <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-500">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="rounded-2xl border border-ink-100 bg-ink-50/60 p-8">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-900">
                We can start anywhere on this list
              </h2>
              <div className="mt-5">
                <CheckList items={spectrums.map((item) => item.title)} />
              </div>
            </div>

            <div className="space-y-3 text-[0.95rem]">
              <p className="text-ink-500">Prefer to reach out directly?</p>
              <a
                href={`mailto:${contact.emails.general}`}
                className="flex items-center gap-3 text-ink-700 transition-colors hover:text-brand-700"
              >
                <MailIcon className="h-4 w-4 text-ink-400" />
                {contact.emails.general}
              </a>
              {contact.offices.map((office) => (
                <a
                  key={office.region}
                  href={`tel:${office.phoneHref}`}
                  className="flex items-center gap-3 text-ink-700 transition-colors hover:text-brand-700"
                >
                  <PhoneIcon className="h-4 w-4 text-ink-400" />
                  {office.phone}
                  <span className="text-xs text-ink-400">{office.region}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-ink-100 bg-white p-8 shadow-card sm:p-10">
            <h2 className="heading-md">Start the conversation</h2>
            <p className="mt-3 text-[0.95rem] text-ink-500">
              No obligation, and nothing is shared outside our team.
            </p>
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
