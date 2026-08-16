import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { MailIcon, PhoneIcon, PinIcon } from "@/components/icons";
import { PageHero, Section } from "@/components/ui";
import { contact } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Reach CATEYE TECHNOLOGY in Wilmington, Delaware or New Delhi, India — by phone, email or the enquiry form.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact us"
        title="Talk to us"
        description="Offices in the US and India, business operations around the globe. Tell us what you need and the right consultant will come back to you."
      />

      <Section>
        <div className="grid gap-14 lg:grid-cols-[1fr_0.85fr]">
          <div>
            <h2 className="heading-md">Send us a message</h2>
            <p className="mt-3 text-ink-500">
              Share a few details and we will respond by email or phone,
              whichever you prefer.
            </p>
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-ink-100 bg-ink-50/60 p-8">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-900">
                Email
              </h2>
              <div className="mt-5 space-y-3 text-[0.95rem]">
                <a
                  href={`mailto:${contact.emails.general}`}
                  className="flex items-center gap-3 text-ink-700 transition-colors hover:text-brand-700"
                >
                  <MailIcon className="h-4 w-4 text-ink-400" />
                  <span>
                    {contact.emails.general}
                    <span className="ml-2 text-xs text-ink-400">
                      General enquiries
                    </span>
                  </span>
                </a>
                <a
                  href={`mailto:${contact.emails.support}`}
                  className="flex items-center gap-3 text-ink-700 transition-colors hover:text-brand-700"
                >
                  <MailIcon className="h-4 w-4 text-ink-400" />
                  <span>
                    {contact.emails.support}
                    <span className="ml-2 text-xs text-ink-400">Support</span>
                  </span>
                </a>
              </div>
            </div>

            {contact.offices.map((office) => (
              <div
                key={office.region}
                className="rounded-2xl border border-ink-100 bg-white p-8 shadow-card"
              >
                <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-900">
                  {office.region}
                </h2>
                <address className="mt-5 space-y-3 not-italic text-[0.95rem] text-ink-600">
                  <p className="flex gap-3">
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
                    className="flex items-center gap-3 transition-colors hover:text-brand-700"
                  >
                    <PhoneIcon className="h-4 w-4 text-ink-400" />
                    {office.phone}
                  </a>
                </address>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
