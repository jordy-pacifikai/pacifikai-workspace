import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        atn: {
          primary: '#0F4C81',
          secondary: '#00A5B5',
          accent: '#F5A623',
          dark: '#1a1a2e',
          light: '#f8fafc'
        }
      }
    },
  },
  plugins: [],
}
export default config
