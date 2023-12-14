/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'foreground-light': 'var(--foreground-light)',
        'foreground-dark': 'var(--foreground-dark)',
        'background-dark-soil': 'var(--background-dark-soil)',
        'background-earthy-grape': 'var(--background-earthy-grape)',
        'background-earthy-green': 'var(--background-earthy-green)',
        'background-light-rose': 'var(--background-light-rose)',
        'background-purple': 'var(--background-purple)',
        'background-sunny-rose': 'var(--background-sunny-rose)',
        'background-vibrant-pink': 'var(--background-vibrant-pink))',
      },
      fontFamily: {
        primary: ['var(--font-primary)', 'sans-serif'],
        secondary: ['var(--font-secondary)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
