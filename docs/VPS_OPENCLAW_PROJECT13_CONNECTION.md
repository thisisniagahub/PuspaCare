# VPS OpenClaw ↔ PROJECT-13 Connection Guide

**Status:** Operational reference  
**Last updated:** 2026-04-25  
**Scope:** NiagaBot/OpenClaw on VPS, local PROJECT-13 workspace, and PuspaCare application deployment path.

---

## 1. Ringkasan Besar

Dokumen ini menerangkan bagaimana **VPS OpenClaw** dihubungkan dengan workspace **PROJECT-13** dan bagaimana ia digunakan untuk mengurus / menjalankan ekosistem **PuspaCare**.

Secara ringkas:

```text
Telegram / WhatsApp / Feishu
        ↓
OpenClaw Gateway on VPS
        ↓
NiagaBot / PuspaCareBot agent routing
        ↓
Model provider + fallback chain
        ↓
Operator workspace / PROJECT-13 repo
        ↓
PuspaCare Next.js application
```

VPS bertindak sebagai **pusat operasi AI / bot gateway**, manakala `PROJECT-13` ialah workspace pembangunan aplikasi. PuspaCare ialah app utama dalam workspace tersebut.

---

## 2. Maklumat Node Utama

### VPS / Production AI Node

| Item | Nilai |
|---|---|
| Host | `srv1322432` |
| IP | `76.13.176.142` |
| User operasi | `root` |
| OpenClaw CLI | `OpenClaw 2026.4.23 (a979721)` |
| Runtime aktif | `/root/.local/lib/node_modules/openclaw` |
| State/config utama | `/root/.openclaw` |
| Operator workspace | `/opt/operator/openclaw` |

### Local / Development Node

| Item | Nilai |
|---|---|
| Machine | `NIAGA-HUB` |
| Platform | WSL2 on Windows |
| Workspace root | `/mnt/g/PROJECT-13` |
| Active app | `/mnt/g/PROJECT-13/PuspaCare` |
| Windows path equivalent | `G:\PROJECT-13\PuspaCare` |

---

## 3. Struktur PROJECT-13

`PROJECT-13` ialah container workspace. App sebenar berada di folder `PuspaCare/`.

```text
/mnt/g/PROJECT-13/
└── PuspaCare/
    ├── src/
    │   ├── app/              # Next.js App Router, auth, API routes
    │   ├── modules/          # Screens internal shell
    │   ├── components/       # UI components
    │   ├── components/ui/    # shadcn/Radix primitives
    │   ├── lib/              # auth, db, helper, API client
    │   └── stores/           # Zustand state
    ├── prisma/               # Database schema/source
    ├── scripts/              # Build/start/production helper
    ├── public/               # Static assets
    ├── upload/               # Upload area
    ├── package.json
    └── AGENTS.md
```

Peraturan penting:

1. Treat `PuspaCare/` sebagai repo root sebenar.
2. Edit Prisma source di `prisma/schema.sqlite.prisma`, bukan `schema.postgres.prisma`.
3. Kebanyakan feature UI masuk ke `src/modules/*`, bukan route top-level baru.
4. Auth dan role guard perlu kekal server-side melalui `src/lib/auth.ts` dan `src/proxy.ts`.
5. Jangan commit secret/API key ke repo.

---

## 4. OpenClaw Runtime di VPS

OpenClaw di VPS berjalan sebagai gateway untuk channel komunikasi dan agent routing.

### Path penting

```text
/root/.local/lib/node_modules/openclaw        # Runtime global OpenClaw aktif
/root/.openclaw                              # Config/state utama OpenClaw
/root/.openclaw/openclaw.json                # Config utama
/root/.openclaw/gateway.systemd.env          # Env gateway, mengandungi secret/token — jangan print
/opt/operator/openclaw                       # Operator workspace
/opt/operator/openclaw/data/agents           # Data agent-agent OpenClaw
/opt/operator/openclaw/data/agents/niagabot  # Store agent NiagaBot
```

### Health / status commands

Gunakan command ini dari local machine:

```bash
ssh root@76.13.176.142 'hostname; openclaw --version'
ssh root@76.13.176.142 'openclaw health'
ssh root@76.13.176.142 'openclaw doctor'
ssh root@76.13.176.142 'openclaw models status --agent main'
```

Jangan print isi env/token secara mentah. Kalau perlu inspect, redacted output sahaja.

---

## 5. Channel Yang Disambungkan

OpenClaw Gateway currently digunakan untuk beberapa channel:

| Channel | Status operasi |
|---|---|
| Telegram | OK, bot utama `@GangNiagaBot` |
| WhatsApp | Linked |
| Feishu/Lark | OK, ada warning binding default jika account-specific binding belum disusun |

Command health:

```bash
ssh root@76.13.176.142 'openclaw health'
```

Expected contoh output:

```text
Telegram: ok (@GangNiagaBot)
WhatsApp: linked
Feishu: ok
Agents: main (default), ..., puspacare, hermes
```

---

## 6. Agent Routing

OpenClaw menggunakan agent list untuk route arahan kepada agent tertentu.

Agent yang diketahui aktif termasuk:

```text
main
niagamarketing
niagaresearch
niagaops
niagahubbot
niagareporter
niagacomputer
niagaaggregator
puspacare
hermes
```

Pemetaan penting:

| Agent | Peranan |
|---|---|
| `main` | Default gateway / NiagaBot utama |
| `puspacare` | Agent khusus PuspaCare/PuspaCareBot |
| `hermes` | Bridge / tooling assistant layer |
| `niagaops` | Infra/ops-oriented work |
| `niagaresearch` | Research/intelligence |
| `niagamarketing` | Marketing workflow |

Nota: Dalam status model, `agent main` boleh merujuk kepada agent dir NiagaBot di:

```text
/opt/operator/openclaw/data/agents/niagabot/agent
```

---

## 7. Model Provider dan Fallback Chain

NiagaBot/OpenClaw tidak patut bergantung pada satu provider sahaja. Ia perlu ada chain failover.

Current intended survival chain:

```text
Primary:
  openai-codex/gpt-5.4

Fallbacks:
  openai-codex/gpt-5.3-codex
  qwen-portal/coder-model
  google-gemini-cli/gemini-3.1-pro-preview
```

Semakan:

```bash
ssh root@76.13.176.142 'openclaw models status --agent main | head -40'
ssh root@76.13.176.142 'openclaw models --agent main fallbacks list --plain'
```

### Risiko OAuth/token

Doctor pernah menunjukkan beberapa OAuth profile expired atau refresh token reused. Itu tidak semestinya menjatuhkan bot terus jika fallback masih hidup, tetapi ia mengurangkan ketahanan.

Tanda perlu re-auth:

```text
expired (0m)
refresh_token_reused
invalid_grant
rate_limit
quota
cooldown
```

Re-auth pattern:

```bash
openclaw models auth login --provider openai-codex
openclaw models auth login --provider google-gemini-cli
openclaw models auth login --provider google-antigravity
```

Jalankan re-auth secara manual dan jangan delete credential lama tanpa backup.

---

## 8. Bagaimana VPS Connect Dengan PROJECT-13

Sambungan bukan bermaksud VPS mount terus folder local Windows. Hubungan sebenar ialah melalui **Git + operator workflow + OpenClaw agent context**.

### Flow pembangunan biasa

```text
1. Developer edit code di local PROJECT-13/PuspaCare
2. Validate build/lint/manual smoke test
3. Commit changes ke branch main
4. Push ke GitHub repo thisisniagahub/PuspaCare
5. VPS/automation boleh pull/deploy dari GitHub
6. OpenClaw agent boleh bantu operasi, audit, dan trigger workflow
```

Repo GitHub:

```text
https://github.com/thisisniagahub/PuspaCare.git
```

Local repo:

```bash
cd /mnt/g/PROJECT-13/PuspaCare
git status
git push origin main
```

### Kenapa Git jadi bridge utama

Git digunakan sebagai source-of-truth kerana:

1. VPS tidak bergantung kepada local Windows drive.
2. Semua perubahan ada history dan rollback.
3. Deployment boleh dibuat secara reproducible.
4. OpenClaw/Hermes/Codex boleh inspect commit state dengan jelas.

---

## 9. PuspaCare Build & Start

Run dari repo root `PuspaCare/`:

```bash
cd /mnt/g/PROJECT-13/PuspaCare
npm run lint
npm run build
npm run start
```

Project ini menggunakan Next.js 16 / React 19 dan standalone build wrapper.

`package.json` scripts penting:

```json
{
  "dev": "next dev -p 3000",
  "build": "next build && bun run scripts/prepare-standalone.ts",
  "start": "bun run scripts/start-standalone.ts",
  "lint": "eslint ."
}
```

Output build utama:

```text
.next/server/
.next/static/
.next/build/
```

Nota: build/start flow memerlukan Bun untuk script wrapper.

---

## 10. Deployment Checklist

Sebelum deploy:

- [ ] `git status` clean.
- [ ] Latest commit sudah push ke `origin/main`.
- [ ] `.env` production lengkap dan tidak bocor dalam git.
- [ ] `npm run build` selesai tanpa error.
- [ ] Database env/schema sepadan.
- [ ] Auth/role gate diuji untuk role penting.
- [ ] OpenClaw health OK.
- [ ] PuspaCareBot agent visible dalam `openclaw health`.

Command quick check:

```bash
cd /mnt/g/PROJECT-13/PuspaCare
git status
npm run build

ssh root@76.13.176.142 'openclaw health'
ssh root@76.13.176.142 'openclaw models status --agent main | head -40'
```

---

## 11. Security Rules

Wajib ikut:

1. Jangan commit `.env` yang mengandungi secret sebenar.
2. Jangan paste token/API key dalam log atau markdown.
3. Redact semua value yang mengandungi:
   - `TOKEN`
   - `KEY`
   - `SECRET`
   - `PASSWORD`
   - `AUTH`
   - `COOKIE`
4. Jangan expose OpenClaw gateway public tanpa access control.
5. Jangan disable root/password SSH sebelum sudo user + key login verified.
6. Jangan run `openclaw doctor --fix`, restart service, atau cleanup besar tanpa approval.

---

## 12. Troubleshooting Cepat

### Bot tak respond

```bash
ssh root@76.13.176.142 'openclaw health'
ssh root@76.13.176.142 'openclaw doctor'
```

Check:

- Telegram status OK atau tidak.
- WhatsApp linked atau expired.
- Gateway timeout.
- Model provider expired/rate-limited.

### Model fail

```bash
ssh root@76.13.176.142 'openclaw models status --agent main | head -80'
```

Cari:

```text
expired
refresh_token_reused
rate_limit
quota
invalid_grant
```

### Build PuspaCare slow/hang

Check:

```bash
cd /mnt/g/PROJECT-13/PuspaCare
npm run build
```

Jika Next.js detect multiple lockfile, set root dalam config atau pastikan command dijalankan dari repo root sebenar `PuspaCare/`.

---

## 13. Mental Model Operasi

Anggap sistem ini seperti ini:

```text
VPS = otak operasi / gateway / channel always-on
PROJECT-13 = source code + product workspace
GitHub = bridge rasmi antara local dan deploy
PuspaCare = produk/app utama
PuspaCareBot = agent khusus untuk bantu faham, operate, dan improve PuspaCare
```

Kalau mahu deploy selamat, jangan edit terus di production tanpa sync balik ke Git. Gunakan Git sebagai jalan utama.

---

## 14. Commands Rujukan

```bash
# Local project
cd /mnt/g/PROJECT-13/PuspaCare
git status
git log --oneline -5
npm run lint
npm run build
npm run start

# VPS OpenClaw
ssh root@76.13.176.142 'hostname; openclaw --version'
ssh root@76.13.176.142 'openclaw health'
ssh root@76.13.176.142 'openclaw doctor'
ssh root@76.13.176.142 'openclaw models status --agent main | head -80'
ssh root@76.13.176.142 'openclaw models --agent main fallbacks list --plain'
```

---

## 15. Summary

VPS OpenClaw dan PROJECT-13 disambungkan melalui operasi berikut:

1. OpenClaw VPS menerima arahan dari Telegram/WhatsApp/Feishu.
2. Arahan diroute kepada NiagaBot/PuspaCareBot/Hermes agent.
3. Agent menggunakan model provider/fallback chain untuk kerja AI.
4. Source code PuspaCare dikendalikan di local `PROJECT-13/PuspaCare`.
5. GitHub menjadi jambatan rasmi untuk push/deploy.
6. PuspaCareBot membantu membaca konteks projek, mencadangkan perubahan, dan menyokong deployment.

Kesimpulan: **VPS ialah command center, PROJECT-13 ialah codebase, GitHub ialah bridge, dan PuspaCareBot ialah specialist agent untuk produk PuspaCare.**
