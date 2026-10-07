/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#fdf8f0',
          100: '#f5e6c8',
          200: '#e8cfa0',
        },
        stone: {
          800: '#2d2926',
          900: '#1a1714',
          950: '#0d0b09',
        },
        blood: {
          500: '#8b1a1a',
          600: '#6b1414',
          700: '#4a0e0e',
        },
        ember: {
          400: '#f59e0b',
          500: '#d97706',
          600: '#b45309',
        },
        arcane: {
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
        },
        forest: {
          600: '#16a34a',
          700: '#15803d',
        },
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        crimson: ['Crimson Text', 'serif'],
      },
    },
  },
  plugins: [],
};
