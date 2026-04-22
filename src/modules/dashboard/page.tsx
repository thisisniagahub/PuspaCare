'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { api } from '@/lib/api'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Users,
  Heart,
  HandCoins,
  UserCheck,
  ShieldCheck,
  FileText,
  DollarSign,
  UserPlus,
  Calendar,
  Activity,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Clock,
  CheckCircle2,
  Package,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DashboardStats {
  jumlahAhliAsnaf: number
  programAktif: number
  jumlahDonasi: number
  sukarelawanAktif: number
  skorCompliance: number
  trendAhli: number
  trendProgram: number
  trendDonasi: number
  trendSukarelawan: number
  trendCompliance: number
}

interface MonthlyDonation {
  bulan: string
  zakat: number
  sadaqah: number
  waqf: number
  infaq: number
  general: number
}

interface MemberCategory {
  name: string
  value: number
  color: string
}

interface RecentActivity {
  id: string
  type: 'case' | 'donation' | 'member' | 'programme'
  title: string
  description: string
  timestamp: string
}

interface ComplianceItem {
  label: string
  completed: boolean
  category: string
}

// ---------------------------------------------------------------------------
// Color constants
// ---------------------------------------------------------------------------

const FUND_COLORS: Record<string, string> = {
  zakat: '#7c3aed',
  sadaqah: '#059669',
  waqf: '#d97706',
  infaq: '#2563eb',
  general: '#6b7280',
}

const MEMBER_COLORS = ['#7c3aed', '#059669', '#d97706', '#0ea5e9']

const ACTIVITY_BADGE_STYLES: Record<string, string> = {
  case: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  donation: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  member: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  programme: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
}

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun',
  'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis',
]

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_STATS: DashboardStats = {
  jumlahAhliAsnaf: 127,
  programAktif: 8,
  jumlahDonasi: 152780,
  sukarelawanAktif: 34,
  skorCompliance: 73,
  trendAhli: 12.4,
  trendProgram: 0,
  trendDonasi: 8.7,
  trendSukarelawan: 6.2,
  trendCompliance: -2.1,
}

const MOCK_MONTHLY_DONATIONS: MonthlyDonation[] = [
  { bulan: 'Jan', zakat: 5200, sadaqah: 3100, waqf: 1800, infaq: 1200, general: 900 },
  { bulan: 'Feb', zakat: 6100, sadaqah: 2800, waqf: 1500, infaq: 1100, general: 850 },
  { bulan: 'Mac', zakat: 12500, sadaqah: 4200, waqf: 3100, infaq: 2800, general: 1500 },
  { bulan: 'Apr', zakat: 7800, sadaqah: 3500, waqf: 2200, infaq: 1900, general: 1100 },
  { bulan: 'Mei', zakat: 8200, sadaqah: 3800, waqf: 2600, infaq: 2100, general: 1200 },
  { bulan: 'Jun', zakat: 15000, sadaqah: 5600, waqf: 4200, infaq: 3400, general: 2200 },
  { bulan: 'Jul', zakat: 9100, sadaqah: 4000, waqf: 2800, infaq: 2300, general: 1300 },
  { bulan: 'Ogo', zakat: 7400, sadaqah: 3200, waqf: 2000, infaq: 1700, general: 1000 },
  { bulan: 'Sep', zakat: 6800, sadaqah: 3000, waqf: 1900, infaq: 1500, general: 950 },
  { bulan: 'Okt', zakat: 11200, sadaqah: 4800, waqf: 3500, infaq: 2900, general: 1800 },
  { bulan: 'Nov', zakat: 9800, sadaqah: 4100, waqf: 3000, infaq: 2500, general: 1600 },
  { bulan: 'Dis', zakat: 8500, sadaqah: 3600, waqf: 2400, infaq: 2000, general: 1200 },
]

const MOCK_MEMBER_DISTRIBUTION: MemberCategory[] = [
  { name: 'Asnaf', value: 68, color: '#7c3aed' },
  { name: 'Sukarelawan', value: 34, color: '#059669' },
  { name: 'Penderma', value: 18, color: '#d97706' },
  { name: 'Staf', value: 7, color: '#0ea5e9' },
]

const MOCK_ACTIVITIES: RecentActivity[] = [
  {
    id: '1',
    type: 'case',
    title: 'Kes baru didaftarkan',
    description: 'Penerima zakat baharu dari Kampung Melayu Majidee, Johor Bahru',
    timestamp: '15 minit lalu',
  },
  {
    id: '2',
    type: 'donation',
    title: 'Donasi diterima',
    description: 'Sumbangan RM 5,000 daripada Syarikat Teknologi Maju Sdn Bhd',
    timestamp: '1 jam lalu',
  },
  {
    id: '3',
    type: 'programme',
    title: 'Program bantuan makanan dilancarkan',
    description: 'Tabung Makanan Rahmah bulan Disember untuk 120 keluarga asnaf',
    timestamp: '3 jam lalu',
  },
  {
    id: '4',
    type: 'member',
    title: 'Sukarelawan baru berdaftar',
    description: '12 sukarelawan baharu menyertai program Khidmat Komuniti',
    timestamp: '5 jam lalu',
  },
  {
    id: '5',
    type: 'donation',
    title: 'Waqf tanah diterima',
    description: 'Hibah tanah seluas 0.5 ekar untuk pembinaan pusat aktiviti',
    timestamp: 'Semalam',
  },
]

const MOCK_COMPLIANCE_ITEMS: ComplianceItem[] = [
  { label: 'Laporan audit tahunan 2024', completed: true, category: 'Kewangan' },
  { label: 'Pendaftaran ROB/BROB', completed: true, category: 'Perundangan' },
  { label: 'Pematuhan PDPA (Data Protection)', completed: false, category: 'Teknologi' },
  { label: 'Penyata kewangan suku tahunan', completed: true, category: 'Kewangan' },
  { label: 'Latihan keselamatan staf', completed: false, category: 'Operasi' },
  { label: 'Kemaskini polisi anti-rasuah', completed: true, category: 'Tadbir Urus' },
  { label: 'Penilaian risiko operasi', completed: false, category: 'Operasi' },
  { label: 'Laporan NGO kepada JKM', completed: true, category: 'Perundangan' },
]

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Selamat Pagi'
  if (hour >= 12 && hour < 17) return 'Selamat Petang'
  if (hour >= 17 && hour < 20) return 'Selamat Petang'
  return 'Selamat Malam'
}

function formatCurrency(amount: number): string {
  if (amount == null || isNaN(amount)) return 'RM 0'
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatNumber(n: number): string {
  if (n == null || isNaN(n)) return '0'
  return new Intl.NumberFormat('ms-MY').format(n)
}

function getComplianceColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500'
  if (score >= 50) return 'bg-amber-500'
  return 'bg-rose-500'
}

function getComplianceTextColor(score: number): string {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400'
  if (score >= 50) return 'text-amber-600 dark:text-amber-400'
  return 'text-rose-600 dark:text-rose-400'
}

function getComplianceLabel(score: number): string {
  if (score >= 80) return 'Sangat Baik'
  if (score >= 50) return 'Sederhana'
  return 'Perlu Perhatian'
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'case':
      return <FileText className="h-4 w-4" />
    case 'donation':
      return <HandCoins className="h-4 w-4" />
    case 'member':
      return <UserPlus className="h-4 w-4" />
    case 'programme':
      return <Package className="h-4 w-4" />
    default:
      return <Activity className="h-4 w-4" />
  }
}

function getActivityBadgeColor(type: string): string {
  return ACTIVITY_BADGE_STYLES[type] || ACTIVITY_BADGE_STYLES.case
}

function getTrendIcon(trend: number) {
  if (trend > 0) return <TrendingUp className="h-4 w-4 text-emerald-500" />
  if (trend < 0) return <TrendingDown className="h-4 w-4 text-rose-500" />
  return <Activity className="h-4 w-4 text-muted-foreground" />
}

// ---------------------------------------------------------------------------
// Custom Tooltip for Bar Chart
// ---------------------------------------------------------------------------

interface BarTooltipPayloadItem {
  name: string
  value: number
  color: string
  dataKey: string
}

function MonthlyDonationTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: BarTooltipPayloadItem[]
  label?: string
}) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg">
      <p className="mb-2 text-sm font-semibold">{label} 2024</p>
      <div className="space-y-1">
        {payload.map((entry: BarTooltipPayloadItem) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="capitalize">{entry.name}</span>
            </span>
            <span className="font-medium">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 border-t pt-2">
        <div className="flex items-center justify-between text-sm font-semibold">
          <span>Jumlah</span>
          <span>
            {formatCurrency(payload.reduce((sum: number, e: BarTooltipPayloadItem) => sum + e.value, 0))}
          </span>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Custom label for Pie Chart
// ---------------------------------------------------------------------------

function renderCustomLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  percent: number
}) {
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  if (percent < 0.08) return null

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

// ---------------------------------------------------------------------------
// Stat Card Component
// ---------------------------------------------------------------------------

interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  icon: React.ReactNode
  accentColor: string
  iconBgColor: string
  trend?: number
}

function StatCard({ title, value, subtitle, icon, accentColor, iconBgColor, trend }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: iconBgColor }}
        >
          <span style={{ color: accentColor }}>{icon}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend !== undefined && trend !== 0 && (
            <div className="mt-1 flex items-center gap-1">
              {getTrendIcon(trend)}
              <span
                className={`text-xs font-medium ${
                  trend > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {trend > 0 ? '+' : ''}
                {trend}%
              </span>
              <span className="text-xs text-muted-foreground">vs bulan lepas</span>
            </div>
          )}
        </div>
      </CardContent>
      {/* Decorative accent line at top */}
      <div
        className="absolute left-0 top-0 h-1 w-full"
        style={{ backgroundColor: accentColor }}
      />
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Loading Skeleton
// ---------------------------------------------------------------------------

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-2 h-4 w-96" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-7 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[320px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[320px] w-full rounded-full" />
          </CardContent>
        </Card>
      </div>

      {/* Bottom section skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-72" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-4 w-20" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Dashboard Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [monthlyData, setMonthlyData] = useState<MonthlyDonation[]>([])
  const [memberData, setMemberData] = useState<MemberCategory[]>([])
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, monthlyRes, memberRes, activityRes] = await Promise.allSettled([
          api.get<DashboardStats>('/dashboard/stats'),
          api.get<MonthlyDonation[]>('/dashboard/monthly-donations'),
          api.get<MemberCategory[]>('/dashboard/member-distribution'),
          api.get<RecentActivity[]>('/dashboard/activities'),
        ])

        if (statsRes.status === 'fulfilled') {
          // Map API field names to dashboard field names
          const raw = statsRes.value as Record<string, unknown>
          setStats({
            jumlahAhliAsnaf: (raw.totalMembers as number) ?? MOCK_STATS.jumlahAhliAsnaf,
            programAktif: (raw.activeProgrammes as number) ?? MOCK_STATS.programAktif,
            jumlahDonasi: (raw.totalDonations as number) ?? MOCK_STATS.jumlahDonasi,
            sukarelawanAktif: (raw.activeVolunteers as number) ?? MOCK_STATS.sukarelawanAktif,
            skorCompliance: (raw.complianceScore as number) ?? MOCK_STATS.skorCompliance,
            trendAhli: MOCK_STATS.trendAhli,
            trendProgram: MOCK_STATS.trendProgram,
            trendDonasi: MOCK_STATS.trendDonasi,
            trendSukarelawan: MOCK_STATS.trendSukarelawan,
            trendCompliance: MOCK_STATS.trendCompliance,
          })
        }
        else setStats(MOCK_STATS)

        if (monthlyRes.status === 'fulfilled') setMonthlyData(monthlyRes.value)
        else setMonthlyData(MOCK_MONTHLY_DONATIONS)

        if (memberRes.status === 'fulfilled') setMemberData(memberRes.value)
        else setMemberData(MOCK_MEMBER_DISTRIBUTION)

        if (activityRes.status === 'fulfilled') setActivities(activityRes.value)
        else setActivities(MOCK_ACTIVITIES)

        setComplianceItems(MOCK_COMPLIANCE_ITEMS)
      } catch {
        // Fallback entirely to mock data
        setStats(MOCK_STATS)
        setMonthlyData(MOCK_MONTHLY_DONATIONS)
        setMemberData(MOCK_MEMBER_DISTRIBUTION)
        setActivities(MOCK_ACTIVITIES)
        setComplianceItems(MOCK_COMPLIANCE_ITEMS)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const completedCompliance = useMemo(
    () => complianceItems.filter((item) => item.completed).length,
    [complianceItems],
  )

  const totalCompliance = complianceItems.length

  const incompleteItems = useMemo(
    () => complianceItems.filter((item) => !item.completed),
    [complianceItems],
  )

  const compliancePercentage = totalCompliance > 0 ? Math.round((completedCompliance / totalCompliance) * 100) : 0

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <DashboardSkeleton />
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Welcome Banner */}
        <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#4B0082] via-[#6B21A8] to-[#7C3AED] p-6 text-white shadow-xl shadow-purple-900/30 sm:p-8">
          {/* Decorative background shapes */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-purple-400/10 blur-2xl" />
          <div className="pointer-events-none absolute right-20 bottom-4 h-32 w-32 rounded-full bg-purple-300/10 blur-xl" />

          <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/95 shadow-lg ring-1 ring-white/50">
                <Image
                  src="/puspa-logo-official.png"
                  alt="PUSPA Logo"
                  width={52}
                  height={52}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {getGreeting()}, Admin
                  </h1>
                  <span className="hidden sm:inline-block text-lg">👋</span>
                </div>
                <p className="mt-1 text-sm text-purple-100 sm:text-base">
                  Ringkasan data dan statistik terkini organisasi anda.
                </p>
                <p className="mt-1 text-xs text-purple-200/70">
                  Pertubuhan Urus Peduli Asnaf KL & Selangor • PPM-006-14-14032020
                </p>
              </div>
            </div>

            {/* Stats pills - responsive grid */}
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 sm:px-4 sm:py-2.5 backdrop-blur-sm ring-1 ring-white/10 transition-all hover:bg-white/20">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-white/20">
                  <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold leading-tight sm:text-lg">{formatNumber(stats.jumlahAhliAsnaf)}</span>
                  <span className="text-[10px] leading-tight text-purple-200 sm:text-[11px]">Ahli Asnaf</span>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 sm:px-4 sm:py-2.5 backdrop-blur-sm ring-1 ring-white/10 transition-all hover:bg-white/20">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-white/20">
                  <HandCoins className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold leading-tight sm:text-lg">{formatCurrency(stats.jumlahDonasi)}</span>
                  <span className="text-[10px] leading-tight text-purple-200 sm:text-[11px]">Jumlah Donasi</span>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 sm:px-4 sm:py-2.5 backdrop-blur-sm ring-1 ring-white/10 transition-all hover:bg-white/20">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-white/20">
                  <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold leading-tight sm:text-lg">{stats.programAktif}</span>
                  <span className="text-[10px] leading-tight text-purple-200 sm:text-[11px]">Program Aktif</span>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 sm:px-4 sm:py-2.5 backdrop-blur-sm ring-1 ring-white/10 transition-all hover:bg-white/20">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-white/20">
                  <UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold leading-tight sm:text-lg">{stats.sukarelawanAktif}</span>
                  <span className="text-[10px] leading-tight text-purple-200 sm:text-[11px]">Sukarelawan</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* Statistic Cards                                                    */}
        {/* ----------------------------------------------------------------- */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Jumlah Ahli Asnaf"
            value={formatNumber(stats.jumlahAhliAsnaf)}
            icon={<Users className="h-6 w-6" />}
            accentColor="#7c3aed"
            iconBgColor="rgba(124, 58, 237, 0.1)"
            trend={stats.trendAhli}
          />
          <StatCard
            title="Program Aktif"
            value={String(stats.programAktif)}
            subtitle="dalam pelaksanaan"
            icon={<Heart className="h-6 w-6" />}
            accentColor="#059669"
            iconBgColor="rgba(5, 150, 105, 0.1)"
            trend={stats.trendProgram}
          />
          <StatCard
            title="Jumlah Donasi"
            value={formatCurrency(stats.jumlahDonasi)}
            subtitle="setakat 2024"
            icon={<HandCoins className="h-6 w-6" />}
            accentColor="#d97706"
            iconBgColor="rgba(217, 119, 6, 0.1)"
            trend={stats.trendDonasi}
          />
          <StatCard
            title="Sukarelawan Aktif"
            value={formatNumber(stats.sukarelawanAktif)}
            subtitle="telah berdaftar"
            icon={<UserCheck className="h-6 w-6" />}
            accentColor="#0ea5e9"
            iconBgColor="rgba(14, 165, 233, 0.1)"
            trend={stats.trendSukarelawan}
          />
          <StatCard
            title="Skor Compliance"
            value={`${stats.skorCompliance}%`}
            subtitle={getComplianceLabel(stats.skorCompliance)}
            icon={<ShieldCheck className="h-6 w-6" />}
            accentColor={
              stats.skorCompliance >= 80
                ? '#059669'
                : stats.skorCompliance >= 50
                  ? '#d97706'
                  : '#e11d48'
            }
            iconBgColor={
              stats.skorCompliance >= 80
                ? 'rgba(5, 150, 105, 0.1)'
                : stats.skorCompliance >= 50
                  ? 'rgba(217, 119, 6, 0.1)'
                  : 'rgba(225, 29, 72, 0.1)'
            }
            trend={stats.trendCompliance}
          />
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* Charts Section                                                    */}
        {/* ----------------------------------------------------------------- */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Bar Chart - Monthly Donation Trend */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Trend Sumbangan Bulanan</CardTitle>
                  <CardDescription>
                    Pecahan sumbangan mengikut jenis dana — 2024
                  </CardDescription>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  2024
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[260px] w-full sm:h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 10, right:10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="bulan"
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => `${v / 1000}k`}
                    />
                    <Tooltip content={<MonthlyDonationTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      iconType="circle"
                      iconSize={8}
                      formatter={(value: string) => (
                        <span className="text-sm capitalize">{value}</span>
                      )}
                    />
                    <Bar dataKey="zakat" stackId="a" fill={FUND_COLORS.zakat} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="sadaqah" stackId="a" fill={FUND_COLORS.sadaqah} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="waqf" stackId="a" fill={FUND_COLORS.waqf} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="infaq" stackId="a" fill={FUND_COLORS.infaq} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="general" stackId="a" fill={FUND_COLORS.general} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Donut Chart - Member Distribution */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="text-lg">Pecahan Ahli</CardTitle>
                <CardDescription>
                  Taburan jenis keahlian organisasi
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full sm:h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={memberData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                      labelLine={false}
                      label={renderCustomLabel}
                    >
                      {memberData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `${formatNumber(value)} orang`,
                        name,
                      ]}
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid hsl(var(--border))',
                        backgroundColor: 'hsl(var(--background))',
                        fontSize: '13px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="mt-2 grid grid-cols-2 gap-2">
                {memberData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xs text-muted-foreground">{entry.name}</p>
                      <p className="text-sm font-semibold">{formatNumber(entry.value)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* Bottom Section: Activities + Compliance                            */}
        {/* ----------------------------------------------------------------- */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Activities */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Aktiviti Terkini</CardTitle>
                  <CardDescription>
                    Kemas kini dan peristiwa terbaharu organisasi
                  </CardDescription>
                </div>
                <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                  Lihat semua
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="group flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
                  >
                    {/* Icon */}
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        activity.type === 'case'
                          ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                          : activity.type === 'donation'
                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : activity.type === 'member'
                              ? 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400'
                              : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}
                    >
                      {getActivityIcon(activity.type)}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-tight">{activity.title}</p>
                        <Badge
                          variant="outline"
                          className={getActivityBadgeColor(activity.type)}
                        >
                          {activity.type === 'case'
                            ? 'Kes'
                            : activity.type === 'donation'
                              ? 'Donasi'
                              : activity.type === 'member'
                                ? 'Ahli'
                                : 'Program'}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
                        {activity.description}
                      </p>
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {activity.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Compliance Widget */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Pematuhan</CardTitle>
                  <CardDescription>Status pematuhan organisasi</CardDescription>
                </div>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${
                    compliancePercentage >= 80
                      ? 'bg-emerald-100 dark:bg-emerald-900/30'
                      : compliancePercentage >= 50
                        ? 'bg-amber-100 dark:bg-amber-900/30'
                        : 'bg-rose-100 dark:bg-rose-900/30'
                  }`}
                >
                  <ShieldCheck
                    className={`h-5 w-5 ${
                      compliancePercentage >= 80
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : compliancePercentage >= 50
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-rose-600 dark:text-rose-400'
                    }`}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Progress section */}
              <div className="space-y-3">
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-bold">{compliancePercentage}%</span>
                  <span className="text-sm text-muted-foreground">
                    {completedCompliance}/{totalCompliance} selesai
                  </span>
                </div>
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      compliancePercentage >= 80
                        ? 'bg-emerald-500'
                        : compliancePercentage >= 50
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                    }`}
                    style={{ width: `${compliancePercentage}%` }}
                  />
                </div>
                <p className={`text-sm font-medium ${getComplianceTextColor(compliancePercentage)}`}>
                  Status: {getComplianceLabel(compliancePercentage)}
                </p>
              </div>

              {/* Checklist */}
              <div className="mt-6 space-y-1">
                <h4 className="text-sm font-medium">Senarai Semak</h4>
                <div className="mt-2 space-y-2.5">
                  {complianceItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2.5"
                    >
                      {item.completed ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      ) : (
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                      )}
                      <div className="min-w-0">
                        <p
                          className={`text-sm leading-snug ${
                            item.completed
                              ? 'text-muted-foreground line-through'
                              : 'text-foreground font-medium'
                          }`}
                        >
                          {item.label}
                        </p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              {incompleteItems.length > 0 && (
                <div className="mt-6 border-t pt-4">
                  <h4 className="mb-2 text-sm font-medium text-amber-600 dark:text-amber-400">
                    Perlu Tindakan ({incompleteItems.length})
                  </h4>
                  <div className="space-y-1.5">
                    {incompleteItems.map((item, index) => (
                      <button
                        key={index}
                        className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted"
                      >
                        <span className="truncate pr-2">{item.label}</span>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
