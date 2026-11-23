/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        hekto: {
          pink: '#FB2E86',
          pinkHover: '#E02575',
          purple: '#7E33E0',
          purpleHover: '#6B22CD',
          navy: '#151875',
          navyLight: '#1A0B2E',
          subtext: '#8A8FB9',
          surface: '#F2F0FF',
          card: '#F6F5FF',
          footer: '#EEEFFB',
          footerBottom: '#E7E4F8',
          border: '#E8E6F1',
        },
      },
      fontFamily: {
        josefin: ['var(--font-josefin)', 'Josefin Sans', 'sans-serif'],
        lato: ['var(--font-lato)', 'Lato', 'sans-serif'],
      },
      borderRadius: {
        theme: '4px',
      },
    },
  },
  plugins: [],
};
