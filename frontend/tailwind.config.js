/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        'tss-red': '#ED1C24',
        'tss-gray': '#E6E7E8',
      },
    },
  },
  plugins: [],
};
