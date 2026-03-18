import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        electric: "#2563EB",
        emerald: "#059669",
        ink: "#0F172A",
        slate: "#64748B",
        "off-white": "#F8FAFC",
        "emerald-light": "#ECFDF5",
        "electric-light": "#EFF6FF",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "4px",
        md: "8px",
      },
    },
  },
  plugins: [],
};
export default config;
