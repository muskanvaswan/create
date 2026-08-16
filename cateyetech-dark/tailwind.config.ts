import type { Config } from "tailwindcss";

/**
 * Dark-first theme. Colors are declared as CSS variables in globals.css and
 * surfaced here as semantic names, so a surface is picked by its role
 * (page / raised / sunken) rather than by a number on a scale.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        page: "rgb(var(--c-page) / <alpha-value>)",
        raised: "rgb(var(--c-raised) / <alpha-value>)",
        sunken: "rgb(var(--c-sunken) / <alpha-value>)",
        line: "rgb(var(--c-line) / <alpha-value>)",
        "line-strong": "rgb(var(--c-line-strong) / <alpha-value>)",
        heading: "rgb(var(--c-heading) / <alpha-value>)",
        body: "rgb(var(--c-body) / <alpha-value>)",
        muted: "rgb(var(--c-muted) / <alpha-value>)",
        faint: "rgb(var(--c-faint) / <alpha-value>)",
        brand: {
          DEFAULT: "rgb(var(--c-brand) / <alpha-value>)",
          soft: "rgb(var(--c-brand-soft) / <alpha-value>)",
          deep: "rgb(var(--c-brand-deep) / <alpha-value>)",
          ink: "rgb(var(--c-brand-ink) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 0 rgba(255,255,255,0.03) inset, 0 12px 32px -18px rgba(0,0,0,0.9)",
        lift: "0 1px 0 rgba(255,255,255,0.05) inset, 0 24px 48px -24px rgba(0,0,0,1)",
        glow: "0 12px 32px -14px rgb(var(--c-brand) / 0.55)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.16,1,0.3,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
