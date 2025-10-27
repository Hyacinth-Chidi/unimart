# UniMart — Frontend (Next.js)

This repository contains the UniMart frontend, a Next.js application (React 19) used with the UniMart student marketplace project. It is intended to be deployed alongside the `unimart-backend` service; both can live in the same Git repository (monorepo) or separate repos.

## Contents

- `app/` — Next.js App Router pages and components
- `components/` — shared UI components and primitives
- `public/` — static assets

## Quick start — local development

### Prerequisites

- Node.js 18+ recommended
- npm (or pnpm/yarn)

### Install and run

Open a terminal in `unimart/` and run:

```powershell
cd "C:\Users\HP\Desktop\UNIMART PROJECT\unimart"
npm ci
npm run dev
```

Then open http://localhost:3000. The Next dev server supports fast refresh.

## Scripts

- `npm run dev` — Run development server (Next.js)
- `npm run build` — Build for production
- `npm run start` — Start production server (after build)
- `npm run lint` — Run ESLint

## Environment variables

For local development create a `.env.local` (do not commit) with the variables your app needs. Below are the common vars this frontend expects:

- `NEXT_PUBLIC_API_URL` — Public URL to the backend API (e.g. `https://unimart-backend.onrender.com`)
- `NEXT_PUBLIC_RESEND_KEY` — (optional) public keys used client-side

Example `.env.example` (copy to `.env.local` and fill values):

```env
# Frontend
NEXT_PUBLIC_API_URL=https://your-backend.example.com
```

Note: Any environment variable prefixed with `NEXT_PUBLIC_` will be exposed to the browser. Keep secrets only on the backend and in Render environment variables.

## Build & run (production)

```powershell
npm ci
npm run build
npm run start
```

By default `next start` listens on port 3000; Render will set `PORT` automatically when you deploy as a Web Service.

## Deploying to Render (recommended for this project)

If you deploy the monorepo to Render, create two services (one for the frontend, one for the backend). When creating each service, set the **Root Directory** to the appropriate subfolder.

Frontend service settings (Render Web Service):

- Repository root: your GitHub repo
- Root Directory: `unimart`
- Build Command: `npm ci && npm run build`
- Start Command: `npm run start`
- Environment:
  - `NEXT_PUBLIC_API_URL` = `https://<your-backend-service>.onrender.com`
  - `NODE_ENV` = `production`

Notes:
- Use **Web Service** for SSR/Server-side Next.js. If your app is fully static, you can use a Static Site with `next export`, but current setup uses SSR.
- If your backend is in the same repo, set the backend Render service's Root Directory to `unimart-backend`.

Backend quick-check & health endpoint:

- The backend exposes `/health` (e.g. `https://<backend>.onrender.com/health`) — Render can use this as the health check path.

## Monorepo tips

- Commit a top-level `.gitignore` covering both projects. Example entries: `node_modules/`, `.env`, `.next/`, `prisma/dev.db`.
- When using Render, each service selects a subdirectory as its build root so both services can deploy from the same repo.

## Troubleshooting

- Build failures: check Render build logs for missing environment variables or Node version mismatches. Add an `engines.node` field to `package.json` with your desired Node version (e.g. `"18.x"`) if needed.
- CORS / API errors: ensure the backend `FRONTEND_URL` (or allowed origins) includes your Render frontend domain and any preview URLs.
- Images or Cloudinary: if you use external image providers, update `next.config.js` image domains or set up the Cloudinary environment variables on the backend.

## Contributing

- Create feature branches from `main` and open pull requests. Keep PRs small and focused.
- Run linting and local build before opening a PR:

```powershell
npm run lint
npm run build
```

## References

- Next.js docs: https://nextjs.org/docs
- Render docs: https://render.com/docs

## License

This project is MIT licensed — see the top-level `LICENSE` (or add one) for details.

---

If you'd like, I can also:

- add a `.env.example` file to the repo
- create/update a top-level `.gitignore`
- scaffold a `render.yaml` for Git-based Render services

Tell me which of the above you'd like me to add and I'll commit the changes.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
