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
        navy: {
          DEFAULT: "oklch(0.25 0.05 250)",
          50: "oklch(0.96 0.01 250)",
          100: "oklch(0.90 0.02 250)",
          200: "oklch(0.80 0.03 250)",
          300: "oklch(0.65 0.04 250)",
          400: "oklch(0.45 0.05 250)",
          500: "oklch(0.25 0.05 250)",
          600: "oklch(0.20 0.05 250)",
          700: "oklch(0.16 0.04 250)",
          800: "oklch(0.12 0.03 250)",
          900: "oklch(0.08 0.02 250)",
        },
        steel: {
          DEFAULT: "oklch(0.55 0.12 245)",
          50: "oklch(0.96 0.02 245)",
          100: "oklch(0.90 0.04 245)",
          200: "oklch(0.80 0.06 245)",
          300: "oklch(0.70 0.08 245)",
          400: "oklch(0.62 0.10 245)",
          500: "oklch(0.55 0.12 245)",
          600: "oklch(0.48 0.10 245)",
          700: "oklch(0.40 0.08 245)",
        },
        warm: {
          DEFAULT: "oklch(0.55 0.01 250)",
          50: "oklch(0.97 0.005 250)",
          100: "oklch(0.93 0.005 250)",
          200: "oklch(0.85 0.008 250)",
          300: "oklch(0.75 0.008 250)",
          400: "oklch(0.65 0.01 250)",
          500: "oklch(0.55 0.01 250)",
          600: "oklch(0.45 0.01 250)",
          700: "oklch(0.35 0.01 250)",
        },
        gold: {
          DEFAULT: "oklch(0.72 0.12 85)",
          50: "oklch(0.97 0.02 85)",
          100: "oklch(0.93 0.04 85)",
          200: "oklch(0.87 0.07 85)",
          300: "oklch(0.82 0.09 85)",
          400: "oklch(0.77 0.11 85)",
          500: "oklch(0.72 0.12 85)",
          600: "oklch(0.62 0.10 85)",
          700: "oklch(0.52 0.08 85)",
        },
      },
      fontFamily: {
        display: ['"DM Serif Display"', "Georgia", "serif"],
        body: ['"Inter"', "system-ui", "sans-serif"],
      },
      fontSize: {
        "fluid-xs": "clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)",
        "fluid-sm": "clamp(0.875rem, 0.8rem + 0.375vw, 1rem)",
        "fluid-base": "clamp(1rem, 0.9rem + 0.5vw, 1.125rem)",
        "fluid-lg": "clamp(1.125rem, 1rem + 0.625vw, 1.25rem)",
        "fluid-xl": "clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)",
        "fluid-2xl": "clamp(1.5rem, 1.2rem + 1.5vw, 2rem)",
        "fluid-3xl": "clamp(1.875rem, 1.5rem + 1.875vw, 2.5rem)",
        "fluid-4xl": "clamp(2.25rem, 1.75rem + 2.5vw, 3.5rem)",
        "fluid-5xl": "clamp(3rem, 2rem + 5vw, 5.5rem)",
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
        "4xl": "1.5rem",
      },
      boxShadow: {
        "elevation-1": "0 1px 3px oklch(0.25 0.05 250 / 0.08), 0 1px 2px oklch(0.25 0.05 250 / 0.06)",
        "elevation-2": "0 4px 6px oklch(0.25 0.05 250 / 0.07), 0 2px 4px oklch(0.25 0.05 250 / 0.06)",
        "elevation-3": "0 10px 20px oklch(0.25 0.05 250 / 0.10), 0 4px 8px oklch(0.25 0.05 250 / 0.06)",
        "elevation-4": "0 20px 40px oklch(0.25 0.05 250 / 0.12), 0 8px 16px oklch(0.25 0.05 250 / 0.08)",
        "glow-gold": "0 0 40px oklch(0.72 0.12 85 / 0.15)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "fade-in-up": "fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-in-left": "slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-in-right": "slideInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in": "scaleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "shimmer": "shimmer 2.5s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
        "grain": "grain 8s steps(10) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(32px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-40px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(40px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
        grain: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "10%": { transform: "translate(-5%, -10%)" },
          "30%": { transform: "translate(3%, -15%)" },
          "50%": { transform: "translate(12%, 9%)" },
          "70%": { transform: "translate(9%, 4%)" },
          "90%": { transform: "translate(-1%, 7%)" },
        },
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
