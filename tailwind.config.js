/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cosmic: {
          bg: '#0A0A14',
          purple: '#8B5CF6',
          gold: '#FCD34D',
          green: '#10B981',
          red: '#EF4444',
          blue: '#60A5FA',
        },
      },
      fontFamily: {
        display: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'sans-serif'],
        body: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'sans-serif'],
        rounded: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Rounded', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'twinkle': 'twinkle 2.5s ease-in-out infinite',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
