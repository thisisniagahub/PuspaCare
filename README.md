# PUSPA Care

PUSPA Care is a Next.js 16 / React 19 / Prisma application for NGO operations. The app uses a shell-style UI with role-based modules, versioned API routes, and custom standalone build/start scripts.

## Prerequisites

- Node.js and `npm`
- Bun

`npm` is the main command entrypoint, but `npm run build` and `npm run start` call Bun-backed scripts under `scripts/`.

## Quick Start

```bash
npm install
npm run dev
```

The app starts on `http://localhost:3000` and writes logs to `dev.log`.

## Environment

- Local development uses SQLite through Prisma.
- Supported variables are documented in [`.env.example`](./.env.example).
- For production, the repo is prepared for Supabase / PostgreSQL and Vercel-style environment injection.
- Do not commit real secrets, API keys, or production database URLs.

## Common Commands

- `npm run dev` - start local development
- `npm run dev:watch` - auto-restart the dev server if it exits
- `npm run lint` - run ESLint
- `npm run build` - create the Next.js build and prepare standalone output
- `npm run start` - run the standalone preview flow
- `npm run db:push` - push Prisma schema changes to the current database
- `npm run db:migrate` - create and apply a Prisma migration in development
- `npm run db:generate` - regenerate Prisma client
- `npm run db:seed` - seed development data
- `npm run db:reset` - reset the development database

## Project Layout

```text
src/
  app/           App Router shell, auth routes, API routes
  modules/       Internal feature screens rendered inside the root shell
  components/    App-level components
  components/ui/ Shared shadcn/Radix primitives
  lib/           Auth, db, API, uploads, domain helpers
  stores/        Zustand state
  types/         Shared contracts such as ViewId
prisma/          Schema and seed files
scripts/         Standalone build/start helpers
public/          Static assets
upload/          Uploaded/local image assets
```

## Development Notes

- Most product screens live in `src/modules/*` and are rendered inside the root shell, not as separate routes.
- When adding a new module, keep the identifier aligned across `src/types/index.ts`, `src/app/page.tsx`, and `src/components/app-sidebar.tsx`.
- Add business API handlers under `src/app/api/v1/*`; `src/app/api/route.ts` is only a placeholder.
- Edit `prisma/schema.sqlite.prisma` for schema work. Treat `prisma/schema.postgres.prisma` as generated output.
- Keep business logic out of `src/components/ui/*`; that subtree is the shared primitive layer.
- Auth and role enforcement live on the server side in `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, and `src/proxy.ts`.

## Validation

There is no checked-in automated test suite or CI workflow yet. The current baseline is:

```bash
npm run lint
```

After linting, manually verify the feature or flow you changed, especially for auth, API, upload, and Prisma-related changes.

## Contributor Rules

Read [`AGENTS.md`](./AGENTS.md) before broad changes. If you touch `src/app`, `src/app/api`, `src/components/ui`, or `src/modules`, also read the nearest nested `AGENTS.md` in that subtree because local rules override the project-level guide.
