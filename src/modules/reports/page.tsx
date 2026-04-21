'use client'

import { useState, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Legend,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShieldCheck,
  FileDown,
  FileSpreadsheet,
  Printer,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react'

// ─── Mock Data ───────────────────────────────────────────────────────────────

const monthlyOptions = [
  'Januari 2026',
  'Februari 2026',
  'Mac 2026',
  'April 2026',
  'Mei 2026',
  'Jun 2026',
  'Julai 2026',
  'Ogos 2026',
  'September 2026',
  'Oktober 2026',
  'November 2026',
  'Disember 2026',
]

const quarterlyOptions = ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026']
const yearlyOptions = ['2024', '2025', '2026']

const incomeByFundData = [
  { name: 'Zakat', amount: 52300, color: '#16a34a' },
  { name: 'Sadaqah', amount: 28700, color: '#ca8a04' },
  { name: 'Waqf', amount: 18400, color: '#0d9488' },
  { name: 'Infaq', amount: 31200, color: '#9333ea' },
  { name: 'Sumbangan Am', amount: 19800, color: '#dc2626' },
]

const expenditureByProgrammeData = [
  { programme: 'Program Makanan Rakyat', spent: 28500, budget: 35000 },
  { programme: 'Bantuan Pendidikan', spent: 22100, budget: 25000 },
  { programme: 'Penjagaan Warga Emas', spent: 19800, budget: 22000 },
  { programme: 'Pembangunan Komuniti', spent: 15600, budget: 20000 },
  { programme: 'Bantuan Kecemasan', spent: 12400, budget: 15000 },
  { programme: 'Program Kesihatan', spent: 11200, budget: 15000 },
  { programme: 'Kemuskilan & Kebajikan', spent: 6800, budget: 10000 },
  { programme: 'Pentadbiran & Operasi', spent: 3600, budget: 8000 },
]

const incomeVsExpenditureData = [
  { month: 'Jan', pendapatan: 9800, perbelanjaan: 7200 },
  { month: 'Feb', pendapatan: 11200, perbelanjaan: 8500 },
  { month: 'Mac', pendapatan: 14500, perbelanjaan: 9800 },
  { month: 'Apr', pendapatan: 10800, perbelanjaan: 10200 },
  { month: 'Mei', pendapatan: 13600, perbelanjaan: 11400 },
  { month: 'Jun', pendapatan: 12900, perbelanjaan: 10800 },
  { month: 'Jul', pendapatan: 15200, perbelanjaan: 12300 },
  { month: 'Ogo', pendapatan: 14100, perbelanjaan: 11600 },
  { month: 'Sep', pendapatan: 16800, perbelanjaan: 13200 },
  { month: 'Okt', pendapatan: 13400, perbelanjaan: 11900 },
  { month: 'Nov', pendapatan: 11200, perbelanjaan: 10500 },
  { month: 'Dis', pendapatan: 15700, perbelanjaan: 12700 },
]

type VerificationStatus = 'Disahkan' | 'Lapor Sendiri' | 'Belum Disahkan'

interface ImpactMetric {
  id: number
  metrik: string
  nilaiLaporSendiri: string
  nilaiDisahkan: string
  sumberPengesahan: string
  status: VerificationStatus
}

const impactMetrics: ImpactMetric[] = [
  {
    id: 1,
    metrik: 'Peserta Dibantu',
    nilaiLaporSendiri: '3,450 orang',
    nilaiDisahkan: '3,280 orang',
    sumberPengesahan: 'Audit Dalaman Q2 2026',
    status: 'Disahkan',
  },
  {
    id: 2,
    metrik: 'Keluarga Terbantu',
    nilaiLaporSendiri: '820 keluarga',
    nilaiDisahkan: '790 keluarga',
    sumberPengesahan: 'Pemeriksa Lapangan',
    status: 'Disahkan',
  },
  {
    id: 3,
    metrik: 'Makanan Diedarkan',
    nilaiLaporSendiri: '52,000 hidangan',
    nilaiDisahkan: '—',
    sumberPengesahan: '—',
    status: 'Lapor Sendiri',
  },
  {
    id: 4,
    metrik: 'Pelajar Menerima Bantuan',
    nilaiLaporSendiri: '1,200 orang',
    nilaiDisahkan: '1,180 orang',
    sumberPengesahan: 'Senarai Semak Sekolah',
    status: 'Disahkan',
  },
  {
    id: 5,
    metrik: 'Warga Emas Dijaga',
    nilaiLaporSendiri: '340 orang',
    nilaiDisahkan: '—',
    sumberPengesahan: '—',
    status: 'Belum Disahkan',
  },
  {
    id: 6,
    metrik: 'Program Kesihatan Dijalankan',
    nilaiLaporSendiri: '48 sesi',
    nilaiDisahkan: '45 sesi',
    sumberPengesahan: 'Laporan Rakan Kongsi KKM',
    status: 'Disahkan',
  },
  {
    id: 7,
    metrik: 'Bantuan Kecemasan Diberikan',
    nilaiLaporSendiri: '156 kes',
    nilaiDisahkan: '—',
    sumberPengesahan: '—',
    status: 'Lapor Sendiri',
  },
  {
    id: 8,
    metrik: 'Sukarelawan Aktif',
    nilaiLaporSendiri: '285 orang',
    nilaiDisahkan: '—',
    sumberPengesahan: '—',
    status: 'Belum Disahkan',
  },
]

// ─── Formatting Helpers ──────────────────────────────────────────────────────

function formatRinggit(amount: number): string {
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// ─── Status Badge Component ──────────────────────────────────────────────────

function StatusBadge({ status }: { status: VerificationStatus }) {
  const config: Record<
    VerificationStatus,
    { variant: 'default' | 'secondary' | 'outline'; className: string; icon: React.ReactNode }
  > = {
    Disahkan: {
      variant: 'default',
      className: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
    },
    'Lapor Sendiri': {
      variant: 'secondary',
      className: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
      icon: <Clock className="h-3 w-3 mr-1" />,
    },
    'Belum Disahkan': {
      variant: 'outline',
      className: 'text-gray-500 border-gray-300',
      icon: <AlertCircle className="h-3 w-3 mr-1" />,
    },
  }

  const c = config[status]

  return (
    <Badge variant={c.variant} className={`${c.className} text-xs font-medium`}>
      {c.icon}
      {status}
    </Badge>
  )
}

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

function RinggitTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg">
      <p className="mb-1 text-sm font-semibold text-foreground">{label}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {formatRinggit(entry.value)}
        </p>
      ))}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [periodTab, setPeriodTab] = useState('bulanan')
  const [selectedPeriod, setSelectedPeriod] = useState('Jun 2026')

  const periodOptions = useMemo(() => {
    switch (periodTab) {
      case 'bulanan':
        return monthlyOptions
      case 'suku-tahunan':
        return quarterlyOptions
      case 'tahunan':
        return yearlyOptions
      default:
        return monthlyOptions
    }
  }, [periodTab])

  const totalIncome = incomeByFundData.reduce((sum, d) => sum + d.amount, 0)
  const totalExpenditure = expenditureByProgrammeData.reduce((sum, d) => sum + d.spent, 0)
  const netBalance = totalIncome - totalExpenditure
  const isBalancePositive = netBalance >= 0

  const verifiedCount = impactMetrics.filter((m) => m.status === 'Disahkan').length
  const verificationLevel = Math.round((verifiedCount / impactMetrics.length) * 100)

  const totalBudget = expenditureByProgrammeData.reduce((sum, d) => sum + d.budget, 0)
  const totalSpent = expenditureByProgrammeData.reduce((sum, d) => sum + d.spent, 0)
  const budgetUtilization = Math.round((totalSpent / totalBudget) * 100)

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Laporan Kewangan & Tahunan
          </h1>
          <p className="mt-1 text-gray-500">
            Ringkasan kewangan, pelaburan dana, dan impak program PUSPA
          </p>
        </header>

        {/* ── Period Selector ────────────────────────────────────────────── */}
        <Card className="mb-8 border-0 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Tabs
                value={periodTab}
                onValueChange={(v) => {
                  setPeriodTab(v)
                  const defaults: Record<string, string> = {
                    bulanan: 'Jun 2026',
                    'suku-tahunan': 'Q2 2026',
                    tahunan: '2026',
                  }
                  setSelectedPeriod(defaults[v] || 'Jun 2026')
                }}
                className="w-full sm:w-auto"
              >
                <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-grid">
                  <TabsTrigger value="bulanan" className="text-sm">
                    Bulanan
                  </TabsTrigger>
                  <TabsTrigger value="suku-tahunan" className="text-sm">
                    Suku Tahunan
                  </TabsTrigger>
                  <TabsTrigger value="tahunan" className="text-sm">
                    Tahunan
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Pilih tempoh" />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* ── Financial Summary Cards ────────────────────────────────────── */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Income */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Jumlah Pendapatan</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-600">
                    {formatRinggit(totalIncome)}
                  </p>
                  <div className="mt-2 flex items-center text-xs text-emerald-600">
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                    +12.5% vs tempoh lepas
                  </div>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Expenditure */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Jumlah Perbelanjaan</p>
                  <p className="mt-1 text-2xl font-bold text-red-600">
                    {formatRinggit(totalExpenditure)}
                  </p>
                  <div className="mt-2 flex items-center text-xs text-red-500">
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                    +8.2% vs tempoh lepas
                  </div>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Net Balance */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Baki Bersih</p>
                  <p
                    className={`mt-1 text-2xl font-bold ${
                      isBalancePositive ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {formatRinggit(netBalance)}
                  </p>
                  <div
                    className={`mt-2 flex items-center text-xs ${
                      isBalancePositive ? 'text-emerald-600' : 'text-red-500'
                    }`}
                  >
                    {isBalancePositive ? (
                      <>
                        <ArrowUpRight className="mr-1 h-3 w-3" />
                        Surplus sihat
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="mr-1 h-3 w-3" />
                        Defisit
                      </>
                    )}
                  </div>
                </div>
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                    isBalancePositive ? 'bg-emerald-50' : 'bg-red-50'
                  }`}
                >
                  <DollarSign
                    className={`h-6 w-6 ${isBalancePositive ? 'text-emerald-600' : 'text-red-600'}`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Level */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Tahap Pengesahan</p>
                  <p className="mt-1 text-2xl font-bold text-amber-600">{verificationLevel}%</p>
                  <div className="mt-2 flex items-center text-xs text-amber-600">
                    <ShieldCheck className="mr-1 h-3 w-3" />
                    {verifiedCount}/{impactMetrics.length} metrik disahkan
                  </div>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50">
                  <ShieldCheck className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Charts Row ─────────────────────────────────────────────────── */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Income by Fund Type */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Pendapatan Mengikut Jenis Dana</CardTitle>
              <CardDescription>Agihan pendapatan berdasarkan sumber dana ISF</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={incomeByFundData}
                    margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<RinggitTooltip />} />
                    <Bar dataKey="amount" name="Jumlah (RM)" radius={[6, 6, 0, 0]} maxBarSize={52}>
                      {incomeByFundData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="mt-3 flex flex-wrap gap-3">
                {incomeByFundData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-sm"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-xs text-gray-600">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Income vs Expenditure Trend */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Trend Pendapatan vs Perbelanjaan
              </CardTitle>
              <CardDescription>Perbandingan bulanan 12 bulan terkini</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={incomeVsExpenditureData}
                    margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="pendapatanGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0.01} />
                      </linearGradient>
                      <linearGradient id="perbelanjaanGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#dc2626" stopOpacity={0.12} />
                        <stop offset="95%" stopColor="#dc2626" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<RinggitTooltip />} />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: '12px' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="pendapatan"
                      name="Pendapatan"
                      stroke="#16a34a"
                      strokeWidth={2.5}
                      fill="url(#pendapatanGradient)"
                      dot={{ r: 3, fill: '#16a34a' }}
                      activeDot={{ r: 5 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="perbelanjaan"
                      name="Perbelanjaan"
                      stroke="#dc2626"
                      strokeWidth={2.5}
                      fill="url(#perbelanjaanGradient)"
                      dot={{ r: 3, fill: '#dc2626' }}
                      activeDot={{ r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Expenditure by Programme ───────────────────────────────────── */}
        <Card className="mb-8 border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  Perbelanjaan Mengikut Program
                </CardTitle>
                <CardDescription>
                  Peruntukan bajet digunakan — keseluruhan {budgetUtilization}% ({formatRinggit(totalSpent)} / {formatRinggit(totalBudget)})
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenditureByProgrammeData.map((item) => {
                const pct = Math.round((item.spent / item.budget) * 100)
                const barColor =
                  pct >= 90
                    ? 'bg-red-500'
                    : pct >= 70
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'

                return (
                  <div key={item.programme}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{item.programme}</span>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{formatRinggit(item.spent)}</span>
                        <span className="text-gray-300">/</span>
                        <span>{formatRinggit(item.budget)}</span>
                        <Badge
                          variant="outline"
                          className={`ml-1 text-[10px] px-1.5 py-0 ${
                            pct >= 90
                              ? 'border-red-200 text-red-600'
                              : pct >= 70
                                ? 'border-amber-200 text-amber-600'
                                : 'border-emerald-200 text-emerald-600'
                          }`}
                        >
                          {pct}%
                        </Badge>
                      </div>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* ── Impact Metrics Table ───────────────────────────────────────── */}
        <Card className="mb-8 border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Metrik Impak — Lapor Sendiri vs Disahkan</CardTitle>
            <CardDescription>
              Perbandingan data yang dilaporkan sendiri dengan data yang telah disahkan oleh pihak berkuasa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80">
                    <TableHead className="min-w-[200px] font-semibold text-gray-700">
                      Metrik
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">Nilai Lapor Sendiri</TableHead>
                    <TableHead className="font-semibold text-gray-700">Nilai Disahkan</TableHead>
                    <TableHead className="min-w-[180px] font-semibold text-gray-700">
                      Sumber Pengesahan
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {impactMetrics.map((metric) => (
                    <TableRow key={metric.id} className="hover:bg-gray-50/50">
                      <TableCell className="font-medium text-gray-800">{metric.metrik}</TableCell>
                      <TableCell className="text-gray-600">{metric.nilaiLaporSendiri}</TableCell>
                      <TableCell>
                        {metric.nilaiDisahkan === '—' ? (
                          <span className="text-gray-400 italic">—</span>
                        ) : (
                          <span className="font-medium text-gray-800">
                            {metric.nilaiDisahkan}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {metric.sumberPengesahan === '—' ? (
                          <span className="text-gray-400 italic">Menunggu pengesahan</span>
                        ) : (
                          metric.sumberPengesahan
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusBadge status={metric.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Summary */}
            <div className="mt-4 flex flex-wrap gap-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>
                  <strong className="text-gray-700">{verifiedCount}</strong> Disahkan
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                <span>
                  <strong className="text-gray-700">
                    {impactMetrics.filter((m) => m.status === 'Lapor Sendiri').length}
                  </strong>{' '}
                  Lapor Sendiri
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-gray-400" />
                <span>
                  <strong className="text-gray-700">
                    {impactMetrics.filter((m) => m.status === 'Belum Disahkan').length}
                  </strong>{' '}
                  Belum Disahkan
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Export Section ─────────────────────────────────────────────── */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Eksport Laporan</CardTitle>
            <CardDescription>
              Muat turun atau cetak laporan kewangan dalam format yang dikehendaki
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                <FileDown className="h-4 w-4" />
                Muat Turun PDF
              </Button>
              <Button variant="outline" className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Eksport CSV
              </Button>
              <Button variant="outline" className="gap-2">
                <Printer className="h-4 w-4" />
                Cetak Laporan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
