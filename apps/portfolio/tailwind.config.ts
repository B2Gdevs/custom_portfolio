import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/repub-builder/src/reader/**/*.{js,ts,jsx,tsx}',
  ],
  // In Tailwind v4, theme is defined in CSS using @theme directive
  // This config only needs content paths
};

export default config;

