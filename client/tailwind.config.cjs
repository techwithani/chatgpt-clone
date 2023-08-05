// const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  // darkMode: 'class',
  darkMode: ['class'],
  theme: {
    // colors: {
    //   'gpt-dark-gray': '#343541',
    // },
    fontFamily: {
      sans: ['Söhne', 'sans-serif'],
      mono: ['Söhne Mono', 'monospace'],
    },
    extend: {
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      colors: {
        gray: {
          '50': '#f5f7fa',
          '100': '#e9eff6',
          '200': '#c8d8e9', // Replacing .bg-gray-200
          '300': '#a7c0dc',
          '400': '#6f9ed0',
          '500': '#1d7fd5',
          '600': '#1565a8',
          '700': '#0f4b7a', // Replacing .dark .dark:bg-gray-700 and .dark .dark:hover:bg-gray-700:hover
          '800': '#0a3b5c', // Replacing .dark .dark:bg-gray-800, .bg-gray-800, and .dark .dark:hover:bg-gray-800\/90
          '900': '#08304b', // Replacing .dark .dark:bg-gray-900, .bg-gray-900, and .dark .dark:hover:bg-gray-900:hover
          '1000': '#08304b',
        },
        green: {
          50: '#f1f9f7',
          100: '#def2ed',
          200: '#a6e5d6',
          300: '#6dc8b9',
          400: '#41a79d',
          500: '#10a37f',
          600: '#126e6b',
          700: '#0a4f53',
          800: '#06373e',
          900: '#031f29',
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('tailwindcss-radix')(),
    // require('@tailwindcss/typography'),
  ],
};
