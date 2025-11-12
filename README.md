<h1 align="center">MhodNgan Frontend</h1>


![banner](public/images/Banner.webp)

<p align="center">By
  <b>ทีมงานคุณภาพศูนย์วิจัยฟอร์มช่างร่างทรงนกคุ้มหลีแห่งเทคโนบางมด</b>
  <br />
  <a href="https://mhodngan.vercel.app/en">📎 Explore the web »</a>
</p>

## Overview

Frontend web application built with **Astro + React + TailwindCSS**, connected to **Supabase**.  
This project powers the **MhodNgan KMUTT** platform for managing and publishing student projects.


- Framework: **Astro**
- Components: **React (via @astrojs/react)** + **shadcn/ui**
- Styling: **TailwindCSS + tailwind-merge**
- Backend: **Supabase**
- Hosting: **Vercel**
- Testing: **Vitest** + **Playwright**
- Code Quality: **ESLint** + **Prettier** + **Husky**

## Project Structure

````

/
├── public/              # Static files (served directly)
│   └── images/          # Banners, logos, etc.
├── src/
│   ├── assets/          # Imported images & styles
│   ├── components/      # UI and layout components
│   ├── layouts/         # Layout templates
│   ├── pages/           # Astro pages (routes)
│   └── i18n/            # Translations
├── package.json
└── astro.config.mjs

````

## Developer Guide

### 1. Setup

```bash
git clone https://github.com/<your-org>/mhodngan-kmutt-frontend.git
cd mhodngan-kmutt-frontend
pnpm install
````

### 2. Environment Variables

Create a `.env` file in the root directory:

```bash
PUBLIC_SUPABASE_URL=...
PUBLIC_SUPABASE_ANON_KEY=...
```

### 3. Development

Start the local dev server:

```bash
pnpm dev
```

Then open [http://localhost:4321](http://localhost:4321)

### 4. Lint & Format

```bash
pnpm lint     # Run ESLint
pnpm format   # Run Prettier
```

### 5. Test

```bash
pnpm test          # Playwright (E2E)
pnpm exec vitest   # Vitest (unit)
```

### 6. Build

```bash
pnpm build
pnpm preview
```

## Deployment

This project is deployed automatically via **GitHub Actions** → **Vercel**.
Every push to `main` or `dev` triggers deployment.

📄 See [`DEPLOY.md`](./DEPLOY.md) for full deployment details.

## Contributing

1. Fork this repo
2. Create a new branch:

   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit your changes:

   ```bash
   git commit -m "feat: add your feature"
   ```
4. Push and open a Pull Request

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/).

## Learn More

* [Astro Documentation](https://docs.astro.build)
* [Supabase Docs](https://supabase.com/docs)
* [Vercel Deployment Guide](https://vercel.com/docs)

```
Built with ❤️ by ทีมงานคุณภาพศูนย์วิจัยฟอร์มช่างร่างทรงนกคุ้มหลีแห่งเทคโนบางมด
```