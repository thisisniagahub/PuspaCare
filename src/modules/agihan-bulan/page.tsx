'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, isThisMonth, parseISO } from 'date-fns'
import { ms } from 'date-fns/locale'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Package,
  Users,
  MapPin,
  DollarSign,
  CalendarDays,
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  UserCheck,
  Home,
  Phone,
  FileText,
  RotateCcw,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────

type Kawasan = 'cheras' | 'ampang' | 'gombak' | 'hulu_langat' | 'petaling' | 'klang' | 'sepang' | 'kuala_selangor'
type KategoriAsnaf = 'fakir' | 'miskin' | 'amil' | 'muallaf' | 'gharim' | 'fisabillillah' | 'ibnus_sabil' | 'riqab'
type DistributionStatus = 'dibahagi' | 'dalam_proses' | 'menunggu_kelulusan' | 'gagal'
type DeliveryMethod = 'hantar_sendiri' | 'urus_kurier' | 'ambil_sendiri'

interface StapleItem {
  id: string
  label: string
}

interface Distribution {
  id: string
  refNo: string
  namaAsnaf: string
  noKP: string
  noTelefon: string
  alamat: string
  kawasan: Kawasan
  kategori: KategoriAsnaf
  bilTanggungan: number
  makananRuji: string[]
  catatan: string
  kaedahPenghantaran: DeliveryMethod
  status: DistributionStatus
  date: string
  expenditure: number
}

interface DistributionFormData {
  namaAsnaf: string
  noKP: string
  noTelefon: string
  alamat: string
  kawasan: Kawasan
  kategori: KategoriAsnaf
  bilTanggungan: number
  makananRuji: string[]
  catatan: string
  kaedahPenghantaran: DeliveryMethod
  status: DistributionStatus
  date: string
}

// ─── Constants ───────────────────────────────────────────────────────

const KAWASAN_CONFIG: Record<Kawasan, { label: string }> = {
  cheras: { label: 'Cheras' },
  ampang: { label: 'Ampang' },
  gombak: { label: 'Gombak' },
  hulu_langat: { label: 'Hulu Langat' },
  petaling: { label: 'Petaling' },
  klang: { label: 'Klang' },
  sepang: { label: 'Sepang' },
  kuala_selangor: { label: 'Kuala Selangor' },
}

const KATEGORI_CONFIG: Record<KategoriAsnaf, { label: string; color: string; bgClass: string }> = {
  fakir: { label: 'Fakir', color: '#6b7280', bgClass: 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300' },
  miskin: { label: 'Miskin', color: '#dc2626', bgClass: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
  amil: { label: 'Amil', color: '#4B0082', bgClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' },
  muallaf: { label: 'Muallaf', color: '#059669', bgClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' },
  gharim: { label: 'Gharim', color: '#d97706', bgClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
  fisabillillah: { label: 'Fisabillillah', color: '#2563eb', bgClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  ibnus_sabil: { label: 'Ibnus Sabil', color: '#7c3aed', bgClass: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300' },
  riqab: { label: 'Riqab', color: '#0891b2', bgClass: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300' },
}

const STATUS_CONFIG: Record<DistributionStatus, { label: string; color: string; bgClass: string; icon: React.ElementType }> = {
  dibahagi: { label: 'Dibahagi', color: '#059669', bgClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300', icon: CheckCircle2 },
  dalam_proses: { label: 'Dalam Proses', color: '#d97706', bgClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300', icon: Clock },
  menunggu_kelulusan: { label: 'Menunggu Kelulusan', color: '#2563eb', bgClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300', icon: RotateCcw },
  gagal: { label: 'Gagal', color: '#dc2626', bgClass: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300', icon: XCircle },
}

const DELIVERY_CONFIG: Record<DeliveryMethod, { label: string; icon: React.ElementType }> = {
  hantar_sendiri: { label: 'Hantar Sendiri', icon: Truck },
  urus_kurier: { label: 'Urus Kurier', icon: Package },
  ambil_sendiri: { label: 'Ambil Sendiri', icon: UserCheck },
}

const MAKANAN_RUJI_ITEMS: StapleItem[] = [
  { id: 'beras', label: 'Beras (Rice)' },
  { id: 'minyak_masak', label: 'Minyak Masak (Cooking Oil)' },
  { id: 'gula', label: 'Gula (Sugar)' },
  { id: 'tepung', label: 'Tepung (Flour)' },
  { id: 'mie_spaghetti', label: 'Mie/Spaghetti' },
  { id: 'kacang_kekacang', label: 'Kacang/Kekacang (Beans/Legumes)' },
  { id: 'susu', label: 'Susu (Milk)' },
  { id: 'telur', label: 'Telur (Eggs)' },
]

const ITEMS_PER_PAGE = 8

// ─── Mock Data ───────────────────────────────────────────────────────

const MOCK_DISTRIBUTIONS: Distribution[] = [
  {
    id: 'A001',
    refNo: 'AGIHAN-2025-0001',
    namaAsnaf: 'Fatimah binti Osman',
    noKP: '600101-14-5032',
    noTelefon: '012-345 6789',
    alamat: 'No. 23, Jalan Mawar 1, Taman Mawar, 43200 Cheras, Selangor',
    kawasan: 'cheras',
    kategori: 'fakir',
    bilTanggungan: 5,
    makananRuji: ['beras', 'minyak_masak', 'gula', 'tepung', 'susu'],
    catatan: 'Janda tua, tiada sumber pendapatan tetap',
    kaedahPenghantaran: 'hantar_sendiri',
    status: 'dibahagi',
    date: '2025-01-10',
    expenditure: 150.00,
  },
  {
    id: 'A002',
    refNo: 'AGIHAN-2025-0002',
    namaAsnaf: 'Ahmad bin Yusof',
    noKP: '750505-01-5111',
    noTelefon: '013-987 6543',
    alamat: 'No. 5, Jalan Kenanga 3, Ampang Point, 68000 Ampang, Selangor',
    kawasan: 'ampang',
    kategori: 'miskin',
    bilTanggungan: 7,
    makananRuji: ['beras', 'minyak_masak', 'gula', 'tepung', 'mie_spaghetti', 'telur'],
    catatan: 'Pekerja bawaan, isteri sakit kronik',
    kaedahPenghantaran: 'urus_kurier',
    status: 'dibahagi',
    date: '2025-01-12',
    expenditure: 210.00,
  },
  {
    id: 'A003',
    refNo: 'AGIHAN-2025-0003',
    namaAsnaf: 'Siti Aminah binti Abdullah',
    noKP: '800812-06-5222',
    noTelefon: '016-223 3445',
    alamat: 'Blok C, Lot 12, Kg. Melayu Gombak, 53100 Gombak, Selangor',
    kawasan: 'gombak',
    kategori: 'muallaf',
    bilTanggungan: 4,
    makananRuji: ['beras', 'minyak_masak', 'gula', 'susu', 'kacang_kekacang'],
    catatan: 'Pemeluk Islam baru, suami tiada kerja',
    kaedahPenghantaran: 'hantar_sendiri',
    status: 'dibahagi',
    date: '2025-01-15',
    expenditure: 120.00,
  },
  {
    id: 'A004',
    refNo: 'AGIHAN-2025-0004',
    namaAsnaf: 'Mohd Rashid bin Hamid',
    noKP: '680310-07-5333',
    noTelefon: '017-334 4556',
    alamat: 'No. 88, Jalan Hulu Langat, Batu 14, 43100 Hulu Langat, Selangor',
    kawasan: 'hulu_langat',
    kategori: 'gharim',
    bilTanggungan: 6,
    makananRuji: ['beras', 'minyak_masak', 'gula', 'tepung', 'mie_spaghetti', 'susu', 'telur'],
    catatan: 'Terbeban hutang perubatan isteri',
    kaedahPenghantaran: 'hantar_sendiri',
    status: 'dalam_proses',
    date: '2025-02-05',
    expenditure: 0,
  },
  {
    id: 'A005',
    refNo: 'AGIHAN-2025-0005',
    namaAsnaf: 'Nur Hafizah binti Md Noor',
    noKP: '900623-10-5444',
    noTelefon: '014-556 6778',
    alamat: 'No. 15-3, Jalan Kuchai, 58200 Kuala Lumpur',
    kawasan: 'petaling',
    kategori: 'fisabillillah',
    bilTanggungan: 3,
    makananRuji: ['beras', 'minyak_masak', 'gula', 'susu', 'telur'],
    catatan: 'Penggiat komuniti, membantu program PUSPA',
    kaedahPenghantaran: 'ambil_sendiri',
    status: 'menunggu_kelulusan',
    date: '2025-02-10',
    expenditure: 0,
  },
  {
    id: 'A006',
    refNo: 'AGIHAN-2025-0006',
    namaAsnaf: 'Ismail bin Sulaiman',
    noKP: '550321-01-5555',
    noTelefon: '011-667 7889',
    alamat: 'No. 44, Jalan Tengku Kelana, 41000 Klang, Selangor',
    kawasan: 'klang',
    kategori: 'fakir',
    bilTanggungan: 4,
    makananRuji: ['beras', 'minyak_masak', 'gula', 'tepung', 'kacang_kekacang', 'telur'],
    catatan: 'Warga emas, tinggal bersendirian',
    kaedahPenghantaran: 'hantar_sendiri',
    status: 'dibahagi',
    date: '2025-02-15',
    expenditure: 130.00,
  },
  {
    id: 'A007',
    refNo: 'AGIHAN-2025-0007',
    namaAsnaf: 'Aminah binti Hassan',
    noKP: '700415-03-5666',
    noTelefon: '012-778 8901',
    alamat: 'Kg. Baru Sepang, Jalan Sepang, 43900 Sepang, Selangor',
    kawasan: 'sepang',
    kategori: 'miskin',
    bilTanggungan: 8,
    makananRuji: ['beras', 'minyak_masak', 'gula', 'tepung', 'mie_spaghetti', 'kacang_kekacang', 'susu', 'telur'],
    catatan: 'Keluarga besar, suami pesakit kronik',
    kaedahPenghantaran: 'urus_kurier',
    status: 'dibahagi',
    date: '2025-02-20',
    expenditure: 240.00,
  },
  {
    id: 'A008',
    refNo: 'AGIHAN-2025-0008',
    namaAsnaf: 'Rahim bin Osman',
    noKP: '820918-01-5777',
    noTelefon: '019-889 9002',
    alamat: 'No. 7, Lorong Masjid, 45000 Kuala Selangor, Selangor',
    kawasan: 'kuala_selangor',
    kategori: 'amil',
    bilTanggungan: 3,
    makananRuji: ['beras', 'minyak_masak', 'gula', 'susu'],
    catatan: 'Pengurus pusat agihan tempatan',
    kaedahPenghantaran: 'ambil_sendiri',
    status: 'dibahagi',
    date: '2025-03-01',
    expenditure: 80.00,
  },
  {
    id: 'A009',
    refNo: 'AGIHAN-2025-0009',
    namaAsnaf: 'Zalimah binti Md Daud',
    noKP: '640208-14-5888',
    noTelefon: '013-223 4456',
    alamat: 'No. 12, Jalan Mutiara, Taman Seri Indah, 43200 Cheras, Selangor',
    kawasan: 'cheras',
    kategori: 'ibnus_sabil',
    bilTanggungan: 2,
    makananRuji: ['beras', 'minyak_masak', 'gula', 'tepung', 'telur'],
    catatan: 'Musafir terkandas di KL',
    kaedahPenghantaran: 'ambil_sendiri',
    status: 'gagal',
    date: '2025-03-05',
    expenditure: 0,
  },
  {
    id: 'A010',
    refNo: 'AGIHAN-2025-0010',
    namaAsnaf: 'Kamariah binti Yacob',
    noKP: '710730-06-5999',
    noTelefon: '016-334 5567',
    alamat: 'No. 56, Jalan Wawasan 2, Ampang Hilir, 55000 Ampang, Selangor',
    kawasan: 'ampang',
    kategori: 'riqab',
    bilTanggungan: 5,
    makananRuji: ['beras', 'minyak_masak', 'gula', 'tepung', 'mie_spaghetti', 'susu'],
    catatan: 'Bekas pekerja kontrak, dalam proses mencari kerja',
    kaedahPenghantaran: 'hantar_sendiri',
    status: 'dalam_proses',
    date: '2025-03-10',
    expenditure: 0,
  },
  {
    id: 'A011',
    refNo: 'AGIHAN-2025-0011',
    namaAsnaf: 'Abdul Rahman bin Ismail',
    noKP: '590510-01-6000',
    noTelefon: '012-445 5566',
    alamat: 'No. 34, Jalan Saujana, Kg. Sg. Tua, 68100 Batu Caves, Selangor',
    kawasan: 'gombak',
    kategori: 'fakir',
    bilTanggungan: 6,
    makananRuji: ['beras', 'minyak_masak', 'gula', 'tepung', 'kacang_kekacang', 'susu', 'telur'],
    catatan: 'Orang kurang upaya, isteri penjaga',
    kaedahPenghantaran: 'hantar_sendiri',
    status: 'dibahagi',
    date: '2025-03-15',
    expenditure: 200.00,
  },
  {
    id: 'A012',
    refNo: 'AGIHAN-2025-0012',
    namaAsnaf: 'Halimaton binti Saad',
    noKP: '880315-10-6111',
    noTelefon: '017-556 6677',
    alamat: 'No. 21, Jalan Merdeka, 42700 Banting, Selangor',
    kawasan: 'kuala_selangor',
    kategori: 'miskin',
    bilTanggungan: 4,
    makananRuji: ['beras', 'minyak_masak', 'gula', 'mie_spaghetti', 'telur'],
    catatan: 'Ibu tunggal, 4 orang anak',
    kaedahPenghantaran: 'urus_kurier',
    status: 'menunggu_kelulusan',
    date: '2025-03-20',
    expenditure: 0,
  },
  {
    id: 'A013',
    refNo: 'AGIHAN-2025-0013',
    namaAsnaf: 'Muhammad Farhan bin Ali',
    noKP: '950822-01-6222',
    noTelefon: '014-667 7788',
    alamat: 'No. 8, Jalan Permata, Taman Permata, 43200 Cheras, Selangor',
    kawasan: 'cheras',
    kategori: 'fisabillillah',
    bilTanggungan: 2,
    makananRuji: ['beras', 'minyak_masak', 'gula', 'susu'],
    catatan: 'Pelajar universiti dari keluarga miskin',
    kaedahPenghantaran: 'ambil_sendiri',
    status: 'dibahagi',
    date: '2025-04-02',
    expenditure: 60.00,
  },
]

// ─── Zod Schema ──────────────────────────────────────────────────────

const distributionFormSchema = z.object({
  namaAsnaf: z.string().min(1, 'Nama asnaf diperlukan'),
  noKP: z.string().min(1, 'No. KP diperlukan'),
  noTelefon: z.string().optional().default(''),
  alamat: z.string().optional().default(''),
  kawasan: z.enum([
    'cheras', 'ampang', 'gombak', 'hulu_langat', 'petaling', 'klang', 'sepang', 'kuala_selangor',
  ] as const),
  kategori: z.enum([
    'fakir', 'miskin', 'amil', 'muallaf', 'gharim', 'fisabillillah', 'ibnus_sabil', 'riqab',
  ] as const),
  bilTanggungan: z.coerce.number().min(0, 'Bilangan tidak boleh negatif').max(20, 'Maksimum 20 tanggungan'),
  makananRuji: z.array(z.string()).min(1, 'Sekurang-kurangnya satu item makanan ruji perlu dipilih'),
  catatan: z.string().optional().default(''),
  kaedahPenghantaran: z.enum(['hantar_sendiri', 'urus_kurier', 'ambil_sendiri'] as const),
  status: z.enum(['dibahagi', 'dalam_proses', 'menunggu_kelulusan', 'gagal'] as const),
  date: z.string().min(1, 'Tarikh diperlukan'),
})

type DistributionFormValues = z.infer<typeof distributionFormSchema>

// ─── Helper Functions ────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return `RM ${amount.toLocaleString('ms-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy', { locale: ms })
  } catch {
    return dateStr
  }
}

function getKategoriBadge(kategori: KategoriAsnaf) {
  const config = KATEGORI_CONFIG[kategori]
  return (
    <Badge variant="outline" className={cn('font-medium border-0', config.bgClass)}>
      {config.label}
    </Badge>
  )
}

function getStatusBadge(status: DistributionStatus) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon
  return (
    <Badge variant="outline" className={cn('font-medium gap-1 border-0', config.bgClass)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

function getDeliveryIcon(method: DeliveryMethod) {
  const config = DELIVERY_CONFIG[method]
  const Icon = config.icon
  return <Icon className="h-4 w-4 text-muted-foreground" />
}

function getStapleLabel(id: string): string {
  const item = MAKANAN_RUJI_ITEMS.find(i => i.id === id)
  return item ? item.label : id
}

function calculateExpenditure(makananRuji: string[], bilTanggungan: number): number {
  const unitPrices: Record<string, number> = {
    beras: 30,
    minyak_masak: 12,
    gula: 8,
    tepung: 6,
    mie_spaghetti: 5,
    kacang_kekacang: 10,
    susu: 15,
    telur: 8,
  }
  const baseCost = makananRuji.reduce((sum, item) => sum + (unitPrices[item] || 0), 0)
  const multiplier = bilTanggungan <= 2 ? 1 : bilTanggungan <= 4 ? 1.5 : bilTanggungan <= 6 ? 2 : 2.5
  return Math.round(baseCost * multiplier * 100) / 100
}

// ─── Main Component ──────────────────────────────────────────────────

export default function AgihanBulanPage() {
  // State
  const [distributions, setDistributions] = React.useState<Distribution[]>(MOCK_DISTRIBUTIONS)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [filterKawasan, setFilterKawasan] = React.useState<string>('semua')
  const [filterStatus, setFilterStatus] = React.useState<string>('semua')
  const [currentPage, setCurrentPage] = React.useState(1)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [editingDistribution, setEditingDistribution] = React.useState<Distribution | null>(null)
  const [viewingDistribution, setViewingDistribution] = React.useState<Distribution | null>(null)
  const [sortField, setSortField] = React.useState<'date' | 'namaAsnaf' | 'kawasan'>('date')
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('desc')

  // Form
  const form = useForm<DistributionFormValues>({
    resolver: zodResolver(distributionFormSchema),
    defaultValues: {
      namaAsnaf: '',
      noKP: '',
      noTelefon: '',
      alamat: '',
      kawasan: 'cheras',
      kategori: 'fakir',
      bilTanggungan: 1,
      makananRuji: [],
      catatan: '',
      kaedahPenghantaran: 'hantar_sendiri',
      status: 'menunggu_kelulusan',
      date: new Date().toISOString().split('T')[0],
    },
  })

  // ─── Computed Data ─────────────────────────────────────────────────

  const totalRecipients = distributions.length
  const thisMonthDistributions = distributions.filter(d => {
    try { return isThisMonth(parseISO(d.date)) } catch { return false }
  })
  const thisMonthCount = thisMonthDistributions.length
  const totalAreas = new Set(distributions.map(d => d.kawasan)).size
  const monthlyExpenditure = distributions
    .filter(d => d.status === 'dibahagi')
    .reduce((sum, d) => sum + d.expenditure, 0)

  // Filtered distributions
  const filteredDistributions = React.useMemo(() => {
    let result = [...distributions]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        d =>
          d.namaAsnaf.toLowerCase().includes(q) ||
          d.noKP.toLowerCase().includes(q)
      )
    }
    if (filterKawasan !== 'semua') {
      result = result.filter(d => d.kawasan === filterKawasan)
    }
    if (filterStatus !== 'semua') {
      result = result.filter(d => d.status === filterStatus)
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0
      if (sortField === 'date') cmp = a.date.localeCompare(b.date)
      else if (sortField === 'namaAsnaf') cmp = a.namaAsnaf.localeCompare(b.namaAsnaf)
      else cmp = a.kawasan.localeCompare(b.kawasan)
      return sortDir === 'desc' ? -cmp : cmp
    })

    return result
  }, [distributions, searchQuery, filterKawasan, filterStatus, sortField, sortDir])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredDistributions.length / ITEMS_PER_PAGE))
  const paginatedDistributions = filteredDistributions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterKawasan, filterStatus])

  // ─── Handlers ──────────────────────────────────────────────────────

  function handleSort(field: 'date' | 'namaAsnaf' | 'kawasan') {
    if (sortField === field) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  function handleCreate() {
    setEditingDistribution(null)
    form.reset({
      namaAsnaf: '',
      noKP: '',
      noTelefon: '',
      alamat: '',
      kawasan: 'cheras',
      kategori: 'fakir',
      bilTanggungan: 1,
      makananRuji: [],
      catatan: '',
      kaedahPenghantaran: 'hantar_sendiri',
      status: 'menunggu_kelulusan',
      date: new Date().toISOString().split('T')[0],
    })
    setDialogOpen(true)
  }

  function handleEdit(distribution: Distribution) {
    setEditingDistribution(distribution)
    form.reset({
      namaAsnaf: distribution.namaAsnaf,
      noKP: distribution.noKP,
      noTelefon: distribution.noTelefon,
      alamat: distribution.alamat,
      kawasan: distribution.kawasan,
      kategori: distribution.kategori,
      bilTanggungan: distribution.bilTanggungan,
      makananRuji: distribution.makananRuji,
      catatan: distribution.catatan,
      kaedahPenghantaran: distribution.kaedahPenghantaran,
      status: distribution.status,
      date: distribution.date,
    })
    setDialogOpen(true)
  }

  function handleView(distribution: Distribution) {
    setViewingDistribution(distribution)
    setSheetOpen(true)
  }

  function handleDelete(distribution: Distribution) {
    setDistributions(prev => prev.filter(d => d.id !== distribution.id))
  }

  function onSubmit(data: DistributionFormValues) {
    const expenditure = data.status === 'dibahagi'
      ? calculateExpenditure(data.makananRuji, data.bilTanggungan)
      : 0

    if (editingDistribution) {
      setDistributions(prev =>
        prev.map(d =>
          d.id === editingDistribution.id
            ? {
                ...d,
                namaAsnaf: data.namaAsnaf,
                noKP: data.noKP,
                noTelefon: data.noTelefon,
                alamat: data.alamat,
                kawasan: data.kawasan,
                kategori: data.kategori,
                bilTanggungan: data.bilTanggungan,
                makananRuji: data.makananRuji,
                catatan: data.catatan,
                kaedahPenghantaran: data.kaedahPenghantaran,
                status: data.status,
                date: data.date,
                expenditure,
              }
            : d
        )
      )
    } else {
      const nextNum = distributions.length + 1
      const newDistribution: Distribution = {
        id: `A${String(nextNum).padStart(3, '0')}`,
        refNo: `AGIHAN-2025-${String(nextNum).padStart(4, '0')}`,
        namaAsnaf: data.namaAsnaf,
        noKP: data.noKP,
        noTelefon: data.noTelefon,
        alamat: data.alamat,
        kawasan: data.kawasan,
        kategori: data.kategori,
        bilTanggungan: data.bilTanggungan,
        makananRuji: data.makananRuji,
        catatan: data.catatan,
        kaedahPenghantaran: data.kaedahPenghantaran,
        status: data.status,
        date: data.date,
        expenditure,
      }
      setDistributions(prev => [newDistribution, ...prev])
    }
    setDialogOpen(false)
  }

  // ─── Render ────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Agihan Makan Ruji Bulanan
            </h1>
            <p className="text-muted-foreground mt-1">
              Pengurusan agihan bulanan makanan ruji kepada asnaf di semua kawasan
            </p>
          </div>
          <Button
            onClick={handleCreate}
            size="lg"
            className="gap-2 shrink-0"
            style={{ backgroundColor: '#4B0082' }}
          >
            <Plus className="h-4 w-4" />
            Agihan Baharu
          </Button>
        </div>

        {/* ─── Summary Cards ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Jumlah Penerima */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Jumlah Penerima</p>
                  <p className="text-2xl font-bold">{totalRecipients}</p>
                  <p className="text-xs text-muted-foreground">Asnaf berdaftar</p>
                </div>
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: '#4B00821A' }}
                >
                  <Users className="h-6 w-6" style={{ color: '#4B0082' }} />
                </div>
              </div>
            </CardContent>
            <div
              className="absolute bottom-0 left-0 h-1 w-full"
              style={{ backgroundColor: '#4B0082' }}
            />
          </Card>

          {/* Bulan Ini Agihan */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Bulan Ini Agihan</p>
                  <p className="text-2xl font-bold">{thisMonthCount}</p>
                  <p className="text-xs text-muted-foreground">Agihan bulan semasa</p>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                  <Package className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-400 to-emerald-600" />
          </Card>

          {/* Jumlah Kawasan */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Jumlah Kawasan</p>
                  <p className="text-2xl font-bold">{totalAreas}</p>
                  <p className="text-xs text-muted-foreground">Kawasan liputan</p>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40">
                  <MapPin className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-amber-400 to-amber-600" />
          </Card>

          {/* Perbelanjaan Bulan Ini */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Perbelanjaan Bulan Ini</p>
                  <p className="text-2xl font-bold">{formatCurrency(monthlyExpenditure)}</p>
                  <p className="text-xs text-muted-foreground">
                    {distributions.filter(d => d.status === 'dibahagi').length} agihan berjaya
                  </p>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/40">
                  <DollarSign className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-red-400 to-red-600" />
          </Card>
        </div>

        {/* ─── Filter Bar ──────────────────────────────────────────── */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Carian & Penapis</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari nama asnaf / No. KP..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Kawasan filter */}
              <Select value={filterKawasan} onValueChange={setFilterKawasan}>
                <SelectTrigger>
                  <SelectValue placeholder="Kawasan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Kawasan</SelectItem>
                  {(Object.keys(KAWASAN_CONFIG) as Kawasan[]).map(k => (
                    <SelectItem key={k} value={k}>
                      {KAWASAN_CONFIG[k].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status filter */}
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Status</SelectItem>
                  {(Object.keys(STATUS_CONFIG) as DistributionStatus[]).map(s => (
                    <SelectItem key={s} value={s}>
                      {STATUS_CONFIG[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* ─── Desktop Data Table ──────────────────────────────────── */}
        <Card className="hidden md:block">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">No. Rujukan</TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" className="gap-1 -ml-3 h-8 font-medium" onClick={() => handleSort('namaAsnaf')}>
                        Nama Asnaf
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead>No. KP</TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" className="gap-1 -ml-3 h-8 font-medium" onClick={() => handleSort('kawasan')}>
                        Kawasan
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-center">Bil. Tanggungan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" className="gap-1 -ml-3 h-8 font-medium" onClick={() => handleSort('date')}>
                        Tarikh
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="w-[80px]">Tindakan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDistributions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                        Tiada rekod agihan dijumpai
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedDistributions.map((distribution) => (
                      <TableRow key={distribution.id} className="group">
                        <TableCell className="font-mono text-xs">{distribution.refNo}</TableCell>
                        <TableCell>
                          <span className="font-medium">{distribution.namaAsnaf}</span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{distribution.noKP}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            {KAWASAN_CONFIG[distribution.kawasan].label}
                          </Badge>
                        </TableCell>
                        <TableCell>{getKategoriBadge(distribution.kategori)}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="font-mono">
                            {distribution.bilTanggungan}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(distribution.status)}</TableCell>
                        <TableCell className="text-sm">{formatDate(distribution.date)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Tindakan</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleView(distribution)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Lihat
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(distribution)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(distribution)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Padam
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* ─── Mobile Card List ────────────────────────────────────── */}
        <div className="md:hidden space-y-3">
          {paginatedDistributions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Tiada rekod agihan dijumpai
              </CardContent>
            </Card>
          ) : (
            paginatedDistributions.map((distribution) => (
              <Card key={distribution.id} className="overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-1">
                      <p className="font-mono text-xs text-muted-foreground">{distribution.refNo}</p>
                      <p className="font-semibold truncate">{distribution.namaAsnaf}</p>
                    </div>
                    {getStatusBadge(distribution.status)}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">No. KP: </span>
                      <span className="font-medium">{distribution.noKP}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Kawasan: </span>
                      <span className="font-medium">{KAWASAN_CONFIG[distribution.kawasan].label}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Kategori: </span>
                      {getKategoriBadge(distribution.kategori)}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tanggungan: </span>
                      <span className="font-medium">{distribution.bilTanggungan}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t">
                    <span className="text-xs text-muted-foreground">{formatDate(distribution.date)}</span>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleView(distribution)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(distribution)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600"
                        onClick={() => handleDelete(distribution)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* ─── Pagination ──────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Menunjukkan {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredDistributions.length)} daripada{' '}
              {filteredDistributions.length} rekod
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage(page)}
                  style={currentPage === page ? { backgroundColor: '#4B0082' } : undefined}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ─── Add/Edit Dialog ─────────────────────────────────────── */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDistribution ? 'Edit Agihan' : 'Tambah Agihan Baharu'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Maklumat Asnaf */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: '#4B0082' }}>
                      Maklumat Asnaf
                    </h3>
                    <Separator className="mt-2" />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="namaAsnaf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Asnaf</FormLabel>
                          <FormControl>
                            <Input placeholder="Nama penuh asnaf" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="noKP"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>No. KP</FormLabel>
                          <FormControl>
                            <Input placeholder="xxxxxxxx-xx-xxxx" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="noTelefon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>No. Telefon</FormLabel>
                          <FormControl>
                            <Input placeholder="0xx-xxx xxxx" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bilTanggungan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bil. Tanggungan</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} max={20} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="alamat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alamat</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Alamat penuh asnaf" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Maklumat Agihan */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: '#4B0082' }}>
                      Maklumat Agihan
                    </h3>
                    <Separator className="mt-2" />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="kawasan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kawasan</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih kawasan" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(Object.keys(KAWASAN_CONFIG) as Kawasan[]).map(k => (
                                <SelectItem key={k} value={k}>
                                  {KAWASAN_CONFIG[k].label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="kategori"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kategori</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih kategori" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(Object.keys(KATEGORI_CONFIG) as KategoriAsnaf[]).map(k => (
                                <SelectItem key={k} value={k}>
                                  {KATEGORI_CONFIG[k].label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(Object.keys(STATUS_CONFIG) as DistributionStatus[]).map(s => (
                                <SelectItem key={s} value={s}>
                                  {STATUS_CONFIG[s].label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tarikh Agihan</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Makanan Ruji */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: '#4B0082' }}>
                      Senarai Makanan Ruji
                    </h3>
                    <Separator className="mt-2" />
                  </div>

                  <FormField
                    control={form.control}
                    name="makananRuji"
                    render={() => (
                      <FormItem>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {MAKANAN_RUJI_ITEMS.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="makananRuji"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        const current = field.value || []
                                        if (checked) {
                                          field.onChange([...current, item.id])
                                        } else {
                                          field.onChange(current.filter(v => v !== item.id))
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal cursor-pointer">
                                    {item.label}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Penghantaran & Catatan */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: '#4B0082' }}>
                      Penghantaran & Catatan
                    </h3>
                    <Separator className="mt-2" />
                  </div>

                  <FormField
                    control={form.control}
                    name="kaedahPenghantaran"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kaedah Penghantaran</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih kaedah" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(Object.keys(DELIVERY_CONFIG) as DeliveryMethod[]).map(m => (
                              <SelectItem key={m} value={m}>
                                {DELIVERY_CONFIG[m].label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="catatan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catatan</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Catatan tambahan..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    style={{ backgroundColor: '#4B0082' }}
                  >
                    {editingDistribution ? 'Simpan Perubahan' : 'Tambah Agihan'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* ─── View Sheet ──────────────────────────────────────────── */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            {viewingDistribution && (
              <>
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" style={{ color: '#4B0082' }} />
                    Butiran Agihan
                  </SheetTitle>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                  {/* Status & Reference */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">No. Rujukan</p>
                      <p className="font-mono text-sm font-semibold">{viewingDistribution.refNo}</p>
                    </div>
                    {getStatusBadge(viewingDistribution.status)}
                  </div>

                  <Separator />

                  {/* Maklumat Asnaf */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold" style={{ color: '#4B0082' }}>
                      Maklumat Asnaf
                    </h4>
                    <div className="space-y-2.5">
                      <div className="flex items-start gap-3">
                        <UserCheck className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Nama Asnaf</p>
                          <p className="text-sm font-medium">{viewingDistribution.namaAsnaf}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FileText className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">No. KP</p>
                          <p className="text-sm font-medium">{viewingDistribution.noKP}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">No. Telefon</p>
                          <p className="text-sm font-medium">{viewingDistribution.noTelefon || '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Home className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Alamat</p>
                          <p className="text-sm font-medium">{viewingDistribution.alamat || '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Users className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Bil. Tanggungan</p>
                          <p className="text-sm font-medium">{viewingDistribution.bilTanggungan} orang</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Maklumat Agihan */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold" style={{ color: '#4B0082' }}>
                      Maklumat Agihan
                    </h4>
                    <div className="space-y-2.5">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Kawasan</p>
                          <p className="text-sm font-medium">{KAWASAN_CONFIG[viewingDistribution.kawasan].label}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Package className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Kategori</p>
                          <div className="mt-1">{getKategoriBadge(viewingDistribution.kategori)}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CalendarDays className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Tarikh Agihan</p>
                          <p className="text-sm font-medium">{formatDate(viewingDistribution.date)}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        {getDeliveryIcon(viewingDistribution.kaedahPenghantaran)}
                        <div className="mt-0.5">
                          <p className="text-xs text-muted-foreground">Kaedah Penghantaran</p>
                          <p className="text-sm font-medium">{DELIVERY_CONFIG[viewingDistribution.kaedahPenghantaran].label}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Senarai Makanan Ruji */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold" style={{ color: '#4B0082' }}>
                      Senarai Makanan Ruji
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {viewingDistribution.makananRuji.map((item) => (
                        <Badge
                          key={item}
                          variant="outline"
                          className="gap-1.5 py-1 px-3"
                          style={{ borderColor: '#4B0082', color: '#4B0082' }}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          {getStapleLabel(item)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Catatan */}
                  {viewingDistribution.catatan && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold" style={{ color: '#4B0082' }}>
                          Catatan
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {viewingDistribution.catatan}
                        </p>
                      </div>
                    </>
                  )}

                  {/* Expenditure */}
                  {viewingDistribution.status === 'dibahagi' && (
                    <>
                      <Separator />
                      <div
                        className="rounded-lg p-4 text-center"
                        style={{ backgroundColor: '#4B00820A' }}
                      >
                        <p className="text-sm text-muted-foreground">Anggaran Perbelanjaan</p>
                        <p
                          className="text-2xl font-bold mt-1"
                          style={{ color: '#4B0082' }}
                        >
                          {formatCurrency(viewingDistribution.expenditure)}
                        </p>
                      </div>
                    </>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => {
                        setSheetOpen(false)
                        handleEdit(viewingDistribution)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      className="gap-2"
                      onClick={() => {
                        setSheetOpen(false)
                        handleDelete(viewingDistribution)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      Padam
                    </Button>
                  </div>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
