import type { Config } from 'tailwindcss';

/**
 * Tailwind CSS v4 Configuration
 * 
 * Note: Tailwind v4 uses a new configuration approach.
 * The CLI `npx tailwindcss init` is deprecated in v4.
 * Configuration is now done via CSS @theme or this config file.
 * 
 * Key Changes in v4:
 * - No more `npx tailwindcss init` command
 * - Use @tailwindcss/vite plugin instead of PostCSS plugin
 * - Theme customization via CSS @theme directive or config file
 * - Improved performance and smaller bundle sizes
 */

const config: Config = {
  content: [
    './index.html',
    './*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './services/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      colors: {
        'liquid-silver': '#94a3b8',
        'liquid-obsidian': '#020617',
      },
    },
  },
  plugins: [],
};

export default config;