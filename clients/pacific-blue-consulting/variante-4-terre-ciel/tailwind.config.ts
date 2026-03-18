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
        cream: "#FAFAF8",
        "cream-dark": "#F5F5F0",
        charcoal: "#1A1A1A",
        forest: "#1B4332",
        "forest-light": "#2D6A4F",
        steel: "#2E4057",
        "steel-light": "#3D5470",
        gold: "#B8860B",
        "gold-light": "#D4A017",
        separator: "#E5E5E0",
      },
      fontFamily: {
        serif: [
          "var(--font-cormorant)",
          "Cormorant Garamond",
          "Georgia",
          "serif",
        ],
        sans: [
          "var(--font-ibm-plex)",
          "IBM Plex Sans",
          "system-ui",
          "sans-serif",
        ],
      },
      fontSize: {
        "hero": [
          "clamp(2.5rem, 5vw + 1rem, 6rem)",
          { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "300" },
        ],
        "display": [
          "clamp(2.5rem, 5vw + 0.5rem, 5.5rem)",
          { lineHeight: "1.0", letterSpacing: "-0.02em", fontWeight: "300" },
        ],
        "heading": [
          "clamp(2rem, 4vw, 3.5rem)",
          { lineHeight: "1.05", letterSpacing: "-0.01em", fontWeight: "400" },
        ],
        "subheading": [
          "clamp(1.5rem, 3vw, 2.25rem)",
          { lineHeight: "1.15", fontWeight: "400" },
        ],
        "quote": [
          "clamp(1.5rem, 3vw, 2.5rem)",
          { lineHeight: "1.3", fontWeight: "300" },
        ],
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "out-quart": "cubic-bezier(0.25, 1, 0.5, 1)",
      },
      keyframes: {
        "scroll-line": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "40%": { opacity: "1" },
          "80%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(100%)", opacity: "0" },
        },
        "pulse-gold": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.3)" },
        },
      },
      animation: {
        "scroll-line": "scroll-line 2s ease-in-out infinite",
        "pulse-gold": "pulse-gold 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
