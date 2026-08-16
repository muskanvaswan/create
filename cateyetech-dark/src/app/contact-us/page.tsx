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
            <p className="mt-3 text-muted">
              Share a few details and we will respond by email or phone,
              whichever you prefer.
            </p>
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-line bg-raised/60 p-8">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-heading">
                Email
              </h2>
              <div className="mt-5 space-y-3 text-[0.95rem]">
                <a
                  href={`mailto:${contact.emails.general}`}
                  className="flex items-center gap-3 text-body transition-colors hover:text-brand"
                >
                  <MailIcon className="h-4 w-4 text-faint" />
                  <span>
                    {contact.emails.general}
                    <span className="ml-2 text-xs text-faint">
                      General enquiries
                    </span>
                  </span>
                </a>
                <a
                  href={`mailto:${contact.emails.support}`}
                  className="flex items-center gap-3 text-body transition-colors hover:text-brand"
                >
                  <MailIcon className="h-4 w-4 text-faint" />
                  <span>
                    {contact.emails.support}
                    <span className="ml-2 text-xs text-faint">Support</span>
                  </span>
                </a>
              </div>
            </div>

            {contact.offices.map((office) => (
              <div
                key={office.region}
                className="rounded-2xl border border-line bg-raised p-8 shadow-card"
              >
                <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-heading">
                  {office.region}
                </h2>
                <address className="mt-5 space-y-3 not-italic text-[0.95rem] text-body">
                  <p className="flex gap-3">
                    <PinIcon className="mt-0.5 h-4 w-4 flex-none text-faint" />
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
                    className="flex items-center gap-3 transition-colors hover:text-brand"
                  >
                    <PhoneIcon className="h-4 w-4 text-faint" />
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
