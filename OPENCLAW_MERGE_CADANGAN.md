# Cadangan Merge Integrasi OpenClaw untuk PuspaCare

Tarikh review: 2026-04-25
Projek: `/mnt/g/PROJECT-13/PuspaCare`
VPS: `root@76.13.176.142`
Gateway public: `https://operator.gangniaga.my`
Bridge snapshot semasa: `https://operator.gangniaga.my/puspa-bridge/snapshot`

## Ringkasan Eksekutif

Projek PuspaCare sudah mempunyai asas integrasi OpenClaw melalui modul dan API berikut:

- `src/lib/openclaw.ts`
- `src/app/api/v1/openclaw/status/route.ts`
- `src/app/api/v1/openclaw/snapshot/route.ts`
- `src/modules/openclaw/*`
- `src/modules/ops-conductor/page.tsx`
- `src/app/api/v1/ops/*`

VPS OpenClaw juga sudah live dan boleh digunakan. Integrasi boleh diteruskan, tetapi jangan merge terus secara mentah. Cadangan terbaik ialah merge secara berfasa:

1. Harden bridge snapshot dan vendor-kan service bridge ke dalam repo.
2. Tambah server-side chat route yang call OpenClaw OpenAI-compatible API dengan agent `openclaw/puspacare`.
3. Tukar Ops Conductor supaya guna OpenClaw sebagai AI runtime utama, dengan fallback ke implementation semasa.
4. Selesaikan lint blockers sebelum dianggap production-ready.

## Status VPS OpenClaw

Hasil pemeriksaan read-only pada VPS:

- Host: `srv1322432`
- OpenClaw: `OpenClaw 2026.4.23`
- `openclaw-gateway.service`: active
- `hermes-gateway.service`: active
- `puspa-openclaw-bridge.service`: active
- Gateway health: `{"ok":true,"status":"live"}`
- Readiness: `{"ready":true,"failing":[]}`
- Gateway bind: `127.0.0.1:18789`
- PUSPA bridge bind: `127.0.0.1:18181`
- Public bridge route: `/puspa-bridge/`

OpenClaw config penting:

```json
{
  "gateway.mode": "local",
  "gateway.port": 18789,
  "gateway.bind": "loopback",
  "gateway.auth.mode": "token",
  "chatCompletions.enabled": true
}
```

Agent `puspacare` sudah wujud:

```json
{
  "id": "puspacare",
  "name": "PuspaCareBot",
  "workspace": "/opt/operator/openclaw/workspace/puspacare",
  "model": {
    "primary": "openai-codex/gpt-5.4",
    "fallbacks": [
      "openai-codex/gpt-5.3-codex",
      "google-gemini-cli/gemini-3.1-pro-preview",
      "openai-codex/gpt-5.3-codex-spark"
    ]
  }
}
```

Direct smoke test kepada OpenAI-compatible endpoint berjaya:

- Endpoint: `http://127.0.0.1:18789/v1/chat/completions`
- Model: `openclaw/puspacare`
- Result: HTTP 200, response `OK`

## Rujukan Docs OpenClaw

Rujukan utama dari `docs.openclaw.ai`:

- Gateway default port biasanya `18789`.
- Gateway perlu `gateway.mode=local` untuk start dengan selamat.
- OpenAI-compatible HTTP API disabled by default, tetapi VPS sekarang sudah enable:
  `gateway.http.endpoints.chatCompletions.enabled = true`
- Endpoint utama:
  `POST /v1/chat/completions`
- Auth guna:
  `Authorization: Bearer <OPENCLAW_GATEWAY_TOKEN>`
- Field `model` ialah target agent, bukan raw provider model sahaja:
  - `openclaw`
  - `openclaw/default`
  - `openclaw/<agentId>`
- Untuk PuspaCare, model target terbaik:
  `openclaw/puspacare`
- Security warning: endpoint OpenAI HTTP API ialah operator-level access. Jangan expose direct public internet.

## Isu Semasa Dalam Projek Local

### 1. TypeScript OK

Command berikut lulus selepas integrasi OpenClaw route:

```bash
npx tsc --noEmit
```

### 2. ESLint OK

Command berikut lulus selepas integrasi OpenClaw route:

```bash
npm run lint
```

### 3. Git working tree sangat dirty

Banyak fail modified. Diff OpenClaw/Ops-focused sahaja sudah melibatkan 31 fail dengan jumlah insertions/deletions seimbang, kemungkinan besar line-ending atau formatting churn.

Sebelum merge feature sebenar, cadangan:

```bash
git checkout -b feat/openclaw-vps-merge
git status --short
```

Kemudian asingkan:

1. commit normalize line endings / housekeeping jika perlu
2. commit OpenClaw bridge
3. commit OpenClaw chat route
4. commit Ops Conductor integration

## Risiko Utama

### Risiko 1: Bridge snapshot public tanpa auth

Bridge semasa expose:

```text
https://operator.gangniaga.my/puspa-bridge/snapshot
```

Ia tidak expose token, tetapi expose metadata runtime seperti:

- channel connected
- model fallback footprint
- plugin list
- agent list/session metadata

Cadangan: tambah bearer token auth pada bridge.

### Risiko 2: Raw OpenClaw Gateway token ialah operator-level credential

Docs OpenClaw jelas menyatakan bearer token untuk `/v1/chat/completions` ialah full operator access surface. Jangan sekali-kali hantar token ke browser.

Semua call mesti server-side melalui Next.js API route.

### Risiko 3: Direct merge dari VPS workspace boleh bawa noise

Remote path seperti `/opt/operator/openclaw/workspace/puspacare` berada dalam workspace yang mempunyai banyak modified/untracked files luar PUSPA. Jangan copy/merge secara mentah tanpa audit.

## Cadangan Architecture

```text
Browser PuspaCare UI
  -> Next.js API /api/v1/openclaw/*
    -> server-side token auth only
      -> Snapshot bridge: https://operator.gangniaga.my/puspa-bridge/snapshot
      -> Agent chat: OpenClaw /v1/chat/completions
        -> model: openclaw/puspacare
```

Guna bridge untuk dashboard/read-only status.
Guna OpenAI-compatible chat completions untuk actual AI execution.

## Cadangan Merge Berfasa

## Fasa 1 — Harden Snapshot Bridge

### 1. Vendor bridge service ke dalam repo

Copy service dari VPS:

```text
/opt/operator/openclaw/workspace/niagabot/tmp/puspa-openclaw-bridge/server.mjs
```

Ke repo:

```text
mini-services/puspa-openclaw-bridge/server.mjs
mini-services/puspa-openclaw-bridge/package.json
mini-services/puspa-openclaw-bridge/README.md
```

### 2. Tambah token auth pada bridge

Env cadangan:

```bash
PUSPA_BRIDGE_TOKEN=change-me
```

Bridge perlu reject request jika header tidak padan:

```http
Authorization: Bearer <PUSPA_BRIDGE_TOKEN>
```

### 3. Update Next.js OpenClaw snapshot routes

Fail:

```text
src/app/api/v1/openclaw/status/route.ts
src/app/api/v1/openclaw/snapshot/route.ts
```

Tambah header server-side:

```ts
headers: {
  Accept: 'application/json',
  Authorization: `Bearer ${process.env.OPENCLAW_BRIDGE_TOKEN}`,
}
```

### 4. Tambah env docs

Update `.env.example`:

```bash
# OpenClaw bridge, server-side only
OPENCLAW_BRIDGE_URL=https://operator.gangniaga.my/puspa-bridge
OPENCLAW_BRIDGE_TOKEN=change-me

# OpenClaw gateway, server-side only. Prefer loopback/private network.
OPENCLAW_GATEWAY_URL=http://127.0.0.1:18789
OPENCLAW_GATEWAY_TOKEN=change-me
OPENCLAW_AGENT_MODEL=openclaw/puspacare
```

## Fasa 2 — OpenClaw Chat Route

Status: dilaksanakan dalam route sedia ada, bukan route baru, supaya frontend sedia ada tidak perlu diubah.

Fail terlibat:

```text
src/lib/openclaw.ts
src/app/api/v1/ai/chat/route.ts
src/app/api/v1/ops/intent/route.ts
```

Behavior semasa:

- `requireRole(request, ['developer'])` kekal.
- `/api/v1/ai/chat` dan `/api/v1/ops/intent` cuba OpenClaw Gateway dahulu jika env lengkap.
- Jika OpenClaw gagal atau env tidak lengkap, route AI pulangkan error 503/502; tiada fallback Z.AI.
- Response tambah metadata `provider`, `fallbackUsed`, `model`/`diagnostics` bila sesuai.
- OpenClaw call guna endpoint docs:

```text
POST ${OPENCLAW_GATEWAY_URL}/v1/chat/completions
```

Headers server-side:

```http
Authorization: Bearer ${OPENCLAW_GATEWAY_TOKEN}
Content-Type: application/json
Accept: application/json
```

Body:

```json
{
  "model": "openclaw/puspacare",
  "messages": [
    { "role": "system", "content": "You are PuspaCareBot..." },
    { "role": "user", "content": "..." }
  ],
  "temperature": 0.2
}
```

Return response kepada frontend dalam shape existing:

```json
{
  "success": true,
  "data": {
    "response": "...",
    "provider": "openclaw",
    "model": "openclaw/puspacare",
    "timestamp": "..."
  }
}
```

## Fasa 3 — Integrasi Ops Conductor

Fail utama:

```text
src/modules/ops-conductor/page.tsx
src/app/api/v1/ai/chat/route.ts
src/app/api/v1/ops/intent/route.ts
```

Cadangan:

1. `/api/v1/ai/chat` cuba OpenClaw dahulu jika env lengkap.
2. Jika OpenClaw gagal, route AI pulangkan error terkawal; tiada fallback Z.AI.
3. Ops Conductor trace perlu rekod:
   - `openclaw_request_started`
   - `openclaw_response_complete`
   - `openclaw_fallback_used`
4. Gunakan `workItem.id` sebagai session key supaya konteks agent konsisten.

## Fasa 4 — Validation dan Stabilization

Sebelum merge ke main:

```bash
npx tsc --noEmit
npm run lint
```

Status semasa: kedua-dua command sudah lulus untuk working tree local selepas integrasi OpenClaw.

Untuk production readiness, masih perlu manual smoke test browser selepas env sebenar dimasukkan.

## Checklist Validasi

### Local

```bash
npx tsc --noEmit --pretty false
npm run lint
npm run build
```

### VPS

```bash
XDG_RUNTIME_DIR=/run/user/0 systemctl --user status openclaw-gateway.service --no-pager -l
XDG_RUNTIME_DIR=/run/user/0 systemctl --user status puspa-openclaw-bridge.service --no-pager -l
curl -fsS http://127.0.0.1:18789/healthz
curl -fsS http://127.0.0.1:18789/readyz
curl -fsS http://127.0.0.1:18181/health
```

### OpenClaw Chat Smoke Test

Jalankan di VPS, jangan print token:

```bash
set -a
. /root/.openclaw/.env
set +a

python3 - <<'PY'
import os, json, urllib.request
url = 'http://127.0.0.1:18789/v1/chat/completions'
token = os.environ['OPENCLAW_GATEWAY_TOKEN']
payload = {
  'model': 'openclaw/puspacare',
  'messages': [{'role': 'user', 'content': 'Reply exactly OK'}],
  'stream': False,
}
req = urllib.request.Request(
  url,
  data=json.dumps(payload).encode(),
  headers={
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json',
  },
)
with urllib.request.urlopen(req, timeout=60) as r:
  print(r.status)
  print(r.read().decode()[:500])
PY
```

Expected:

```text
200
..."content":"OK"...
```

### Browser Smoke Test

1. Login sebagai developer.
2. Buka Ops Conductor.
3. Confirm live OpenClaw status muncul.
4. Hantar prompt ringkas.
5. Confirm response datang dari OpenClaw atau fallback ditunjukkan dalam trace.
6. Buka DevTools Network dan pastikan token tidak pernah muncul dalam response/client bundle.

## Keputusan Cadangan

Cadangan saya: merge boleh diteruskan, tetapi jangan direct merge mentah dari VPS. Buat branch `feat/openclaw-vps-merge` dan lakukan secara terkawal:

1. Bridge hardening.
2. Server-side OpenClaw chat/intent integration. Status: sudah dibuat untuk route semasa.
3. Ops Conductor trace/session-key improvement jika mahu continuity lebih kuat.
4. Final browser smoke test dengan env sebenar.

Priority tertinggi sebelum production:

1. Tambah auth pada `puspa-bridge`.
2. Pastikan `OPENCLAW_GATEWAY_TOKEN` hanya server-side.
3. Gunakan `openclaw/puspacare` sebagai agent target.
4. Manual smoke test: login developer, test AI chat/intent, confirm token tidak bocor ke browser.
