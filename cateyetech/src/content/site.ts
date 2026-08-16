/**
 * Single source of truth for site copy.
 *
 * Content mirrors the pages published on cateyetech.com — home, about us,
 * the service pages (cyber security, VA/PT, IT security audit, IT security
 * strategy, on-demand IT leadership), careers, contact, get started, and the
 * legal pages.
 */

export const company = {
  name: "CATEYE",
  legalName: "CATEYE TECHNOLOGY",
  domain: "cateyetech.com",
  url: "https://cateyetech.com",
  tagline: "IT Strategy · IT Security · Digital Transformation",
  shortDescription:
    "Technology thought leadership, cybersecurity and digital transformation services for organizations that need to move fast without giving up control.",
  philosophy:
    "Digital Transformation and IT Security is not a destination, it is a journey. We partner with our customers so they can stay focused on their core business.",
};

export const contact = {
  emails: {
    general: "info@cateyetech.com",
    support: "support@cateyetech.com",
  },
  offices: [
    {
      region: "America",
      country: "United States",
      address: ["30B Trolley Square", "Wilmington, DE 19806"],
      phone: "+1 512 827 8586",
      phoneHref: "+15128278586",
    },
    {
      region: "India",
      country: "India",
      address: ["D-26, South Ext. – I", "New Delhi – 110049"],
      phone: "+91 99996 69619",
      phoneHref: "+919999669619",
    },
  ],
};

/** The six spectrums CATEYE organizes its offering around. */
export const spectrums = [
  {
    title: "Leadership On-Demand",
    description:
      "CTO, CIO and CISO expertise on a flexible engagement model — senior talent without a senior headcount.",
  },
  {
    title: "Assessment",
    description:
      "Vulnerability assessment, penetration testing and security audits that measure posture against how attackers actually operate.",
  },
  {
    title: "GRC",
    description:
      "Governance, risk and compliance programs structured around the gaps that matter to your regulators and your board.",
  },
  {
    title: "Professional Services",
    description:
      "Hands-on delivery teams for cloud migration, application security and infrastructure modernization.",
  },
  {
    title: "Cybersecurity Trainings",
    description:
      "Practitioner-led training and awareness programs that turn policy documents into everyday behaviour.",
  },
  {
    title: "Automation Services",
    description:
      "Process automation on cloud-hosted platforms to remove manual effort and the errors that come with it.",
  },
];

export const capabilities = [
  {
    title: "Cloud Migration",
    description:
      "Transform organizational processes by moving workloads to the cloud with a migration plan that accounts for security from day one.",
    icon: "cloud" as const,
  },
  {
    title: "Security Across Devices",
    description:
      "Secure the entire infrastructure and application estate — endpoints, networks, APIs and everything in between.",
    icon: "shield" as const,
  },
  {
    title: "On-Demand CXO",
    description:
      "CIO, CTO and CISO leadership available when you need it, aligning technology decisions to business goals.",
    icon: "compass" as const,
  },
  {
    title: "Process Automation",
    description:
      "Cloud-hosted automation platforms that streamline repetitive work and give teams back their time.",
    icon: "bolt" as const,
  },
];

export const industries = [
  "Technology & Media",
  "E-commerce Portals",
  "Healthcare",
  "Retail",
];

export const approach = [
  {
    step: "01",
    title: "Understand",
    description:
      "We start with your objectives, not a product catalogue. Digital needs differ across businesses, sectors and industries, so the plan is built around company-specific goals.",
  },
  {
    step: "02",
    title: "Assess",
    description:
      "Risk assessments across people, processes and technology establish where you actually stand — resilience levels, security gaps and maturity.",
  },
  {
    step: "03",
    title: "Design",
    description:
      "A security and technology program built on the identified gaps, with improved policies and procedures that counter real attack paths.",
  },
  {
    step: "04",
    title: "Operate",
    description:
      "Monitoring, detection and response management, plus a cyber resiliency plan that adapts as adversaries change tactics.",
  },
];

export type Service = {
  slug: string;
  /** Path on the original site, preserved as a redirect. */
  legacyPath: string;
  title: string;
  eyebrow: string;
  summary: string;
  intro: string[];
  highlights: { title: string; description: string }[];
  outcomes: string[];
};

export const services: Service[] = [
  {
    slug: "cyber-security-services",
    legacyPath: "/cyber-security-services",
    title: "Cyber Security Services",
    eyebrow: "Advisory & Managed Security",
    summary:
      "Comprehensive advisory and managed security services to mitigate breaches — from threat monitoring and detection through to response management.",
    intro: [
      "CATEYE provides comprehensive advisory and managed security services to mitigate breaches, helping clients end to end — from the monitoring and detection of threats to implementing a response management program.",
      "Once probable attacks and vulnerabilities are identified, our team devises a security solution with layered protection against both expected and unexpected attacks, and builds an intelligent cyber resiliency plan that adapts to keep up with cyber adversaries.",
    ],
    highlights: [
      {
        title: "Monitoring & detection",
        description:
          "Continuous visibility into threats across infrastructure and applications, so incidents surface while they are still small.",
      },
      {
        title: "Layered protection",
        description:
          "A security solution designed around identified attack paths, with defences for expected and unexpected attacks alike.",
      },
      {
        title: "Cyber resiliency planning",
        description:
          "Resiliency plans and SOPs your employees can actually follow, kept adaptable as adversaries change tactics.",
      },
      {
        title: "Incident & forensic response",
        description:
          "Security experts devise the response management to combat incidents; forensic experts facilitate quick responses that contain attacks and minimize impact.",
      },
    ],
    outcomes: [
      "Breaches contained before they become business events",
      "A documented, rehearsed response program",
      "Clear ownership across security operations",
    ],
  },
  {
    slug: "va-pt-services",
    legacyPath: "/va-pt-services",
    title: "VA / PT Services",
    eyebrow: "Vulnerability Assessment & Penetration Testing",
    summary:
      "Vulnerability assessment and penetration testing delivered by experienced consultants, enabling an effective vulnerability management strategy.",
    intro: [
      "At CATEYE, Vulnerability Assessment and Penetration Testing is done by well experienced consultants, enabling our clients to implement an effective vulnerability management strategy.",
      "We follow a systematic approach of planning, scanning, analysis and remediation. Our team uses custom tools and techniques to detect security vulnerabilities, penetrating into the network in order to bring snags and hitches to the surface — and then remediate them.",
    ],
    highlights: [
      {
        title: "Planning",
        description:
          "Scope, rules of engagement and success criteria agreed up front, so testing maps to the systems that carry real risk.",
      },
      {
        title: "Scanning",
        description:
          "Assessment across all three domains — People, Processes and Technology — to understand resilience levels and security gaps in the existing IT environment.",
      },
      {
        title: "Analysis",
        description:
          "Findings identified by ethical hackers using the same methods real attackers use, giving an accurate view of cyber resilience and maturity.",
      },
      {
        title: "Remediation",
        description:
          "Once testing completes, our experts design a security program around the identified gaps, introducing improved policies and procedures to counter attacks.",
      },
    ],
    outcomes: [
      "An accurate, evidence-based view of cyber maturity",
      "Prioritized remediation your engineers can act on",
      "A repeatable vulnerability management strategy",
    ],
  },
  {
    slug: "it-security-audit",
    legacyPath: "/it-security-audit",
    title: "IT Security Audit",
    eyebrow: "Posture & Maturity",
    summary:
      "Test and assess your overall security posture and maturity level, then structure the governance and compliance program that closes the gaps.",
    intro: [
      "CATEYE provides IT Security Audit services through which organizations can test and assess their overall security posture and maturity level.",
      "Our experts take a custom, pro-active approach — regularly performing diverse security tests on networks, applications, APIs and beyond, using the same methods to assess systems as a hacker would, to get real-time analysis.",
    ],
    highlights: [
      {
        title: "Pro-active testing",
        description:
          "Diverse security tests run regularly across networks, applications and APIs rather than once a year for a certificate.",
      },
      {
        title: "Attacker's perspective",
        description:
          "Systems assessed the way a hacker would assess them, producing real-time analysis instead of theoretical findings.",
      },
      {
        title: "Governance & compliance",
        description:
          "Our IT security consultants help organizations structure a mature IT governance and compliance program after assessing the gaps.",
      },
      {
        title: "Board-ready reporting",
        description:
          "Posture and maturity expressed in terms leadership can act on and track over time.",
      },
    ],
    outcomes: [
      "A measured baseline of security posture and maturity",
      "A structured IT governance and compliance program",
      "Audit evidence that stands up to scrutiny",
    ],
  },
  {
    slug: "it-security-strategy",
    legacyPath: "/it-security-strategy",
    title: "IT Security Strategy",
    eyebrow: "Strategy & Roadmap",
    summary:
      "A security strategy and roadmap that aligns to business objectives, so investment goes where the risk actually is.",
    intro: [
      "Businesses need a customized IT strategy to become competitive and to maintain high technology standards continually — and that requires both expertise and experience.",
      "CATEYE works with you to define the security strategy and roadmap for your organization: what to protect, in what order, with which controls, and how success is measured.",
    ],
    highlights: [
      {
        title: "Risk-led prioritization",
        description:
          "Investment sequenced against business risk, not vendor roadmaps.",
      },
      {
        title: "Architecture & controls",
        description:
          "Security across devices to secure the entire infrastructure and application estate.",
      },
      {
        title: "Policy & process",
        description:
          "Policies and procedures written to be operated, with clear ownership at every step.",
      },
      {
        title: "Measurable roadmap",
        description:
          "A phased plan with milestones, so progress is visible quarter over quarter.",
      },
    ],
    outcomes: [
      "A security roadmap tied to business objectives",
      "Defensible prioritization of security spend",
      "Continually maintained technology standards",
    ],
  },
  {
    slug: "on-demand-it-leadership",
    legacyPath: "/on-demand-it-leadership",
    title: "On-Demand IT Leadership",
    eyebrow: "CIO · CTO · CISO as a Service",
    summary:
      "Access to senior talent and expertise with flexible models of engagement, in a cost effective way.",
    intro: [
      "Organizations face challenges that diminish the viability of hiring an in-house CIO — senior talent is difficult to attract on limited affordability, and technological complexity makes a full-time hire impractical for many companies.",
      "CATEYE's on-demand leadership gives you access to senior talent and expertise with flexible models of engagement, in a cost effective way.",
    ],
    highlights: [
      {
        title: "CIO on demand",
        description:
          "Responsible for building the right IT strategy and roadmap for the company by aligning IT with the business to achieve company goals.",
      },
      {
        title: "CTO on demand",
        description:
          "Responsible for building the right product, application and platform strategy and roadmap for the company.",
      },
      {
        title: "CISO on demand",
        description:
          "Responsible for building the right information security strategy — ensuring information availability anytime, anywhere, securely, to achieve business goals.",
      },
      {
        title: "Flexible engagement",
        description:
          "Fractional, interim or advisory models, scaled up and down as your needs change.",
      },
    ],
    outcomes: [
      "Senior technology leadership without a senior headcount",
      "A customized IT strategy that keeps you competitive",
      "Continuity through growth, funding rounds and audits",
    ],
  },
  {
    slug: "digital-transformation",
    legacyPath: "/digital-transformation",
    title: "Digital Transformation",
    eyebrow: "Cloud · Automation · Digital Presence",
    summary:
      "Cloud migration, process automation and digital presence — enabling the business digitally and securely.",
    intro: [
      "Digital needs differ across businesses, sectors and industries, requiring a focused approach towards the achievement of company-specific objectives. Our approach helps organizations optimize their capabilities and resources while enabling businesses digitally and securely.",
      "We support clients with risk assessments, solutions to security challenges, digital transformation through process automation, and the development of digital presence through software, web, mobile and customer interaction solutions.",
    ],
    highlights: [
      {
        title: "Cloud migration",
        description:
          "Transform organizational processes by moving to the cloud, with security designed into the migration rather than bolted on after.",
      },
      {
        title: "Process automation",
        description:
          "Cloud-hosted platforms that automate repetitive processes and reduce manual error.",
      },
      {
        title: "Digital presence",
        description:
          "Software, web, mobile and customer interaction solutions that carry the business forward.",
      },
      {
        title: "Secure by design",
        description:
          "Security across devices and applications, so transformation does not widen the attack surface.",
      },
    ],
    outcomes: [
      "Optimized capabilities and resources",
      "Manual processes replaced with automated ones",
      "A digital estate that is secure as it scales",
    ],
  },
  {
    slug: "grc-compliance",
    legacyPath: "/grc",
    title: "Governance, Risk & Compliance",
    eyebrow: "GRC",
    summary:
      "A governance and compliance program structured around your real gaps, your regulators and your risk appetite.",
    intro: [
      "Compliance work fails when it is run as a paperwork exercise. CATEYE structures governance, risk and compliance programs on top of assessed reality — the gaps we have measured in your environment.",
      "Our IT security consultants help organizations structure a mature IT governance and compliance program, with policies and procedures that teams can operate day to day.",
    ],
    highlights: [
      {
        title: "Risk assessment",
        description:
          "Risk understood across people, processes and technology, and expressed in business terms.",
      },
      {
        title: "Policy framework",
        description:
          "Improved policies and procedures introduced to counter attacks and make the organization secure.",
      },
      {
        title: "Control operation",
        description:
          "Controls mapped to owners and evidence, so audits are a report rather than a scramble.",
      },
      {
        title: "Continuous maturity",
        description:
          "Governance that keeps improving as the business and the threat landscape move.",
      },
    ],
    outcomes: [
      "A mature IT governance and compliance program",
      "Audit-ready evidence, continuously maintained",
      "Risk decisions made by the business, with data",
    ],
  },
  {
    slug: "cybersecurity-trainings",
    legacyPath: "/cybersecurity-trainings",
    title: "Cybersecurity Trainings",
    eyebrow: "People & Awareness",
    summary:
      "Practitioner-led training that turns cyber resiliency plans and SOPs into behaviour your employees actually follow.",
    intro: [
      "Technology controls only hold when the people around them know what to do. CATEYE chalks out cyber resiliency plans and SOPs for employees to follow, and trains teams on them.",
      "Training is delivered by the same practitioners who run our assessments, so the material reflects the attacks we see in the field rather than a generic curriculum.",
    ],
    highlights: [
      {
        title: "Security awareness",
        description:
          "Role-relevant awareness training that covers phishing, social engineering and safe handling of data.",
      },
      {
        title: "Technical training",
        description:
          "Deeper sessions for engineering and operations teams on secure development, hardening and detection.",
      },
      {
        title: "SOP enablement",
        description:
          "Cyber resiliency plans and SOPs written for employees to follow, then rehearsed until they are second nature.",
      },
      {
        title: "Incident drills",
        description:
          "Tabletop and live exercises that test the response program before an incident does.",
      },
    ],
    outcomes: [
      "Employees who recognise and report attacks",
      "SOPs that are followed rather than filed",
      "A response team that has practised under pressure",
    ],
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}

export const stats = [
  { value: "2", label: "Continents", detail: "Offices in the US and India" },
  { value: "6", label: "Service spectrums", detail: "Leadership to automation" },
  { value: "4+", label: "Industry verticals", detail: "Tech, e-commerce, healthcare, retail" },
  { value: "Decades", label: "Of experience", detail: "Across our founding team" },
];

export const navigation = {
  primary: [
    { label: "About", href: "/about-us" },
    { label: "Services", href: "/services" },
    { label: "Approach", href: "/#approach" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact-us" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms-conditions" },
  ],
};
