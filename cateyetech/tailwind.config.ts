import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f5f7fa",
          100: "#e9eef5",
          200: "#cbd6e6",
          300: "#a3b4cd",
          400: "#6f86a8",
          500: "#4b6285",
          600: "#374b68",
          700: "#28374d",
          800: "#1a2434",
          900: "#0f1724",
          950: "#080d16",
        },
        brand: {
          50: "#ecfeff",
          100: "#cff9fe",
          200: "#a5f1fc",
          300: "#67e4f9",
          400: "#22cdee",
          500: "#06aed4",
          600: "#088bab",
          700: "#0e6f8b",
          800: "#155a71",
          900: "#164b60",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,23,36,0.04), 0 8px 24px -12px rgba(15,23,36,0.18)",
        lift: "0 2px 4px rgba(15,23,36,0.05), 0 20px 40px -20px rgba(15,23,36,0.28)",
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
