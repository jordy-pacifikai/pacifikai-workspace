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
        ocean: {
          50: "#E8EFF4",
          100: "#D1DFE9",
          200: "#A3BFD3",
          300: "#759FBD",
          400: "#477FA7",
          500: "#1B4965",
          600: "#163A51",
          700: "#102C3D",
          800: "#0B1D29",
          900: "#050F14",
        },
        sky: {
          50: "#EDF7FA",
          100: "#DBEFF5",
          200: "#B7DFEB",
          300: "#93CFE1",
          400: "#6FBFD7",
          500: "#62B6CB",
          600: "#3D9DB5",
          700: "#2E768A",
          800: "#1F4F5E",
          900: "#0F2731",
        },
        coral: {
          50: "#FEF0EB",
          100: "#FDE1D7",
          200: "#FBC3AF",
          300: "#F9A587",
          400: "#F6967B",
          500: "#F4845F",
          600: "#F15A2B",
          700: "#C73F14",
          800: "#8C2D0E",
          900: "#511A08",
        },
        offwhite: {
          50: "#FFFFFF",
          100: "#FDFCFA",
          200: "#FAF8F5",
          300: "#F5F2ED",
          400: "#EDE8E0",
          500: "#E8E3DB",
        },
      },
      fontFamily: {
        heading: ["Outfit", "system-ui", "sans-serif"],
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "fade-in-down": "fadeInDown 0.6s ease-out forwards",
        "slide-in-left": "slideInLeft 0.6s ease-out forwards",
        "slide-in-right": "slideInRight 0.6s ease-out forwards",
        "scale-in": "scaleIn 0.5s ease-out forwards",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
