/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'winter-blue': '#0a1929',
        'winter-light-blue': '#1e3a5f',
        'winter-gold': '#ffd700',
        'winter-silver': '#c0c0c0',
        'winter-bronze': '#cd7f32',
      },
    },
  },
  plugins: [],
}
