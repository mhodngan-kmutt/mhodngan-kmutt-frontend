import { defineConfig } from 'tailwindcss'

export default defineConfig({
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,svelte,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans Thai"', 'sans-serif'],
        mono: ['Menlo', 'monospace'],
      },
      colors: {
        main: {
          primary: 'rgba(249, 115, 22, 1)',
          neutral: 'rgba(229, 229, 229, 1)',
          neutral2: 'rgba(38, 38, 38, 1)',
          white: 'rgba(255, 255, 255, 1)',
          black: 'rgba(0, 0, 0, 1)',
          secondary: 'rgba(14, 165, 233, 1)',
          background: 'rgba(250, 250, 250, 1)',
        },
        supporting: {
          support: 'rgba(64, 64, 64, 1)',
          light: {
            sky: 'rgba(125, 211, 252, 1)',
            orange: 'rgba(253, 186, 116, 1)',
          },
          dark: {
            sky: 'rgba(3, 105, 161, 1)',
            orange: 'rgba(194, 65, 12, 1)',
          },
          error: 'rgba(239, 68, 68, 1)',
        },
        float: {
          background: 'rgba(250, 250, 250, 0.8)',
          neutral: 'rgba(229, 229, 229, 0.8)',
        },
      },
    },
  },
})
