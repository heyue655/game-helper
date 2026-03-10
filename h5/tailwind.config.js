/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#e83030',
        gold: '#c8a054',
        dark: {
          DEFAULT: '#0d0d0d',
          card: '#1a1a1a',
          surface: '#242424',
          border: '#2e2e2e',
        },
      },
      fontFamily: {
        sans: ['PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
