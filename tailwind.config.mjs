/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{astro,html,js,jsx,ts,tsx,svelte,vue}",
  ],
  theme: {
    extend: {
      colors: {
        "main-primary": "rgba(249, 115, 22, 1.00)",
        "main-neutral": "rgba(229, 229, 229, 1.00)",
        "main-neutral2": "rgba(38, 38, 38, 1.00)",
        "main-white": "rgba(255, 255, 255, 1.00)",
        "supporting-support": "rgba(64, 64, 64, 1.00)",
        "main-black": "rgba(0, 0, 0, 1.00)",
        "supporting-light-sky": "rgba(125, 211, 252, 1.00)",
        "supporting-dark-sky": "rgba(3, 105, 161, 1.00)",
        "supporting-light-orange": "rgba(253, 186, 116, 1.00)",
        "supporting-dark-orange": "rgba(194, 65, 12, 1.00)",
        "supporting-error": "rgba(239, 68, 68, 1.00)",
        "main-secondary": "rgba(14, 165, 233, 1.00)",
        "main-background": "rgba(250, 250, 250, 1.00)",
        "float-background": "rgba(250, 250, 250, 0.80)",
        "float-neutral-background": "rgba(229, 229, 229, 0.80)",
      },
    },
  },
  plugins: [],
};
