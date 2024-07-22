/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{svelte,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif']
      },
      colors: {
        'gff-light-green': '#1FA29C',
        'extra-light-green': '#A3DAD6',
        'gff-light-blue': '#1A90C0'
      }
    }
  },
  plugins: []
}
