    You are an autonomous senior full-stack engineer working inside the PuspaCare repository.

    Your mission:
    Implement all local repo fixes needed for the OpenClaw ↔ PuspaCareBot ↔ PuspaCare integration, fix current lint/typecheck blockers, secure local secret artifacts, and rewrite PENDING_TASKS.md into an accurate, priority-based tracker.

    Repository:
    - WSL path: /mnt/g/PROJECT-13/PuspaCare
    - Windows path: G:\PROJECT-13\PuspaCare
    - Treat /mnt/g/PROJECT-13/PuspaCare as the real repo root.
    - The parent /mnt/g/PROJECT-13 is only a workspace container.
    - Do not edit files outside /mnt/g/PROJECT-13/PuspaCare unless only reading AGENTS.md from parent.
    - Do not commit or push.

    Important project rules:
    1. Read these first:
       - /mnt/g/PROJECT-13/AGENTS.md
       - /mnt/g/PROJECT-13/PuspaCare/AGENTS.md
       - /mnt/g/PROJECT-13/PuspaCare/src/app/AGENTS.md
       - /mnt/g/PROJECT-13/PuspaCare/src/app/api/AGENTS.md
       - /mnt/g/PROJECT-13/PuspaCare/src/modules/AGENTS.md if editing src/modules/*
    2. Canonical Prisma schema is prisma/schema.sqlite.prisma.
    3. Do not manually edit prisma/schema.postgres.prisma.
    4. Server-side authorization must live in src/lib/auth.ts, src/proxy.ts, and API route guards.
    5. Do not trust client/Zustand state for authorization.
    6. Never print, commit, or expose secret contents.

    Strict non-goals:
    - Do not SSH into VPS.
    - Do not restart OpenClaw.
    - Do not edit /root/.openclaw, /opt/operator/openclaw, Nginx, systemd, or gateway runtime.
    - Do not rotate credentials automatically.
    - Do not commit/push.
    - Do not print secret file contents.
    - Do not delete user files unless they are clearly generated temp files and ignored; if unsure, leave them ignored and report.

    Known current local issues:
    1. PENDING_TASKS.md exists but is untracked and has formatting/copy corruption:
       - first line is broken: “﻿ revio# ...”
       - uses backslashes instead of markdown backticks for paths.
       - references requireAdminOrBot, but repo uses requireBotAuth.
       - claims bot endpoints still use take: 15, but current code uses take: limit and skip: offset.
    2. src/app/api/v1/bot/keys/route.ts:
       - POST and DELETE require admin.
       - GET currently does not require admin. This is a security issue.
    3. src/lib/bot-middleware.ts:
       - TypeScript reports result possibly null.
       - requireBotAuth throws BotAuthError and returns BotContext, but some routes assume it can return NextResponse.
    4. Several src/app/api/v1/bot/* routes do:
       ts
       const auth = await requireBotAuth(request, 'members')
       if (auth instanceof NextResponse) return auth

       This is wrong; requireBotAuth throws on error.
    5. src/modules/members/page.tsx has lint/typecheck blockers:
       - imports KifayahCalculator from ./components/kifayah-calculator
       - imports HistoryTimeline from ./components/history-timeline
       - also defines local function KifayahCalculator
       - also defines local function HistoryTimeline
       - uses InfoRow but InfoRow is not defined/imported
       - uses AlertDialog* components but they are not imported
    6. Local temp/secret files may exist and must be ignored:
       - bot-plain-secret.txt
       - bot-raw-key.txt
       - agentId
       - create-bot-key.js
       - create-bot-key2.js
       - create-bot-key3.js
       - create-bot-key4.js
       - create-bot-key5.js
       - create-bot-key6.js
       - verify-test.ts

    Required implementation plan:

    PHASE 0 — Baseline and safety
    1. Run:
       bash
       cd /mnt/g/PROJECT-13/PuspaCare
       git status --short
       git branch --show-current
       git log -1 --oneline

    2. Read the AGENTS.md files listed above.
    3. Inspect:
       - package.json
       - .gitignore
       - PENDING_TASKS.md
       - src/lib/bot-auth.ts
       - src/lib/bot-middleware.ts
       - src/app/api/v1/bot/keys/route.ts
       - src/app/api/v1/bot/dashboard/route.ts
       - src/app/api/v1/bot/members/route.ts
       - src/app/api/v1/bot/cases/route.ts
       - src/app/api/v1/bot/donations/route.ts
       - src/app/api/v1/bot/ekyc/route.ts
       - src/app/api/v1/bot/ecoss-rpa/route.ts
       - src/modules/members/page.tsx
    4. Do not print contents of secret files.

    PHASE 1 — Ignore local secret/temp artifacts
    Modify .gitignore.

    Add entries if missing:
    gitignore
    Local bot/API secret artifacts
    bot-plain-secret.txt
    bot-raw-key.txt
    agentId
    create-bot-key*.js
    verify-test.ts
    .local-secrets/
    .local-scripts/
    *.local-secret
    *.secret.txt


    Important:
    - Do not print secret file contents.
    - Do not commit/delete secrets unless clearly safe.
    - If secret files are untracked, it is enough that git status no longer shows them after .gitignore update.
    - If some are already tracked, report that as a critical manual follow-up.

    Acceptance:
    - git status --short should not show ignored secret/temp artifacts as untracked.
    - No secret values printed.

    PHASE 2 — Fix bot middleware
    Modify src/lib/bot-middleware.ts.

    Required behavior:
    - requireBotAuth(request, requiredPermission?) returns Promise<BotContext>.
    - It never returns NextResponse.
    - It throws BotAuthError with 401/403.
    - It must be null-safe.

    Use this target logic:
    ts
    export async function requireBotAuth(
      request: NextRequest,
      requiredPermission?: keyof BotPermissions
    ): Promise<BotContext> {
      const authHeader = request.headers.get('Authorization')

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new BotAuthError('Missing or invalid Authorization header', 401)
      }

      const rawKey = authHeader.slice(7).trim()

      if (!rawKey) {
        throw new BotAuthError('Missing bot API key', 401)
      }

      const result = await verifyBotApiKey(rawKey)

      if (!result) {
        throw new BotAuthError('Bot authentication failed: invalid key', 401)
      }

      if (!result.valid) {
        throw new BotAuthError(Bot authentication failed: ${result.reason || 'invalid key'}, 401)
      }

      if (!result.bot) {
        throw new BotAuthError('Bot not found', 401)
      }

      if (requiredPermission && !result.bot.permissions[requiredPermission]) {
        throw new BotAuthError(Bot lacks required permission: ${requiredPermission}, 403)
      }

      return result.bot as BotContext
    }


    Also improve botAuthMiddleware:
    - avoid any if practical.
    - return JSON 401/403 for BotAuthError.
    - return generic 500 for unexpected errors.

    Acceptance:
    - npx tsc --noEmit no longer reports src/lib/bot-middleware.ts null issue.

    PHASE 3 — Add reusable bot auth error helper if useful
    If it reduces duplication, create helper in src/lib/bot-middleware.ts:

    ts
    export function botAuthErrorResponse(error: unknown) {
      if (error instanceof BotAuthError) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: error.status }
        )
      }

      return NextResponse.json(
        { success: false, error: 'Internal bot auth error' },
        { status: 500 }
      )
    }


    Use this helper in bot routes if clean.

    Acceptance:
    - no route uses auth instanceof NextResponse after calling requireBotAuth.

    PHASE 4 — Fix all bot route auth handling
    Modify:
    - src/app/api/v1/bot/dashboard/route.ts
    - src/app/api/v1/bot/members/route.ts
    - src/app/api/v1/bot/cases/route.ts
    - src/app/api/v1/bot/donations/route.ts
    - src/app/api/v1/bot/ekyc/route.ts
    - src/app/api/v1/bot/ecoss-rpa/route.ts

    Required:
    - Remove wrong pattern:
      ts
      const auth = await requireBotAuth(...)
      if (auth instanceof NextResponse) return auth

    - Use try/catch around requireBotAuth.
    - Missing/invalid API key returns JSON 401.
    - Missing permission returns JSON 403.
    - Preserve existing success response shapes.
    - Keep existing permissions:
      - dashboard => dashboard
      - members => members
      - cases => cases
      - donations => donations
      - ekyc => ekyc
    - For ecoss-rpa:
      - change to require ops permission if BotPermissions includes ops.
      - if you choose otherwise, explain why in final report.
    - Do not weaken route security.

    Example:
    ts
    try {
      await requireBotAuth(request, 'members')
    } catch (error) {
      return botAuthErrorResponse(error)
    }


    Acceptance:
    - no auth instanceof NextResponse remains in src/app/api/v1/bot.
    - bot routes compile.

    PHASE 5 — Secure bot key management endpoint
    Modify:
    - src/app/api/v1/bot/keys/route.ts

    Required:
    - Import AuthorizationError:
      ts
      import { AuthorizationError, requireRole } from '@/lib/auth'

    - Change GET signature:
      ts
      export async function GET(request: NextRequest)

    - Call:
      ts
      await requireRole(request, ['admin'])

      before listing keys.
    - POST and DELETE must return proper 401/403 if AuthorizationError occurs.
    - GET must not expose raw keys. Existing listBotApiKeys already selects metadata only; preserve that.

    Acceptance:
    - unauthenticated/non-admin GET /api/v1/bot/keys returns 401/403.
    - admin GET still returns metadata.
    - rawKey is only returned on POST creation, as existing behavior says.

    PHASE 6 — Fix members page lint/typecheck blockers
    Modify:
    - src/modules/members/page.tsx

    Known evidence:
    - imports:
      ts
      import { KifayahCalculator } from './components/kifayah-calculator';
      import { HistoryTimeline } from './components/history-timeline';

    - local duplicate functions exist near bottom:
      ts
      function KifayahCalculator(...)
      function HistoryTimeline()

    - missing InfoRow
    - missing AlertDialog*

    Steps:
    1. Inspect the imported components:
       - src/modules/members/components/kifayah-calculator.tsx
       - src/modules/members/components/history-timeline.tsx
    2. Decide whether imported components are the intended source of truth.
    3. Prefer imported components and remove duplicate local functions from page.tsx if compatible.
    4. If imported components are incomplete or incompatible, remove imports instead and keep local versions. But avoid duplicate symbol declarations.
    5. Add AlertDialog imports from existing UI component if file exists:
       - likely @/components/ui/alert-dialog
       Required import:
       ts
       import {
         AlertDialog,
         AlertDialogAction,
         AlertDialogCancel,
         AlertDialogContent,
         AlertDialogDescription,
         AlertDialogFooter,
         AlertDialogHeader,
         AlertDialogTitle,
       } from '@/components/ui/alert-dialog';

       Match surrounding semicolon/style.
    6. Add or import InfoRow.
       If no shared InfoRow exists, add local helper near other helper components:
       tsx
       function InfoRow({
         label,
         value,
         icon,
         mono = false,
       }: {
         label: string
         value?: React.ReactNode
         icon?: React.ReactNode
         mono?: boolean
       }) {
         return (
           <div className="flex items-center justify-between gap-3 text-sm">
             <span className="text-muted-foreground">{label}</span>
             <span className={flex items-center gap-1.5 text-right font-medium ${mono ? 'font-mono' : ''}}>
               {icon}
               {value ?? '-'}
             </span>
           </div>
         )
       }

       Adjust syntax/formatting to match file style.
    7. Do not refactor the whole members page unless needed to pass lint/typecheck.

    Acceptance:
    - no duplicate declaration for KifayahCalculator/HistoryTimeline.
    - no missing InfoRow.
    - no missing AlertDialog symbols.
    - UI intent preserved.

    PHASE 7 — Rewrite PENDING_TASKS.md accurately
    Modify:
    - PENDING_TASKS.md

    Goal:
    Rewrite the file into a clean, accurate, priority-based tracker. Fix broken first line, markdown formatting, and outdated claims.

    Required content:
    1. Clean heading:
       md
    🦞 PuspaCare: Pending Tasks & Integration Audit

    2. Include metadata:
       - Last reviewed: 2026-04-26
       - Scope: local PuspaCare repo + OpenClaw/PuspaCareBot integration notes
    3. Use sections:
       - Blocking / Critical
       - High Priority
       - Medium Priority
       - Blueprint Gaps
       - Validation Gate
       - VPS/OpenClaw Follow-up (manual, not part of local fix)
    4. Mention confirmed issues accurately:
       - lint/typecheck blockers in src/modules/members/page.tsx
       - GET /api/v1/bot/keys admin auth requirement
       - bot routes must use requireBotAuth with proper BotAuthError handling
       - local bot secret/temp files must be ignored and not committed
       - OpenClaw openclaw/puspacare previously returned deactivated_workspace and needs VPS-side follow-up
       - /puspa-bridge/snapshot should be protected with bearer auth/IP allowlist/Cloudflare Access and reduced CORS
    5. Correct inaccurate claims:
       - Do not say bot endpoints use take: 15; say they use limit/offset but need robust auth/error handling and possibly richer filtering.
       - Do not mention requireAdminOrBot; use requireBotAuth.
    6. Use backticks for paths and commands.
    7. Add validation commands:
       bash
       npm run lint
       npx tsc --noEmit
       npm run build


    Suggested full structure:
    md
    🦞 PuspaCare: Pending Tasks & Integration Audit

    Last reviewed: 2026-04-26
    Scope: Local PuspaCare repo plus OpenClaw/PuspaCareBot integration notes.
    Source blueprint: ASNAF_BLUEPRINT.md



    1. Blocking / Critical

    - [ ] Fix lint/typecheck blockers in src/modules/members/page.tsx.
    - [ ] Protect GET /api/v1/bot/keys with admin auth.
    - [ ] Normalize requireBotAuth error handling across src/app/api/v1/bot/*.
    - [ ] Ensure local bot secret artifacts are ignored and never committed.
    - [ ] Verify local validation gate passes.

    2. High Priority

    - [ ] Harden OpenClaw bridge exposure for /puspa-bridge/snapshot.
    - [ ] Investigate VPS-side openclaw/puspacare deactivated_workspace.
    - [ ] Replace simulated ecoss-rpa route with a controlled Playwright workflow when credentials and approval flow are ready.

    3. Medium Priority

    - [ ] Refactor src/modules/members/page.tsx into smaller components after stability fixes.
    - [ ] Improve bot endpoint filtering/pagination beyond basic limit/offset.
    - [ ] Audit API routes against prisma/schema.sqlite.prisma with exact file/field evidence.

    4. Blueprint Gaps

    | Feature / Module | Current Status | Gap |
    | --- | --- | --- |
    | Smart eKYC | Not complete | Real IC capture/liveness flow not implemented. |
    | Enjin Kifayah | Basic/mock | Formula/data source needs official configurable rules/API integration. |
    | Virtual Wallet | Not complete | Wallet balance, QR transaction, and Rakan Niaga flow not implemented. |
    | Offline Mode | Not started | PWA/service worker/local sync strategy not implemented. |
    | RPA eCoss Sync | Simulated | /api/v1/bot/ecoss-rpa is currently simulation only. |
    | Asnafpreneur | Draft | Needs product flow and module implementation. |

    5. Validation Gate

    Run from repo root:

    bash
    npm run lint
    npx tsc --noEmit
    npm run build


    6. VPS/OpenClaw Follow-up

    These require separate approval and are not local repo changes:

    - [ ] Verify @PuspaCareBot Telegram routing with a real message.
    - [ ] Fix openclaw/puspacare gateway response if it still returns deactivated_workspace.
    - [ ] Protect public bridge/gateway routes with bearer auth, Cloudflare Access, Tailscale, or IP allowlist.
    - [ ] Review expired model auth profiles and fallback health.


    Acceptance:
    - file is valid Markdown.
    - no broken revio#.
    - no false take: 15 claim.
    - no false requireAdminOrBot reference.

    PHASE 8 — Documentation/env clarification for OpenClaw bridge
    Modify if needed:
    - .env.example
    - docs/PUSPACAREBOT.md
    - docs/VPS_OPENCLAW_PROJECT13_CONNECTION.md

    Required:
    - Ensure env docs say:
      - OpenClaw tokens are server-side only.
      - Do not prefix with NEXT_PUBLIC_.
      - OPENCLAW_GATEWAY_TOKEN is operator-level access.
      - /puspa-bridge/snapshot must enforce auth or be private before public exposure.
      - No Z.AI fallback should be used.
    - Do not add real secrets.

    Acceptance:
    - docs accurately describe security boundary.

    PHASE 9 — Validation
    Run from /mnt/g/PROJECT-13/PuspaCare:
    bash
    npm run lint
    npx tsc --noEmit
    npm run build


    Rules:
    - If lint fails, fix relevant errors introduced/known in this task.
    - If typecheck fails, fix relevant errors introduced/known in this task.
    - If build fails due unrelated dependency/runtime issue, report exact error and do not hack blindly.
    - Do not hide failures.

    Also run:
    bash
    git status --short
    git diff --stat


    Final report must include:
    1. Files changed.
    2. Security fixes completed.
    3. PENDING_TASKS.md rewrite summary.
    4. Validation results:
       - npm run lint
       - npx tsc --noEmit
       - npm run build
    5. Remaining risks/manual follow-ups.
    6. Confirmation that no secrets were printed and no VPS changes were made.

    Quality bar:
    - Keep changes minimal and targeted.
    - Preserve existing style.
    - Do not reformat unrelated files.
    - Do not weaken security.
    - Prefer clear auth failure handling over broad catch-all 500s.
    - Leave unrelated dirty working tree changes untouched.
