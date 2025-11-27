import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        emotion: {
          joy: '#10b981',
          sadness: '#3b82f6',
          anger: '#ef4444',
          fear: '#8b5cf6',
          surprise: '#f59e0b',
          love: '#ec4899',
          neutral: '#6b7280',
        },
        // Soft Feminine Pastel Palette
        pastel: {
          pink: '#FFB6D9',
          rose: '#FFD4E5',
          blush: '#FFC9DD',
          lavender: '#E6D5F5',
          lilac: '#D8BFF8',
          purple: '#C4A3F3',
          peach: '#FFD5CC',
          coral: '#FFC4BC',
          aqua: '#C2E9F5',
          sky: '#B8E0F5',
          mint: '#D4F1E8',
          cream: '#FFF8F0',
          // Text colors
          textPrimary: '#7A6BA8',
          textSecondary: '#D873A6',
          textMuted: '#B5A3C7',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-bottom': 'slideInFromBottom 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'sparkle': 'sparkle 3s ease-in-out infinite',
        'shimmer': 'shimmer 8s linear infinite',
        'gentle-bounce': 'gentle-bounce 3s ease-in-out infinite',
      },
      keyframes: {
        slideUp: {
          'from': {
            transform: 'translateY(20px)',
            opacity: '0',
          },
          'to': {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
        slideInFromBottom: {
          'from': {
            transform: 'translateY(100%)',
            opacity: '0',
          },
          'to': {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
        'pulse-glow': {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '0.5',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0) translateX(0)',
          },
          '50%': {
            transform: 'translateY(-20px) translateX(10px)',
          },
        },
        sparkle: {
          '0%, 100%': {
            opacity: '0.3',
            transform: 'scale(0.8) rotate(0deg)',
          },
          '50%': {
            opacity: '0.9',
            transform: 'scale(1.2) rotate(180deg)',
          },
        },
        shimmer: {
          '0%': {
            backgroundPosition: '-200% 0',
          },
          '100%': {
            backgroundPosition: '200% 0',
          },
        },
        'gentle-bounce': {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};

export default config;
