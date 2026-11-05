/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: '#12211D',
        canvas: '#F5F7F5',
        teal: {
          DEFAULT: '#0E6B5C',
          deep: '#0A4A40',
          light: '#E5F2EF',
        },
        amber: '#E08A3C',
        coral: '#D14343',
        sage: '#4F8F6D',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
