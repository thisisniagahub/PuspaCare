# PROJECT KNOWLEDGE BASE

**Generated:** 2026-04-24 22:55:00 +08:00
**Commit:** 6b01093
**Branch:** main

## OVERVIEW
PUSPA is a single Next.js 16 / React 19 / Prisma app rooted here. The workspace parent `G:\PROJECT-13` is only a container; treat `PuspaCare/` as the actual repo root.

## STRUCTURE
```text
./
├── src/app/            # App Router shell, auth routes, versioned API
├── src/modules/        # Internal screens rendered inside `/`
├── src/components/ui/  # shadcn/Radix primitive layer
├── src/lib/            # auth, db, API client, domain helpers, uploads
├── src/stores/         # Zustand state for shell + ops conductor
├── prisma/             # SQLite source schema + generated Postgres twin
├── scripts/            # standalone build/start and production prep
├── agent-ctx/          # agent notes, not runtime code
├── examples/           # experiments; excluded from TS build
└── mini-services/      # excluded from TS build
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Add a user-facing screen | `src/modules/*` | Most screens are internal views, not routes |
| Wire a module into navigation | `src/types/index.ts`, `src/app/page.tsx`, `src/components/app-sidebar.tsx` | Keep IDs aligned across all 3 |
| Add or change HTTP endpoints | `src/app/api/v1/*` | `/api/route.ts` is placeholder-only |
| Change auth or role guards | `src/proxy.ts`, `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts` | High-risk surface |
| Change Prisma models | `prisma/schema.sqlite.prisma` | `schema.postgres.prisma` is generated |
| Change standalone deployment flow | `scripts/prepare-standalone.ts`, `scripts/start-standalone.ts`, `scripts/prepare-production.sh` | Build/start are customized |
| Change shared primitives | `src/components/ui/*` | Keep product logic out |
| Change OpenClaw / Ops features | `src/modules/openclaw/*`, `src/modules/ops-conductor/page.tsx`, `src/app/api/v1/openclaw/*`, `src/app/api/v1/ops/*` | Developer-heavy slice |

## CODE MAP
| Symbol / File | Type | Location | Role |
|---------------|------|----------|------|
| `Home` | App shell | `src/app/page.tsx` | Authenticated root view; dynamic module loader |
| `ViewId` | Contract | `src/types/index.ts` | Canonical module IDs |
| `AppSidebar` | Navigation | `src/components/app-sidebar.tsx` | Role-gated sidebar + module entry points |
| `useAppStore` | Zustand store | `src/stores/app-store.ts` | Current view, sidebar, command palette |
| `authOptions` | Auth config | `src/lib/auth.ts` | NextAuth credentials flow + role normalization |
| `GET` / `POST` auth route | API route | `src/app/api/auth/[...nextauth]/route.ts` | Node runtime + login rate limiting |
| `db` | Prisma client | `src/lib/db.ts` | Shared DB handle |
| `schema.sqlite.prisma` | Schema source | `prisma/schema.sqlite.prisma` | Canonical schema for edits |
| `schema.postgres.prisma` | Generated schema | `prisma/schema.postgres.prisma` | Production twin; do not edit directly |
| `OpsConductor` | Developer module | `src/modules/ops-conductor/page.tsx` | Backed by `/api/v1/ops/*` |

## CONVENTIONS
- Repo root is `PuspaCare/`, not the workspace parent.
- The main UI is a store-driven shell: adding a feature screen usually means a module under `src/modules`, a `ViewId`, a dynamic import in `src/app/page.tsx`, and a sidebar entry.
- `src/app/asnafpreneur/page.tsx` exists as a real route, but Asnafpreneur also exists as an internal shell view.
- Tooling is intentionally mixed: `bun.lock` and `package-lock.json` both exist; install/build/start flows are not pure npm.
- `build` and `start` are wrapped by local scripts because the app ships standalone output and local preview fallbacks.
- TS config excludes `examples/`, `skills/`, `mini-services/`, and `prisma/seed.ts`; keep app code in `src/`.
- Validation baseline is `npm run lint` plus manual checks; there is no checked-in test runner or CI workflow here.

## ANTI-PATTERNS (THIS PROJECT)
- Do not edit `prisma/schema.postgres.prisma`; edit `prisma/schema.sqlite.prisma` instead.
- Do not add a top-level route for every feature by default; most features belong in the root shell.
- Never use client-side navigation state as authorization truth; server auth and role checks live in `src/proxy.ts` and `src/lib/auth.ts`.
- Do not put product logic, API calls, or Zustand coupling into `src/components/ui/*`.
- Do not treat `src/proxy.ts.bak` as active code.
- Never commit real secrets; local-only fallbacks in `scripts/start-standalone.ts` are for preview only.

## UNIQUE STYLES
- UI copy is largely Malay and role labels are Malay-first.
- Sidebar navigation is grouped by business domain and role, with a developer-only OpenClaw / Ops section.
- `src/app/api/route.ts` is intentionally trivial while real behavior lives under `/api/v1/*`.

## COMMANDS
```bash
bun install --frozen-lockfile
npm run dev
npm run lint
npm run build
bun run start
npm run db:push
npm run db:migrate
npm run db:seed
```

## NOTES
- No top-level README or checked-in GitHub Actions workflow was found in this repo.
- `src/proxy.ts` is the active auth gate; the older `src/middleware.ts` has already been removed from the tracked tree.
- `src/components/ui/*` follows shadcn generator style, which differs from some app-level files; preserve local style when editing that subtree.
