/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          terracotta: '#B8683D',
          'terracotta-hover': '#A0552D',
          'terracotta-dark': '#D9875A',
          amber: '#D97706',
          sand: '#EAE4DC',
        },
        atelier: {
          bg: '#FBF9F5',
          card: '#FFFFFF',
          border: '#E8E2D9',
          surface: '#F4EFEA',
          'dark-bg': '#141211',
          'dark-card': '#1C1917',
          'dark-border': '#2E2A27',
          'dark-surface': '#24201D',
        }
      },
      fontFamily: {
        cormorant: ['"Cormorant Garamond"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
