/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1A3263',
          50: '#E8EDF5',
          100: '#D1DBEB',
          200: '#A3B7D7',
          300: '#7593C3',
          400: '#476FAF',
          500: '#1A3263',
          600: '#162B56',
          700: '#122349',
          800: '#0E1C3C',
          900: '#0A142F',
        },
      },
    },
  },
  plugins: [],
};
