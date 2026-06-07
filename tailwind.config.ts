import type { Config } from "tailwindcss";

/**
 * Refresh design tokens exposed as CSS variables (RGB triplets) so Tailwind
 * opacity modifiers and theme switching work. See src/app/globals.css.
 */
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        refresh: {
          bg: "rgb(var(--refresh-bg) / <alpha-value>)",
          surface: "rgb(var(--refresh-surface) / <alpha-value>)",
          "surface-2": "rgb(var(--refresh-surface-2) / <alpha-value>)",
          "surface-3": "rgb(var(--refresh-surface-3) / <alpha-value>)",
          line: "rgb(var(--refresh-line) / <alpha-value>)",
          text: "rgb(var(--refresh-text) / <alpha-value>)",
          muted: "rgb(var(--refresh-muted) / <alpha-value>)",
          "muted-2": "rgb(var(--refresh-muted-2) / <alpha-value>)",
          sage: "rgb(var(--refresh-sage) / <alpha-value>)",
          lavender: "rgb(var(--refresh-lavender) / <alpha-value>)",
          blue: "rgb(var(--refresh-blue) / <alpha-value>)",
          pink: "rgb(var(--refresh-pink) / <alpha-value>)",
          periwinkle: "rgb(var(--refresh-periwinkle) / <alpha-value>)",
          "on-pastel": "rgb(var(--refresh-on-pastel) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
