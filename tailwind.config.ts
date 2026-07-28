import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#070b1e',
        abyss: '#04060f',
        emerald: { deep: '#0d2b25', velvet: '#123830' },
        royal: '#16224e',
        champagne: '#e9d5ae',
        pearl: '#f6f1e7',
        ivory: '#fdf9f0',
        rosegold: '#d9a08b',
        gold: { DEFAULT: '#d4af6a', bright: '#f0d494', deep: '#9c7430', ember: '#c98d4b' },
        burgundy: '#571e2c',
        blush: '#e8c4c4',
        candle: '#ffd9a0',
      },
      fontFamily: {
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
        script: ['var(--font-vibes)', 'cursive'],
        royal: ['var(--font-cinzel)', 'serif'],
        body: ['var(--font-jost)', 'sans-serif'],
      },
      letterSpacing: {
        regal: '0.42em',
        grand: '0.24em',
      },
    },
  },
  plugins: [],
};

export default config;
