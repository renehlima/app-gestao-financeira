/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'geist-sans': ['var(--font-geist-sans)'],
        'geist-mono': ['var(--font-geist-mono)'],
        'inter': ['var(--font-inter)'],
        'roboto': ['var(--font-roboto)'],
        'open-sans': ['var(--font-open-sans)'],
        'source-code': ['var(--font-source-code)'],
        'fira-code': ['var(--font-fira-code)'],
        'jetbrains': ['var(--font-jetbrains)'],
      },
    },
  },
  plugins: [],
}