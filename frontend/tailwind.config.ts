import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cherry: {
          DEFAULT: '#B3173B',
          dark: '#8C0F2C',
          soft: '#F7E4E8',
        },
        navy: {
          DEFAULT: '#14213D',
          light: '#243557',
          soft: '#E7EAF1',
        },
        cream: {
          DEFAULT: '#FAF6EF',
          dark: '#F2EBDD',
          deeper: '#E6DFD3',
        },
        ink: '#1B1B1F',
        muted: '#6B6B76',
        line: '#E6DFD3',
        success: '#2E7D5B',
        warning: '#D98E04',
        danger: '#C62828',
        info: '#2F6DB5',
        wood: {
          DEFAULT: '#8B5E3C',
          dark: '#6B4428',
          light: '#C99A6B',
        },
      },
      fontFamily: {
        serif: ['Fraunces', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['"Trebuchet MS"', 'Calibri', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        paper: '0 1px 2px rgba(20, 33, 61, 0.04), 0 14px 34px -20px rgba(20, 33, 61, 0.24)',
        cover: '0 18px 40px -18px rgba(27, 27, 31, 0.55), 0 4px 10px rgba(27, 27, 31, 0.12)',
        lift: '0 28px 60px -28px rgba(20, 33, 61, 0.45)',
      },
      borderRadius: {
        DEFAULT: '8px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        marquee: 'marquee 28s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
