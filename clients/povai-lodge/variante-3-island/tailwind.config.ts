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
        sunset: {
          50: "#FDF0EC",
          100: "#FBE1D9",
          200: "#F7C3B3",
          300: "#F3A58D",
          400: "#EF8767",
          500: "#E76F51",
          600: "#D4502E",
          700: "#A23D23",
          800: "#702A18",
          900: "#3E170D",
        },
        gold: {
          50: "#FDF9EE",
          100: "#FBF3DD",
          200: "#F7E7BB",
          300: "#F3DB99",
          400: "#EFCF77",
          500: "#E9C46A",
          600: "#DDB03A",
          700: "#B58E24",
          800: "#846819",
          900: "#534210",
        },
        deep: {
          50: "#E9EDEE",
          100: "#D3DBDD",
          200: "#A7B7BB",
          300: "#7B9399",
          400: "#4F6F77",
          500: "#264653",
          600: "#1E3842",
          700: "#172A32",
          800: "#0F1C21",
          900: "#080E11",
        },
        cream: {
          50: "#FFFEFB",
          100: "#FFFCF5",
          200: "#FFF9EB",
          300: "#FFF6E1",
          400: "#FFF3D7",
          500: "#FFF0CD",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Source Sans 3", "system-ui", "sans-serif"],
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
