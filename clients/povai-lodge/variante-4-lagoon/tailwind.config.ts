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
        sand: {
          50: '#FAF7F2',
          100: '#F5F0E8',
          200: '#EDE5D5',
          300: '#E0D4BF',
        },
        lagoon: {
          DEFAULT: '#1A9E96',
          light: '#2DBDB4',
          deep: '#0D7377',
          dark: '#094F52',
        },
        gold: {
          DEFAULT: '#C4A265',
          light: '#D4B87E',
          dark: '#A8874D',
        },
        ink: {
          DEFAULT: '#2C2C2C',
          light: '#4A4A4A',
          muted: '#7A7A7A',
        },
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['var(--font-lato)', 'Lato', 'Helvetica Neue', 'sans-serif'],
      },
      borderRadius: {
        'organic': '24px',
        'organic-lg': '32px',
      },
      letterSpacing: {
        'luxury': '0.3em',
        'wide-luxury': '0.2em',
      },
      transitionTimingFunction: {
        'luxury': 'cubic-bezier(0.33, 1, 0.68, 1)',
      },
    },
  },
  plugins: [],
};
export default config;
