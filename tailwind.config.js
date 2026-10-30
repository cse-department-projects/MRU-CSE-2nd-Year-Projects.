/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0f5f1',
          100: '#dcebe0',
          200: '#c1d8c8',
          300: '#9fbea8',
          400: '#75a382',
          500: '#4a875a',
          600: '#3a7a48',
          700: '#2d603b',
          800: '#20452e',
          900: '#153222',
          950: '#0b2113'
        },
        leaf: {
          50: '#f2f9f4',
          100: '#e3f1dc',
          500: '#5c9768',
          600: '#4a7d55',
        },
        earth: {
          100: '#f5efe6',
          500: '#a67b5b',
        },
        sky: {
          100: '#e0f0f5',
          500: '#4a90e2',
          600: '#2878bd',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
