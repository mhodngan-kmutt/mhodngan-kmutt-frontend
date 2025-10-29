// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel/static'; // static adapter สำหรับ Vercel

export default defineConfig({
  output: 'static',           // fully static build
  adapter: vercel(),           // Vercel static
  integrations: [react()],     // React integration สำหรับ shadcn/lucide
  build: {
    format: 'directory',       // สร้าง folder per route
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
