/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          dark: '#4f46e5',
          light: '#818cf8',
        },
        bg: {
          DEFAULT: '#0f172a',
          card: '#1e293b',
          input: '#0f172a',
        },
        border: '#334155',
      },
      animation: {
        'fade-slide-up': 'fadeSlideUp 0.4s ease',
        'spin-slow': 'spin 0.7s linear infinite',
      },
      keyframes: {
        fadeSlideUp: {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
