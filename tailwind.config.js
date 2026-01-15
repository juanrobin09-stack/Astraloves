/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Main Theme - Red & Black
        cosmic: {
          bg: '#0A0A0A',
          black: '#0A0A0A',
          card: '#121212',
          surface: '#1A1A1A',
          elevated: '#242424',
          // Primary Red
          red: '#E63946',
          'red-light': '#FF6B6B',
          'red-dark': '#C1121F',
          'red-glow': 'rgba(230, 57, 70, 0.3)',
          // Accent Colors
          gold: '#FFD700',
          'gold-light': '#FFA500',
          green: '#10B981',
          blue: '#60A5FA',
          // Legacy alias for compatibility
          purple: '#E63946', // Map purple to red for legacy code
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Montserrat', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        rounded: ['Montserrat', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        small: '8px',
        medium: '12px',
        large: '20px',
        full: '9999px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'twinkle': 'twinkle 2.5s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'cosmic-pulse': 'cosmicPulse 2s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(230, 57, 70, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(230, 57, 70, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        cosmicPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.1)', opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-cosmic': 'linear-gradient(135deg, #0A0A0A 0%, #1A0000 50%, #0A0A0A 100%)',
      },
    },
  },
  plugins: [],
}
