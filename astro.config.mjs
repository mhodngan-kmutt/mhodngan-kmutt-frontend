import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel/static'; // <-- เปลี่ยนจาก serverless เป็น static

export default defineConfig({
  output: 'static',
  adapter: vercel(),
  integrations: [react()],
  trailingSlash: 'always', // generate /en/ /th/
  build: {
    format: 'directory', // folder structure per route
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
