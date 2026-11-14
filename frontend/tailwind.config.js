/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        navy: {
          50: '#f1f5fb',
          100: '#dfe8f5',
          200: '#c0d0ea',
          300: '#93addb',
          400: '#5f81c4',
          500: '#3d62a9',
          600: '#2d4b8a',
          700: '#253d6f',
          800: '#1c2f56',
          900: '#12203d',
          950: '#0b1428'
        },
        gold: {
          400: '#e0b64f',
          500: '#c9983a',
          600: '#a97c2b'
        }
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)'
      }
    }
  },
  plugins: []
};
