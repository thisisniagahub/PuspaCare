# PuspaCare: Pending Tasks & Integration Audit

Last reviewed: 2026-04-26
Scope: Local PuspaCare repo plus OpenClaw/PuspaCareBot integration notes.
Source blueprint: ASNAF_BLUEPRINT.md



## 1. Blocking / Critical

- [ ] Fix lint/typecheck blockers in `src/modules/members/page.tsx`.
- [ ] Protect GET `/api/v1/bot/keys` with admin auth (requires valid session with admin role).
- [ ] Normalize `requireBotAuth` error handling across `src/app/api/v1/bot/*` (uses throw/catch, not return NextResponse).
- [ ] Ensure local bot secret artifacts are ignored and never committed.
- [ ] Verify local validation gate passes (`npm run lint`, `npx tsc --noEmit`, `npm run build`).



## 2. High Priority

- [ ] Harden OpenClaw bridge exposure for `/puspa-bridge/snapshot` — add bearer auth, IP allowlist, or Cloudflare Access; reduce CORS before public exposure.
- [ ] Investigate VPS-side `openclaw/puspacare` returning `deactivated_workspace` — requires manual VPS follow-up.
- [ ] Replace simulated `ecoss-rpa` route with a controlled Playwright workflow when credentials and approval flow are ready. Requires `ops` permission on the bot key.
- [ ] Ensure `OPENCLAW_GATEWAY_TOKEN` is server-side only (never prefixed with `NEXT_PUBLIC_`).



## 3. Medium Priority

- [ ] Refactor `src/modules/members/page.tsx` into smaller components after stability fixes (currently >1700 lines).
- [ ] Improve bot endpoint filtering/pagination beyond basic `limit`/`offset` — richer filtering by date range, status, and fields.
- [ ] Audit API routes against `prisma/schema.sqlite.prisma` with exact file/field evidence for any remaining mismatches.
- [ ] Review public-facing API routes for consistent error response shapes.



## 4. Blueprint Gaps

| Feature / Module | Current Status | Gap |
| --- | --- | --- |
| Smart eKYC | Not complete | Real IC capture/liveness detection flow not implemented. |
| Enjin Kifayah | Basic/mock | Formula/data source needs official configurable rules/API integration with LZS. |
| Virtual Wallet | Not complete | Wallet balance, QR transaction, and Rakan Niaga flow not implemented. |
| Offline Mode | Not started | PWA/service worker/local sync strategy not implemented. |
| RPA eCoss Sync | Simulated | `/api/v1/bot/ecoss-rpa` is currently simulation only; Playwright workflow pending credentials and approval. |
| Asnafpreneur | Draft | Needs product flow and module implementation. |



## 5. Validation Gate

Run from repo root:

```bash
npm run lint
npx tsc --noEmit
npm run build
```



## 6. VPS/OpenClaw Follow-up

These require separate approval and are not local repo changes:

- [ ] Verify `@PuspaCareBot` Telegram routing with a real test message.
- [ ] Fix `openclaw/puspacare` gateway response if it still returns `deactivated_workspace`.
- [ ] Protect public bridge/gateway routes with bearer auth, Cloudflare Access, Tailscale, or IP allowlist.
- [ ] Review expired model auth profiles and fallback health on the OpenClaw operator panel.
- [ ] Rotate `OPENCLAW_GATEWAY_TOKEN` if it has been exposed in any public channel.
