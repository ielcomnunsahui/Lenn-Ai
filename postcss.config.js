/**
 * PostCSS Configuration for Tailwind CSS v4
 * 
 * Note: In Tailwind v4, when using @tailwindcss/vite plugin,
 * PostCSS configuration is optional. The Vite plugin handles
 * most of the processing automatically.
 * 
 * This file is kept for compatibility with other tools that
 * might need PostCSS (e.g., Storybook, Jest).
 */

export default {
  plugins: {
    autoprefixer: {},
  },
};