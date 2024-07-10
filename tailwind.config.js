/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{svelte,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'teal-green': '#2DFFDC',
        'select-background': '#fff'
      }
    }
  },
  plugins: []
}
