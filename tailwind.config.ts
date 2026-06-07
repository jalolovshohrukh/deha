import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7f0",
          100: "#d6ecdc",
          500: "#1f9d55",
          600: "#198048",
          700: "#136639",
        },
      },
    },
  },
  plugins: [],
};

export default config;
