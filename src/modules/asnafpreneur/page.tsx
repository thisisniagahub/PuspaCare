'use client';

import { useMemo } from 'react';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ArrowRight,
  Banknote,
  Bot,
  Briefcase,
  CheckCircle2,
  Coins,
  Cpu,
  ExternalLink,
  GraduationCap,
  HandCoins,
  Laptop,
  Layers3,
  LineChart,
  Rocket,
  Server,
  Target,
  Users,
  Wallet,
} from 'lucide-react';

const PROGRAMME_PHASES = [
  {
    title: 'Fasa 1 — Latihan (12 minggu)',
    duration: '12 minggu',
    outcome: 'Prompting, vibe coding, deploy app pertama',
    items: [
      'Asas digital, prompt engineering, model routing',
      'Bina web app dengan AI tooling',
      'Deploy MVP awal dan biasakan workflow product',
    ],
  },
  {
    title: 'Fasa 2 — SaaS Builder Sprint (8 minggu)',
    duration: '8 minggu',
    outcome: '1 MVP SaaS live per peserta',
    items: [
      'Niche discovery, validation, pilih idea paling viable',
      'Build MVP, payment, auth, dashboard, landing page',
      'Launch, dapatkan pelanggan pertama, iterate cepat',
    ],
  },
  {
    title: 'Fasa 3 — Inkubator (6 bulan)',
    duration: '6 bulan',
    outcome: 'MRR tracking, mentor support, scale batch 1',
    items: [
      'Weekly check-in dan revenue review',
      'Pivot support kalau idea tak convert',
      'Alumni loop, mentor lane, prep Demo Day',
    ],
  },
] as const;

const FUNDERS = [
  {
    name: 'Hijrah Selangor',
    amount: 'RM 70,000',
    fit: 'Track program-level, latihan, laptop, coordinator, Demo Day',
  },
  {
    name: 'Bank Muamalat iTEKAD',
    amount: 'RM 200,000',
    fit: 'Track per-asnaf modal RM10K untuk AI tokens, hosting, tools, buffer',
  },
  {
    name: 'Tech credits / grants',
    amount: 'Bonus upside',
    fit: 'Google.org, Anthropic, AWS/GCP, MDEC, HRD Corp untuk credits dan latihan',
  },
] as const;

const SAAS_IDEAS = [
  ['KedaiAI', 'Peniaga kecil', 'RM29-99/bulan'],
  ['InvoiceKu', 'Freelancer/SME', 'RM19-49/bulan'],
  ['TuisyenAI', 'Ibu bapa/pelajar', 'RM15-39/bulan'],
  ['ResepiBot', 'Food creator', 'RM9-29/bulan'],
  ['MasjidOS', 'Masjid/surau', 'RM49-149/bulan'],
  ['ContractAI', 'Agen hartanah', 'RM39-99/bulan'],
  ['KlinikQ', 'Klinik panel', 'RM79-199/bulan'],
  ['WarungPOS', 'Kedai makan kecil', 'RM29-79/bulan'],
  ['CerpenAI', 'Penulis BM', 'RM19-49/bulan'],
  ['AsnafCare', 'NGO lain', 'RM99-499/bulan'],
] as const;

const PUSPA2_MAP = [
  ['Programme', 'Track ASNAFPRENEUR sebagai program induk + cohort batch'],
  ['Members', 'Setiap peserta asnaf, mentor, partner, alumni'],
  ['Cases', 'Progress setiap SaaS: idea → MVP → launch → MRR'],
  ['Donations', 'Dana masuk dari Hijrah Selangor, sponsor, tech credits'],
  ['Disbursements', 'Token purchases, hosting, domain, laptop, incentives'],
  ['Reports', 'MRR per peserta, burn rate, funding runway, cohort impact'],
  ['Volunteers', 'Mentor industri, reviewer produk, growth advisor'],
  ['Ops Conductor', 'Route requests, cadence review, follow-up tasks'],
] as const;

const TIMELINE = [
  ['Q2 2026', 'Proposal, funder outreach, recruit 20 peserta, setup infra'],
  ['Q3 2026', 'Latihan 12 minggu, idea validation, app basics'],
  ['Q4 2026', 'Builder sprint, payment integration, launch'],
  ['Q1 2027', 'Inkubator, mentor cadence, MRR tracking, Demo Day'],
  ['Q2 2027', 'Batch 2, alumni mentor loop, repeatable system'],
] as const;

function Table({ headers, rows }: { headers: string[]; rows: readonly (readonly string[])[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 text-left font-semibold text-foreground">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className="border-t">
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} className="px-4 py-3 text-muted-foreground align-top">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AsnafpreneurPage() {
  const { setView } = useAppStore();

  const quickActions = useMemo(
    () => [
      { label: 'Buka Programmes', view: 'programmes' as const },
      { label: 'Buka Donations', view: 'donations' as const },
      { label: 'Buka Disbursements', view: 'disbursements' as const },
      { label: 'Buka Reports', view: 'reports' as const },
    ],
    [setView],
  );

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:border-purple-900/40 dark:from-purple-950/30 dark:via-background dark:to-indigo-950/20">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-purple-600 hover:bg-purple-600">Program Strategik 2026-2027</Badge>
            <Badge variant="outline">AI-first entrepreneurship</Badge>
            <Badge variant="outline">Recurring revenue</Badge>
          </div>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <CardTitle className="text-3xl tracking-tight flex items-center gap-3">
                <Rocket className="h-8 w-8 text-purple-600" />
                ASNAFPRENEUR — PUSPA AI SaaS Enterprise
              </CardTitle>
              <CardDescription className="max-w-3xl text-sm sm:text-base leading-relaxed">
                Program keusahawanan digital untuk latih asnaf bina micro-SaaS dengan AI, launch cepat,
                dan capai recurring revenue tanpa model bisnes berat inventori atau kedai fizikal.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <Button key={action.label} variant="outline" onClick={() => setView(action.view)}>
                  {action.label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Target peserta</p>
                <p className="text-3xl font-bold">20</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Funding target</p>
                <p className="text-3xl font-bold">RM270K</p>
              </div>
              <HandCoins className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Annual programme cost</p>
                <p className="text-3xl font-bold">RM140.2K</p>
              </div>
              <Wallet className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Projected cumulative revenue</p>
                <p className="text-3xl font-bold">RM145.2K</p>
              </div>
              <LineChart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Layers3 className="h-5 w-5 text-purple-600" />Kenapa model ini kuat</CardTitle>
            <CardDescription>Switch daripada bantuan ekonomi tradisional kepada software business yang scale lebih laju.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {[
              ['Modal rendah', 'Laptop + AI tokens + hosting. Tak perlu sewa kedai atau stok besar.', <Laptop className="h-5 w-5 text-purple-600" key="a" />],
              ['Recurring revenue', 'Pelanggan bayar bulan-bulan, bukan one-off sale sahaja.', <Coins className="h-5 w-5 text-emerald-600" key="b" />],
              ['Margin tinggi', 'SaaS margin boleh cecah 80-90% bila AI handle banyak kerja.', <Target className="h-5 w-5 text-blue-600" key="c" />],
              ['Scale tanpa headcount berat', 'Tambah pelanggan lebih mudah berbanding tambah operasi fizikal.', <Server className="h-5 w-5 text-amber-600" key="d" />],
            ].map(([title, desc, icon]) => (
              <div key={title as string} className="rounded-xl border p-4">
                <div className="mb-3 flex items-center gap-2 font-semibold text-foreground">{icon}{title}</div>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Cpu className="h-5 w-5 text-purple-600" />AI-first cost model</CardTitle>
            <CardDescription>Operating stack per asnaf entrepreneur</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              ['AI tokens', 'RM80-200 / bulan'],
              ['Hosting + database', 'RM0-90 / bulan'],
              ['Domain + email', 'RM5-25 / bulan'],
              ['Cursor Pro', 'RM80 / bulan'],
              ['Estimated total', 'RM165-395 / bulan'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-lg border px-3 py-2">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-semibold text-foreground">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-purple-600" />Programme phases</CardTitle>
          <CardDescription>Struktur delivery yang boleh terus di-track dalam PUSPA2.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3">
          {PROGRAMME_PHASES.map((phase) => (
            <div key={phase.title} className="rounded-xl border p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="font-semibold text-foreground">{phase.title}</p>
                <Badge variant="outline">{phase.duration}</Badge>
              </div>
              <p className="mb-3 text-sm text-muted-foreground">{phase.outcome}</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                {phase.items.map((item) => (
                  <div key={item} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-purple-600" />10 SaaS idea lane</CardTitle>
            <CardDescription>Idea yang sesuai untuk niche Malaysia dan operator kecil.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table headers={['SaaS', 'Niche', 'Revenue model']} rows={SAAS_IDEAS} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Banknote className="h-5 w-5 text-purple-600" />Dual-track funding</CardTitle>
            <CardDescription>Setup funder utama dan leverage tambahan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {FUNDERS.map((funder) => (
              <div key={funder.name} className="rounded-xl border p-4">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <p className="font-semibold text-foreground">{funder.name}</p>
                  <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300">{funder.amount}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{funder.fit}</p>
              </div>
            ))}
            <Separator />
            <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/20">
              <p className="font-semibold text-foreground">Recommended target structure</p>
              <p className="mt-1 text-sm text-muted-foreground">Hijrah Selangor untuk program-level capex/ops, iTEKAD untuk per-asnaf runway 12 bulan, kemudian tambah cloud/API credits untuk extend burn runway.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5 text-purple-600" />How it plugs into PUSPA2</CardTitle>
          <CardDescription>Module mapping yang terus boleh dijadikan operating model dalam sistem.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table headers={['Module', 'Implementation role']} rows={PUSPA2_MAP} />
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><LineChart className="h-5 w-5 text-purple-600" />Conservative revenue path</CardTitle>
            <CardDescription>Target yang patut monitor per cohort.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              ['Bulan 1-3', 'Latihan, MRR RM0, fokus skill dan idea validation'],
              ['Bulan 4-6', '8 peserta aktif, purata RM500 MRR, total RM4,000'],
              ['Bulan 7-9', '12 peserta aktif, purata RM1,200 MRR, total RM14,400'],
              ['Bulan 10-12', '15 peserta aktif, purata RM2,000 MRR, total RM30,000'],
              ['Break-even', 'Sekitar bulan 10-11 pada senario konservatif'],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-lg border px-4 py-3">
                <p className="font-semibold text-foreground">{title}</p>
                <p className="mt-1 text-muted-foreground">{desc}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ExternalLink className="h-5 w-5 text-purple-600" />Roadmap 2026-2027</CardTitle>
            <CardDescription>Timeline execution yang align dengan cadangan proposal.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table headers={['Window', 'Target outcome']} rows={TIMELINE} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
