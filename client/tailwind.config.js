/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      colors: {
        ink: '#102a43',
        teal: { 50: '#effcf8', 100: '#d8f6ed', 500: '#119b7d', 600: '#087b65', 700: '#086353' },
      },
      boxShadow: { card: '0 16px 50px rgba(16, 42, 67, .08)' },
    },
  },
  plugins: [],
};
