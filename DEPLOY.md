# MhodNgan - Deployment Guide

This document describes how to deploy the **MhodNgan KMUTT Frontend** project to **Vercel** using **GitHub Actions**.

---

## Overview

- **Framework:** [Astro](https://astro.build)
- **Hosting:** [Vercel](https://vercel.com)
- **CI/CD:** GitHub Actions (`.github/workflows/deploy.yml`)
- **Package Manager:** pnpm
- **Testing:** Vitest (unit), Playwright (E2E)
- **Linting/Formatting:** ESLint + Prettier

---

## Environment Setup

### 1. Prerequisites
Before deployment, make sure you have:
- Node.js **v20+**
- pnpm **v9+**
- A **Vercel** account and linked GitHub repository
- Access to the following environment secrets

### 2. Required Environment Variables

Add the following secrets to your GitHub repository:

| Secret Name | Description |
|--------------|-------------|
| `VERCEL_TOKEN` | Your Vercel API token (from Vercel Dashboard → Account Settings → Tokens) |
| `VERCEL_ORG_ID` | Organization ID of your Vercel team |
| `VERCEL_PROJECT_ID` | Project ID of this frontend app on Vercel |
| `PUBLIC_API_URL` | Public API endpoint for your backend |
| `PUBLIC_SUPABASE_URL` | Supabase project URL |
| `PUBLIC_SUPABASE_ANON_KEY` | Supabase public anonymous key |

Optional (for local or private builds):
| Secret Name | Description |
|--------------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | (Optional) For server-side operations |
| `SUPABASE_JWT_SECRET` | (Optional) JWT validation secret |

---

## GitHub Actions Workflow

Deployment is handled automatically via the workflow in  
**`.github/workflows/deploy.yml`**

### 🔹 Trigger Conditions
| Branch | Deployment Type |
|---------|------------------|
| `main` | Production deploy to Vercel |
| `dev` | Preview deploy to Vercel |
| `setup-*` | Temporary/Setup branch deploy |
| `pull_request` | Deploys preview for PRs |

---

## Workflow Summary

### Step 1: Build
- Checkout repository  
- Setup Node.js + pnpm  
- Install dependencies  
- Run ESLint, Prettier, TypeScript, Astro, and Vitest  
- Build Astro project (`pnpm run build`)

### Step 2: E2E Test & Deploy
- Setup Playwright environment  
- Run E2E tests  
- Upload test report to GitHub Actions artifacts  
- Deploy to Vercel (Production or Preview depending on branch)

---

## Manual Deployment (Optional)

If you prefer manual deployment (bypassing CI/CD):

```bash
# Build the project
pnpm install
pnpm run build

# Deploy manually to Vercel
vercel --prod
````

Make sure your `.env` file contains:

```bash
PUBLIC_SUPABASE_URL=...
PUBLIC_SUPABASE_ANON_KEY=...
```

---

## Post-deployment Check

After successful deployment:

1. Open your deployed URL (Vercel link)
2. Check console for API or Supabase connection errors
3. Verify pages and localization load properly
4. Run `pnpm preview` locally if you need to debug production builds

---

## Troubleshooting

| Issue                   | Possible Fix                                              |
| ----------------------- | --------------------------------------------------------- |
| Build fails on Vercel | Check Node version in `package.json` or lockfile          |
| 403 or 401 Errors    | Verify Supabase keys are set correctly in GitHub Secrets  |
| Playwright timeout   | Increase timeout in `playwright.config.ts` or run locally |
| Environment mismatch | Ensure `.env` matches GitHub Secrets values               |

---

## References

* [Astro Deployment Docs](https://docs.astro.build/en/guides/deploy/)
* [Vercel Deployment Guide](https://vercel.com/docs)
* [GitHub Actions for Vercel](https://github.com/amondnet/vercel-action)
