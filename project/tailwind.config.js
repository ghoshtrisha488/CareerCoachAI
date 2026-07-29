/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50: '#eef6ff', 100: '#d9ecff', 200: '#bcddff', 300: '#8ec7ff', 400: '#59a7ff',
          500: '#3385ff', 600: '#1c66f5', 700: '#1551e1', 800: '#1842b6', 900: '#1a3c8f',
          950: '#142657',
        },
        accent: {
          50: '#f0fdf9', 100: '#ccfbef', 200: '#99f6e0', 300: '#5eead4', 400: '#2dd4bf',
          500: '#14b8a6', 600: '#0d9488', 700: '#0f766e', 800: '#115e59', 900: '#134e4a',
        },
        ink: {
          50: '#f7f8fa', 100: '#eef0f4', 200: '#dde1ea', 300: '#c2c9d8',
          400: '#9aa3ba', 500: '#717c98', 600: '#56607a', 700: '#444c63',
          800: '#2f3548', 900: '#1d2235', 950: '#11151f',
        },
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgba(20, 38, 87, 0.08), 0 4px 16px -4px rgba(20, 38, 87, 0.06)',
        card: '0 1px 3px rgba(20, 38, 87, 0.08), 0 8px 24px -8px rgba(20, 38, 87, 0.12)',
        glow: '0 0 0 1px rgba(51, 133, 255, 0.1), 0 8px 32px -8px rgba(51, 133, 255, 0.35)',
      },
      backgroundImage: {
        'grid-light': "linear-gradient(rgba(20,38,87,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(20,38,87,0.04) 1px, transparent 1px)",
        'grid-dark': "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
      },
      keyframes: {
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'pulse-ring': { '0%': { transform: 'scale(0.95)', opacity: '0.7' }, '70%': { transform: 'scale(1.3)', opacity: '0' }, '100%': { transform: 'scale(0.95)', opacity: '0' } },
        'shimmer': { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        'pulse-ring': 'pulse-ring 1.5s cubic-bezier(0.215,0.61,0.355,1) infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
};
