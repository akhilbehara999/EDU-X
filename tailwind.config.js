/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#050505',
        charcoal: '#0a0a0a',
        lava: '#FF4500', // Lava Orange
        amber: '#FFBF00', // Amber Gold
        glass: 'rgba(255, 255, 255, 0.05)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(255, 69, 0, 0.3)',
        'glow-sm': '0 0 10px rgba(255, 191, 0, 0.2)',
        'inner-glow': 'inset 0 0 20px rgba(255, 69, 0, 0.1)',
        'glow-lg': '0 0 40px rgba(255, 69, 0, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-medium': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}