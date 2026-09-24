/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        theme: {
          primaryDark: '#2D3441',       // Deep Navy Charcoal
          darkest: '#232932',           // Charcoal
          secondaryGray: '#6C7380',     // Slate Gray
          lightGray: '#A9A7A8',         // Cool Gray
          mainBg: '#EDECEB',            // Off White
          cardWhite: '#F8F8F6',         // Soft White
          primaryAccent: '#E07015',     // Warm Orange
          orangeLight: '#DF9B60',       // Soft Orange
          warmBeige: '#DFCAB2',         // Cream Beige
          textWhite: '#FFFFFF',         // White
        },
        brand: {
          50: '#FDF7F2',
          100: '#FBECE0',
          200: '#DFCAB2', // Cream Beige
          300: '#DF9B60', // Soft Orange
          400: '#E8822E',
          500: '#E07015', // Warm Orange (Primary Accent)
          600: '#C75D0D',
          700: '#A14808',
          800: '#2D3441', // Deep Navy Charcoal
          900: '#232932', // Charcoal
          950: '#191D24',
        },
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-soft': 'bounceSoft 2s infinite',
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
        'bell-ring': 'bellRing 1s ease-in-out',
      },
      keyframes: {
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(-3%)' },
          '50%': { transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bellRing: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '20%, 60%': { transform: 'rotate(15deg)' },
          '40%, 80%': { transform: 'rotate(-15deg)' },
        },
      },
    },
  },
  plugins: [],
}
