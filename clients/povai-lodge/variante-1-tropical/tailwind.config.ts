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
        turquoise: {
          50: "#E6F7F8",
          100: "#CCF0F1",
          200: "#99E0E3",
          300: "#66D1D5",
          400: "#33C1C7",
          500: "#0F969C",
          600: "#0C787D",
          700: "#095A5E",
          800: "#063C3F",
          900: "#031E1F",
        },
        tropical: {
          50: "#E7F5EF",
          100: "#CFEBDF",
          200: "#9FD7BF",
          300: "#6FC39F",
          400: "#3FAF7F",
          500: "#0C7C59",
          600: "#0A6347",
          700: "#074A35",
          800: "#053224",
          900: "#021912",
        },
        sand: {
          50: "#FEFCF7",
          100: "#FDF8EF",
          200: "#FAF1DF",
          300: "#F8EACF",
          400: "#F5E6CC",
          500: "#E8D4B0",
          600: "#D4BC8E",
          700: "#B89A6A",
          800: "#8C7450",
          900: "#5C4D35",
        },
        coral: {
          500: "#FF7F6E",
        },
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
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
