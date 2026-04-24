# PuspaCare Project Context

PuspaCare is a SaaS Enterprise platform for **PUSPA** (Pertubuhan Urus Peduli Asnaf KL & Selangor), designed to manage asnaf (beneficiaries), donations, volunteers, and operational workflows with AI-integrated capabilities.

## Project Overview

- **Architecture:** Next.js 16 (App Router) with a Single Page Application (SPA) shell in `src/app/page.tsx`. Views are swapped dynamically via Zustand state (`currentView`).
- **Frontend:** React 19, Tailwind CSS 4, shadcn/ui, Framer Motion, Lucide React.
- **Backend:** Next.js API Routes (`src/app/api/v1/*`), Prisma ORM.
- **Database:** SQLite (local dev) / PostgreSQL (production).
- **Authentication:** Next-Auth v4 with Credentials Provider.
- **State Management:** Zustand (for app shell and module-specific stores).
- **AI Integration:** z-ai-web-dev-sdk, OpenClaw (MCP servers), Ops Conductor.

## Technical Standards

- **Coding Style:** TypeScript, 2-space indentation, strict typing.
- **Naming:** PascalCase for components, camelCase for functions/hooks, kebab-case for folders.
- **API Standard:** All responses must follow `{ success: boolean, data?: any, error?: string }`.
- **Database Rules:** Use `npx prisma db push` for schema sync during development. **Do not use `prisma migrate` unless explicitly instructed.**
- **Module Structure:**
  - Logic & UI: `src/modules/[module-name]/page.tsx`
  - API: `src/app/api/v1/[module-name]/route.ts`
  - Wiring: Add to `viewLabels` and `ViewRenderer` in `src/app/page.tsx` and sidebar in `src/components/app-sidebar.tsx`.

## Key Commands

- `npm run dev`: Start development server (Port 3000).
- `npm run build`: Production build.
- `npm run lint`: Run ESLint.
- `npx prisma db push`: Sync schema to database.
- `npx prisma generate`: Generate Prisma Client.
- `npx tsx prisma/seed.ts`: Seed database with initial data.

## Implementation Guidelines (Strict)

1.  **SPA Shell:** Navigation is state-driven. New "pages" are modules in `src/modules/` swapped in `src/app/page.tsx`.
2.  **Security:** Role-based access (admin, developer, ops, volunteer) is managed via session. Never use client-side state as the source of truth for authorization.
3.  **Data Contract:** Maintain strict alignment between Prisma enums, API responses, and UI badges.
4.  **No Mocks:** Transitioning away from mock data. Use real DB queries through Prisma.
5.  **AI Readiness:** The "Ops Conductor" and "OpenClaw" modules are core AI operational surfaces. Use `OpsConductor` for NL routing and task automation.

## Directory Structure

- `src/app`: Next.js shell, API routes, and global styles.
- `src/modules`: Individual business logic and UI views.
- `src/components/ui`: shadcn/ui primitives.
- `src/lib`: Shared utilities, auth helpers, and DB clients.
- `src/stores`: Zustand stores for global and module state.
- `prisma`: Database schema and seed scripts.
- `agent-ctx`: Detailed context for AI agents (legacy/specialized).

## Current Focus (Phase 1-2)

- Hardening Auth and Session management.
- Replacing remaining mock data in eKYC and TapSecure.
- Aligning data contracts across all modules.
- Completing the "Ops Conductor" MVP for AI-assisted operations.

---
*This file serves as the primary instructional context for Gemini CLI interactions in this repository.*
