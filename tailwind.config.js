/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Remap Tailwind purple, violet, indigo to unified Sainy Couture Atelier palette
        purple: {
          50: '#FAF6F0',
          100: '#FAF5EE',
          200: '#F3ECE2',
          300: '#E8DFD3',
          400: '#C5A059',
          500: '#802243',
          600: '#5B172E',
          700: '#431021',
          800: '#340C1A',
          900: '#240611',
          950: '#16030A',
        },
        violet: {
          50: '#FAF6F0',
          100: '#FAF5EE',
          200: '#F3ECE2',
          300: '#E8DFD3',
          400: '#C5A059',
          500: '#802243',
          600: '#5B172E',
          700: '#431021',
          800: '#340C1A',
          900: '#240611',
          950: '#16030A',
        },
        indigo: {
          50: '#FAF6F0',
          100: '#FAF5EE',
          200: '#F3ECE2',
          300: '#E8DFD3',
          400: '#C5A059',
          500: '#802243',
          600: '#5B172E',
          700: '#431021',
          800: '#340C1A',
          900: '#240611',
          950: '#16030A',
        },
        couture: {
          burgundy: '#5B172E',
          'burgundy-dark': '#431021',
          'burgundy-light': '#7A2240',
          gold: '#9B783E',
          'gold-light': '#C5A059',
          'gold-dark': '#785A28',
          cream: '#FAF6F0',
          'cream-dark': '#F2ECE1',
          card: '#FFFFFF',
          border: '#E8DFD3',
          muted: '#8C827A'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

