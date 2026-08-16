import type { Metadata } from "next";
import { PageHero, Section } from "@/components/ui";
import { company, contact } from "@/content/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${company.legalName} collects, uses and protects personal data submitted through ${company.domain}.`,
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        description={`How we handle the personal data you share with us through ${company.url}.`}
      />

      <Section>
        <div className="prose-page max-w-3xl">
          <h2>Who we are</h2>
          <p>
            Our website address is <a href={company.url}>{company.url}</a>. This
            policy explains what personal data we collect, why we collect it,
            and what rights you have over it.
          </p>

          <h2>Comments</h2>
          <p>
            When visitors leave comments on the site we collect the data shown
            in the comments form, and also the visitor&rsquo;s IP address and
            browser user agent string to help with spam detection.
          </p>

          <h2>Contact forms</h2>
          <p>
            If you use the contact form, we will use that data to reach you
            through phone or email as per your preference. We do not sell the
            information you submit, and we do not use it for unrelated marketing.
          </p>

          <h2>Cookies</h2>
          <p>
            Cookies may be used to remember your preferences and to keep the
            site working correctly across visits. You can control or clear
            cookies through your browser settings at any time.
          </p>

          <h2>Embedded content from other websites</h2>
          <p>
            Pages on this site may include embedded content such as videos,
            images or articles. Embedded content from other websites behaves in
            exactly the same way as if the visitor had visited the other
            website, and those sites may collect data about you, use cookies,
            and monitor your interaction with the embedded content.
          </p>

          <h2>Who we share your data with</h2>
          <p>
            We share personal data only where it is necessary to deliver the
            service you asked for, or where we are required to by law.
          </p>

          <h2>How long we retain your data</h2>
          <p>
            If you leave a comment, the comment and its metadata are retained
            indefinitely so that follow-up comments can be recognised and
            approved automatically. Enquiries received through the contact form
            are retained for as long as needed to respond and to maintain our
            business records.
          </p>

          <h2>What rights you have over your data</h2>
          <p>
            All users can see, edit, or delete their personal information at any
            time — except that they cannot change their username. Website
            administrators can also see and edit that information.
          </p>
          <p>
            You can request to receive an exported file of the personal data we
            hold about you, and you can request that we erase any personal data
            we hold about you. This does not include data we are obliged to keep
            for administrative, legal or security purposes.
          </p>

          <h2>Where your data is sent</h2>
          <p>
            Visitor comments may be checked through an automated spam detection
            service.
          </p>

          <h2>Contacting us about privacy</h2>
          <p>
            For any question about this policy, or to exercise any of the rights
            above, write to us at{" "}
            <a href={`mailto:${contact.emails.general}`}>
              {contact.emails.general}
            </a>{" "}
            or at either of our offices:
          </p>
          <ul>
            {contact.offices.map((office) => (
              <li key={office.region}>
                <strong>{office.region}</strong> — {office.address.join(", ")} ·{" "}
                {office.phone}
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </>
  );
}
