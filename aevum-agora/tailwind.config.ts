import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#fbfaf6',
          100: '#f7f3ea',
          200: '#efe6d4',
          300: '#e2d2b1',
          400: '#d4bb8a',
          500: '#c5a46a',
          600: '#aa8551',
          700: '#896742',
          800: '#6e5237',
          900: '#5c452f'
        }
      },
      fontFamily: {
        display: ['ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif']
      },
      boxShadow: {
        colonnade: '0 10px 30px -10px rgba(0,0,0,0.25)'
      }
    }
  },
  plugins: []
}
export default config