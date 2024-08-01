/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{svelte,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif']
      },
      colors: {
        'gff-deep-green': '#09544F',
        'gff-dark-green': '#0C7168',
        'gff-green': '#1FA29C',
        'extra-light-green': '#A3DAD6',
        'gff-light-blue': '#1A90C0',
        'gff-extra-light-blue': '#CAE6E9'
      }
    }
  },
  plugins: []
}
