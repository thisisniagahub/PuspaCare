# PuspaCare Pro Upgrade & Implementation Plan

Dokumen ini mengandungi panduan teknikal untuk menaik taraf projek **PuspaCare** daripada fasa pembangunan awal kepada standard **Enterprise SaaS**. Fokus utama adalah pada Prestasi (Performance), Keselamatan (Security), dan Skalabiliti.

---

## 🚀 1. Prestasi: Code Splitting & Dynamic Loading
**Isu:** Fail `src/app/page.tsx` memuatkan 28+ modul secara statik, menyebabkan saiz bundle JS mencecah beberapa Megabyte.
**Solusi:** Gunakan `next/dynamic`.

### Implementasi:
Ubah cara import modul di `src/app/page.tsx`:

```tsx
import dynamic from 'next/dynamic';
import { Skeleton } from "@/components/ui/skeleton";

// Contoh untuk satu modul (ulang untuk semua 28 modul)
const Dashboard = dynamic(() => import('@/modules/dashboard/page'), {
  ssr: false,
  loading: () => <div className="p-6"><Skeleton className="h-[400px] w-full" /></div>
});

const Members = dynamic(() => import('@/modules/members/page'), {
  ssr: false,
  loading: () => <div className="p-6"><Skeleton className="h-[400px] w-full" /></div>
});
```

---

## 🛡️ 2. Keselamatan: Edge Middleware Security
**Isu:** Tiada sekatan di peringkat rangkaian (Network Edge). Kod logik aplikasi terdedah kepada pelawat tidak sah.
**Solusi:** Cipta fail `src/middleware.ts`.

### Implementasi:
Fail baru: `PuspaCare/src/middleware.ts`

```typescript
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Lindungi semua laluan kecuali login, api/auth, dan public assets
export const config = {
  matcher: [
    "/((?!api/auth|login|public|puspa-logo-official.png|_next/static|_next/image|favicon.ico).*)",
  ],
};
```

---

## ⚡ 3. Optimasi Borang: useWatch vs watch()
**Isu:** `form.watch()` menyebabkan keseluruhan komponen borang re-render setiap kali satu huruf ditaip.
**Solusi:** Gunakan `useWatch` hook.

### Standard Pro:
Dalam modul seperti `activities` atau `disbursements`:

```tsx
// ❌ Amalan Biasa (Slow)
const value = form.watch("type"); 

// ✅ Amalan Pro (Fast)
import { useWatch } from "react-hook-form";

const typeValue = useWatch({
  control: form.control,
  name: "type"
});
```

---

## 🎨 4. UI/UX "Pro Max" Standards
Untuk memastikan aplikasi nampak mahal dan profesional:

### Peraturan Ikonografi:
- **TIADA EMOJI** (🎨, 🚀) di dalam UI.
- Guna **Lucide React** secara eksklusif.
- Saiz ikon standard: `w-4 h-4` untuk butang, `w-5 h-5` untuk sidebar.

### Peraturan Glassmorphism (Mod Cerah):
- Gunakan sempadan (border) yang jelas: `border border-slate-200/60`.
- Latar belakang: `bg-white/80 backdrop-blur-md`.
- Kontras Teks: Gunakan `text-slate-900` untuk tajuk, bukan kelabu pudar.

### Interaksi:
- Tambah `cursor-pointer` pada semua elemen interaktif (kad, senarai, baris jadual).
- Transition: Wajib ada `transition-all duration-200 ease-in-out` pada hover states.

---

## 🏗️ 5. Corak Komposisi (Compound Components)
Gunakan corak ini untuk komponen yang boleh diguna semula (reusable).

### Contoh Struktur:
```tsx
// src/components/ui/pro-card.tsx
export function ProCard({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border bg-card text-card-foreground shadow-sm">{children}</div>;
}

ProCard.Header = ({ title }: { title: string }) => (
  <div className="p-6 pb-3 font-semibold text-lg">{title}</div>
);

ProCard.Body = ({ children }: { children: React.ReactNode }) => (
  <div className="p-6 pt-0">{children}</div>
);
```

---

## 📈 6. Checkpoint Kejayaan
- [ ] Saiz First Load JS < 300kb (Guna Chrome DevTools Network tab).
- [ ] Akses terus ke `/` tanpa log masuk melencong ke `/login` serta-merta (Edge Redirect).
- [ ] Tiada amaran "Incompatible Library" dalam terminal `npm run lint`.
- [ ] UI konsisten mengikut palet warna PUSPA (#4B0082).
