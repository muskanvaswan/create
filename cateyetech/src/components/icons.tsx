import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

/** The mark: an eye whose pupil is a vertical cat slit. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        d="M2.5 16C6 9.8 10.8 6.7 16 6.7S26 9.8 29.5 16c-3.5 6.2-8.3 9.3-13.5 9.3S6 22.2 2.5 16Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <ellipse cx="16" cy="16" rx="4.6" ry="6.4" fill="currentColor" opacity="0.16" />
      <path
        d="M16 9.8c1.9 1.7 2.9 3.8 2.9 6.2s-1 4.5-2.9 6.2c-1.9-1.7-2.9-3.8-2.9-6.2s1-4.5 2.9-6.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3 5 6v6c0 4.2 2.9 7.6 7 9 4.1-1.4 7-4.8 7-9V6l-7-3Z" />
      <path d="m9.2 12.2 2 2 3.6-3.8" />
    </svg>
  );
}

export function CloudIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7.2 18.5a4.2 4.2 0 0 1-.3-8.4 5.3 5.3 0 0 1 10.2-1.2 3.9 3.9 0 0 1 .6 7.7" />
      <path d="M12 12.5v7" />
      <path d="m9.4 15.1 2.6-2.6 2.6 2.6" />
    </svg>
  );
}

export function CompassIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.2 8.8-1.7 4.7-4.7 1.7 1.7-4.7 4.7-1.7Z" />
    </svg>
  );
}

export function BoltIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M13.2 3 5.8 13.2h5.1L10.4 21l7.6-10.4h-5.2L13.2 3Z" />
    </svg>
  );
}

export function ArrowIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={2} {...props}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="m3.8 7 8.2 6 8.2-6" />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M8.4 3.8 10 7.3 8.2 9.1a11.4 11.4 0 0 0 6.7 6.7l1.8-1.8 3.5 1.6v3.1c0 .9-.8 1.6-1.7 1.5C10.8 19.6 4.4 13.2 3.6 5.5A1.6 1.6 0 0 1 5.2 3.8h3.2Z" />
    </svg>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21s7-5.4 7-10.5A7 7 0 0 0 5 10.5C5 15.6 12 21 12 21Z" />
      <circle cx="12" cy="10.4" r="2.6" />
    </svg>
  );
}

export const capabilityIcons = {
  shield: ShieldIcon,
  cloud: CloudIcon,
  compass: CompassIcon,
  bolt: BoltIcon,
};
