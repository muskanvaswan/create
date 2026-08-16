import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { company } from "@/content/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(company.url),
  title: {
    default: `${company.legalName} — ${company.tagline}`,
    template: `%s — ${company.legalName}`,
  },
  description: company.shortDescription,
  keywords: [
    "cyber security services",
    "vulnerability assessment",
    "penetration testing",
    "IT security audit",
    "CISO on demand",
    "CIO on demand",
    "digital transformation",
    "cloud migration",
  ],
  openGraph: {
    type: "website",
    siteName: company.legalName,
    title: `${company.legalName} — ${company.tagline}`,
    description: company.shortDescription,
    url: company.url,
  },
  twitter: {
    card: "summary_large_image",
    title: `${company.legalName} — ${company.tagline}`,
    description: company.shortDescription,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink-900 focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: company.legalName,
              url: company.url,
              description: company.shortDescription,
              email: "info@cateyetech.com",
              address: [
                {
                  "@type": "PostalAddress",
                  streetAddress: "30B Trolley Square",
                  addressLocality: "Wilmington",
                  addressRegion: "DE",
                  postalCode: "19806",
                  addressCountry: "US",
                },
                {
                  "@type": "PostalAddress",
                  streetAddress: "D-26, South Ext. – I",
                  addressLocality: "New Delhi",
                  postalCode: "110049",
                  addressCountry: "IN",
                },
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
