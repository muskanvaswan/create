import type { Metadata } from "next";
import { PageHero, Section } from "@/components/ui";
import { company, contact } from "@/content/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: `The terms that apply to the use of ${company.domain} and to the supply of IT products and services by ${company.legalName}.`,
};

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms & Conditions"
        description="These terms, together with our privacy policy and website use terms, apply to your access and use of our online shop and to the supply of IT products and services."
      />

      <Section>
        <div className="prose-page max-w-3xl">
          <h2>Scope</h2>
          <p>
            These terms and conditions, together with our privacy policy and
            website use terms, apply to access and use of our online shop and to
            the supply of IT products and services by {company.legalName}.
          </p>

          <h2>Eligibility</h2>
          <p>
            To buy products and services via this website you must be at least
            18 years of age. By placing an order you confirm that you are at
            least 18 years of age and that all the information you provide is
            accurate, complete and not misleading.
          </p>

          <h2>Orders</h2>
          <p>
            An order placed through the website is an offer to buy. A contract
            comes into effect once we confirm acceptance of your order. We may
            decline an order where the product or service is unavailable, where
            pricing was listed in error, or where we are unable to verify the
            information provided.
          </p>

          <h2>Payment</h2>
          <p>
            We accept payment by Visa, MasterCard and American Express. Account
            details are processed using at least SSL 128-bit encryption. We do
            not store full card details on our systems.
          </p>

          <h2>Pricing</h2>
          <p>
            Prices are those published at the time your order is placed, and are
            exclusive of taxes and duties unless stated otherwise. We reserve the
            right to change prices for future orders at any time.
          </p>

          <h2>Delivery of services</h2>
          <p>
            Professional services are delivered in accordance with the statement
            of work agreed between you and {company.legalName}. Where a
            statement of work conflicts with these terms, the statement of work
            prevails for that engagement.
          </p>

          <h2>Intellectual property</h2>
          <p>
            All content on this website, including text, graphics, logos and
            software, is the property of {company.legalName} or its licensors
            and is protected by applicable intellectual property law. You may not
            reproduce or redistribute it without written permission.
          </p>

          <h2>Limitation of liability</h2>
          <p>
            To the extent permitted by law, we are not liable for indirect or
            consequential loss arising from the use of this website. Nothing in
            these terms excludes liability that cannot lawfully be excluded.
          </p>

          <h2>Changes to these terms</h2>
          <p>
            We may update these terms from time to time. The version published
            on this page at the time of your order is the version that applies to
            that order.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these terms can be sent to{" "}
            <a href={`mailto:${contact.emails.general}`}>
              {contact.emails.general}
            </a>
            , or to{" "}
            <a href={`mailto:${contact.emails.support}`}>
              {contact.emails.support}
            </a>{" "}
            for support matters.
          </p>
        </div>
      </Section>
    </>
  );
}
