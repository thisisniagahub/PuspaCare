# PuspaCare Implementation Plan

## Objective

Laksanakan hardening dan completion work tanpa tambah feature atas asas yang masih rapuh. Urutan kerja mesti utamakan:

1. auth dan authorization sebenar
2. konsistensi schema, API, dan frontend
3. penggantian mock kepada data sebenar
4. module completion
5. enhancement dan polish

## Guiding Rules

- Kekalkan seni bina SPA semasa dalam `src/app/page.tsx`
- Jangan guna `prisma migrate`; guna `npx prisma db push`
- Jangan tambah dependency baru kecuali yang benar-benar perlu
- Setiap fasa mesti lulus compile sebelum fasa seterusnya
- Semua perubahan API mesti ikut bentuk respons: `{ success, data?, error? }`

## Phase 1: Security Foundation

### 1.1 Auth and Session

- Wire NextAuth dengan credentials provider
- Tambah `src/lib/auth.ts` untuk helper session dan role guard
- Tukar sumber role dari Zustand client kepada session server/client
- Buang kebergantungan pada role switching dalam UI sebagai sumber kuasa sebenar

Files:
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/lib/auth.ts`
- `src/components/auth-provider.tsx`
- `src/app/layout.tsx`
- `src/app/login/page.tsx`
- `src/app/page.tsx`
- `src/components/app-sidebar.tsx`
- `src/stores/app-store.ts`

### 1.2 Password Hardening

- Hash semua password dengan `bcryptjs`
- Tukar seed password default kepada nilai baru yang selamat
- Pastikan create/update user tidak pernah simpan plaintext

Files:
- `src/lib/password.ts`
- `prisma/seed.ts`
- mana-mana route/admin surface yang create atau update user

### 1.3 API Protection Rationalization

- Selaraskan middleware dengan model auth sebenar
- Jangan paksa browser SPA hantar `x-api-key` untuk request session biasa
- Kekalkan API key hanya untuk machine-to-machine jika benar-benar perlu
- Tambah rate limit pada login dan endpoint sensitif

Files:
- `src/middleware.ts`
- `src/lib/api.ts`
- `src/lib/rate-limit.ts`

## Phase 2: Data Contract Alignment

- Audit dan selaraskan semua enum/status antara Prisma, API route, dan module UI
- Betulkan mismatch utama pada `members`, `programmes`, `partners`, `dashboard`, dan `reports`
- Wujudkan shared constants atau mapper untuk status labels BM vs nilai DB

Files:
- `prisma/schema.prisma`
- `src/app/api/v1/members/route.ts`
- `src/app/api/v1/programmes/route.ts`
- `src/app/api/v1/partners/route.ts`
- `src/app/api/v1/dashboard/route.ts`
- `src/app/api/v1/reports/route.ts`
- module frontend berkaitan

## Phase 3: Replace Mocked Critical Modules

### 3.1 eKYC

- Sambung `eKYCVerification` pada query Prisma sebenar
- Approve/reject flow mesti update DB, bukan local state sahaja
- Simpan image sebagai transitional approach dahulu; rancang pindah ke storage luar selepas stabil

Files:
- `src/app/api/v1/ekyc/route.ts`
- `src/app/api/v1/ekyc/verify/route.ts`
- `src/app/api/v1/ekyc/reject/route.ts`
- `src/modules/ekyc/page.tsx`

### 3.2 TapSecure

- Sambung `DeviceBinding`, `SecurityLog`, dan `SecuritySettings`
- Pastikan user identity datang dari session, bukan `userId` bebas dari client

Files:
- `src/app/api/v1/tapsecure/*`
- `src/modules/tapsecure/page.tsx`

## Phase 4: Complete Business Modules

Lengkapkan modul ini hanya selepas Phase 1-3 stabil:

- Volunteers
- Donors
- Documents

Setiap modul perlu:

- CRUD sebenar melalui API
- search, filter, pagination
- detail panel atau dialog
- status badge yang selari dengan nilai DB
- zero mock data untuk flow utama

## Phase 5: Cross-Cutting Enhancements

- Notification bell dan in-app notification flow
- Audit trail helper dan log write operations
- Reports enhancement berasaskan data sebenar
- Branch awareness dalam admin
- Sanitization untuk AI rendering; elak `dangerouslySetInnerHTML` tanpa sanitize

## Validation Gates

Selepas setiap fasa:

1. `npx prisma db push` jika schema berubah
2. `npx tsx prisma/seed.ts` jika seed berubah
3. `npm run dev` untuk compile check
4. smoke test login, dashboard, members, cases
5. smoke test API untuk route yang disentuh

## Suggested Execution Order

1. NextAuth + password hashing
2. middleware + API protection cleanup
3. enum/status alignment
4. eKYC real DB integration
5. TapSecure real DB integration
6. Volunteers
7. Donors
8. Documents
9. Notifications
10. Audit trail
11. Reports and branch enhancements

## Done Criteria

- Tiada plaintext password
- Role datang dari session, bukan store klien
- Route utama tidak bergantung pada mock data
- Status/enum konsisten dari DB hingga UI
- Modul placeholder utama boleh digunakan dengan data sebenar
