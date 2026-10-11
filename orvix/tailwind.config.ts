import type { Config } from "tailwindcss";

// All colors come from CSS variables (see src/app/globals.css),
// so light and dark themes share the same class names.
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1rem", screens: { "2xl": "1240px" } },
    extend: {
      colors: {
        bg: v("bg"),
        surface: v("surface"),
        raised: v("raised"),
        line: v("line"),
        ink: v("ink"),
        muted: v("muted"),
        brand: { DEFAULT: v("brand"), strong: v("brand-strong"), soft: v("brand-soft"), ink: v("brand-ink") },
        accent: v("accent"),
        magenta: v("magenta"),
        blue: v("blue"),
        navy: v("navy"),
        ok: v("ok"),
        warn: v("warn"),
        danger: v("danger"),
      },
      fontFamily: {
        display: ["'Sora Variable'", "system-ui", "sans-serif"],
        sans: ["'Manrope Variable'", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderRadius: { sm: "6px", md: "10px", lg: "16px", xl: "24px" },
      boxShadow: {
        lift: "0 1px 0 rgb(var(--line) / 1), 0 18px 40px -24px rgb(var(--shadow) / 0.55)",
        glow: "0 0 0 1px rgb(var(--brand) / 0.35), 0 20px 60px -20px rgb(var(--brand) / 0.55)",
      },
    },
  },
  plugins: [],
};
export default config;
