'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  BarChart3,
  Wallet,
  Heart,
  Users,
  Sparkles,
  Send,
  Copy,
  Download,
  Mic,
  Search,
  Calculator,
  ClipboardList,
  MessageSquare,
  Loader2,
  Check,
  Bot,
  User,
  FileText,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: Date
}

interface ReportType {
  id: string
  icon: React.ReactNode
  title: string
  description: string
  color: string
  report: string
}

interface CommLog {
  id: string
  name: string
  type: string
  notes: string
  date: string
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const reportTypes: ReportType[] = [
  {
    id: 'org',
    icon: <BarChart3 className="h-8 w-8" />,
    title: 'Ringkasan Organisasi',
    description: 'Gambaran keseluruhan prestasi dan operasi PUSPA',
    color: 'from-emerald-500 to-teal-600',
    report: `# 📊 Ringkasan Organisasi PUSPA

## Gambaran Keseluruhan
**Tarikh Laporan:** 21 April 2026  
**Tempoh:** Januari - April 2026

---

## Statistik Utama

| Metrik | Nilai | Perubahan |
|--------|-------|-----------|
| Jumlah Ahli Berdaftar | 342 | +12.3% |
| Ahli Aktif | 287 | +8.7% |
| Program Aktif | 15 | +3 baru |
| Sukan Sukarelawan | 48 | +15.2% |
| Kumpulan Donasi (Bulan Ini) | RM 45,230 | +22.1% |

---

## Pencapaian Utama

1. **Program AsnafCare** telah berjaya membantu **89 keluarga** di kawasan Hulu Klang
2. **Kempen Ramadhan 2026** mengumpul **RM 125,000** - melebihi sasaran sebanyak 25%
3. **Kelas Tilawah Dewasa** mencatatkan kehadiran purata **92%** setiap sesi
4. **Program Mentoring Belia** melibatkan **34 orang** belia berusia 18-25 tahun

---

## Cabaran Dikenal Pasti

- Keperluan peningkatan sistem pengurusan data ahli
- Perluasan liputan program ke kawasan Setapak dan Wangsa Maju
- Pengurusan perbelanjaan operasi yang lebih cekap

---

## Cadangan Tindakan

- Melaksanakan sistem digital bersepadu menjelang Q3 2026
- Menubuhkan cawangan di kawasan Setapak
- Mengadakan program penjanaan pendapatan untuk asnaf`,
  },
  {
    id: 'finance',
    icon: <Wallet className="h-8 w-8" />,
    title: 'Laporan Kewangan',
    description: 'Analisis kewangan dan aliran wang organisasi',
    color: 'from-amber-500 to-orange-600',
    report: `# 💰 Laporan Kewangan PUSPA

## Suku Tahun Pertama 2026

---

## Ringkasan Kewangan

| Kategori | Jumlah (RM) | Peratus |
|----------|-------------|---------|
| **Pendapatan Jumlah** | **285,450** | 100% |
| └ Donasi Individu | 142,300 | 49.9% |
| └ Derma Korporat | 89,200 | 31.2% |
| └ Geran Kerajaan | 38,500 | 13.5% |
| └ Pendapatan Lain | 15,450 | 5.4% |
| **Perbelanjaan Jumlah** | **231,780** | 100% |
| └ Bantuan Langsung (BMT) | 128,400 | 55.4% |
| └ Program & Aktiviti | 52,300 | 22.6% |
| └ Operasi & Pentadbiran | 38,080 | 16.4% |
| └ Pembangunan | 13,000 | 5.6% |
| **Baki Bersih** | **RM 53,670** | — |

---

## Taburan Bantuan Mengikut Kategori

- **Keperluan Asas (Makanan)**: RM 52,800 (41.1%)
- **Pendidikan**: RM 34,200 (26.6%)
- **Kesihatan**: RM 22,500 (17.5%)
- **Perumahan**: RM 12,600 (9.8%)
- **Keperluan Khas**: RM 6,300 (4.9%)

---

## Analisis Trend

- Pendapatan donasi meningkat **22%** berbanding suku tahun sebelumnya
- Nisbah perbelanjaan program: **81.4%** (melebihi piawaian MBF 75%)
- Baki wang tunai semasa: **RM 89,230**
- Rizab kecemasan mencukupi untuk **3.2 bulan** operasi`,
  },
  {
    id: 'programme',
    icon: <Heart className="h-8 w-8" />,
    title: 'Laporan Program',
    description: 'Status dan prestasi semua program aktif',
    color: 'from-rose-500 to-pink-600',
    report: `# ❤️ Laporan Program PUSPA

## Status Program Aktif — April 2026

---

## Program Berjalan

### 1. AsnafCare (Bantuan Makanan Bulanan)
- **Status**: 🟢 Aktif
- **Penerima**: 89 keluarga
- **Anggaran Bulanan**: RM 18,200
- **Kawasan**: Hulu Klang, Gombak, Ampang
- **Penilaian**: 4.5/5.0

### 2. Pusat Sunnah Preschool
- **Status**: 🟢 Aktif
- **Pelajar**: 24 kanak-kanak
- **Anggaran Bulanan**: RM 8,500
- **Kadar Kehadiran**: 94%
- **Penilaian**: 4.8/5.0

### 3. Kelas Tilawah Dewasa
- **Status**: 🟢 Aktif
- **Peserta**: 67 orang
- **Sesi Seminggu**: 3 sesi
- **Tahap Hafazan Purata**: 3 Juz
- **Penilaian**: 4.3/5.0

### 4. Mentoring Belia PUSPA
- **Status**: 🟡 Sedang Berjalan
- **Mentee**: 34 belia
- **Mentor**: 12 sukarelawan
- **Program Intensif**: Julai 2026
- **Penilaian**: 4.0/5.0

### 5. Klinik Kesihatan Komuniti
- **Status**: 🟡 Pendekatan Rakan Strategik
- **Rakan Kongsi**: Klinik Nurain
- **Peserta Discaj**: 156 orang
- **Sesi Bulanan**: 2 sesi
- **Penilaian**: 4.2/5.0

---

## Program Akan Datang

| Program | Tarikh | Anggaran | Status |
|---------|--------|----------|--------|
| Kem Ibadah Remaja | 15 Jun 2026 | RM 12,000 | Perancangan |
| Bazar Amal PUSPA | 20 Jul 2026 | RM 5,000 | Sokongan |
| Program Back-to-School | 15 Ogos 2026 | RM 25,000 | Permohonan |
| Waqaf Al-Quran | 1 Sept 2026 | RM 30,000 | kutipan dana |`,
  },
  {
    id: 'demographic',
    icon: <Users className="h-8 w-8" />,
    title: 'Demografi Ahli',
    description: 'Analisis demografi dan profil ahli PUSPA',
    color: 'from-violet-500 to-purple-600',
    report: `# 👥 Demografi Ahli PUSPA

## Analisis Demografi — April 2026

---

## Ringkasan Keahlian

| Kategori | Bilangan | Peratus |
|----------|----------|---------|
| Jumlah Ahli Berdaftar | 342 | 100% |
| Ahli Aktif | 287 | 83.9% |
| Ahli Tidak Aktif | 55 | 16.1% |
| Ahli Baru (2026) | 38 | 11.1% |

---

## Taburan Mengikut Jantina

- **Lelaki**: 148 orang (43.3%)
- **Perempuan**: 194 orang (56.7%)

---

## Taburan Mengikut Umur

| Kumpulan Umur | Bilangan | Peratus |
|---------------|----------|---------|
| 18 - 25 tahun | 42 | 12.3% |
| 26 - 35 tahun | 78 | 22.8% |
| 36 - 45 tahun | 89 | 26.0% |
| 46 - 55 tahun | 72 | 21.1% |
| 56 tahun ke atas | 61 | 17.8% |

---

## Taburan Mengikut Lokasi

| Kawasan | Bilangan | Peratus |
|---------|----------|---------|
| Hulu Klang | 98 | 28.7% |
| Gombak | 85 | 24.9% |
| Ampang | 72 | 21.1% |
| Setapak | 45 | 13.2% |
| Wangsa Maju | 28 | 8.2% |
| Lain-lain | 14 | 4.1% |

---

## Taburan Mengikut Kategori Ahli

- **Ahli Biasa**: 198 (57.9%)
- **Ahli Sukarelawan**: 87 (25.4%)
- **Ahli Penderma Tetap**: 42 (12.3%)
- **Ahli Sejahtera (BMT)**: 15 (4.4%)

---

## Statistik Menarik

- Purata tempoh keahlian: **2.3 tahun**
- Kadar pengekalan ahli: **89.2%**
- Ahli dengan sumbangan aktif: **67%**`,
  },
]

const initialMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'ai',
    content:
      'Assalamualaikum! Saya pembantu AI PUSPA. Bagaimana saya boleh membantu anda hari ini?',
    timestamp: new Date(Date.now() - 120000),
  },
  {
    id: '2',
    role: 'user',
    content: 'Berapakah jumlah ahli asnaf yang aktif?',
    timestamp: new Date(Date.now() - 60000),
  },
  {
    id: '3',
    role: 'ai',
    content:
      'Berdasarkan data semasa, terdapat **127 ahli asnaf aktif** yang berdaftar dalam sistem PUSPA. Daripada jumlah tersebut, 45 adalah dari kawasan Hulu Klang, 38 dari Gombak, dan 44 dari Ampang dan kawasan sekitarnya.',
    timestamp: new Date(Date.now() - 30000),
  },
]

const quickQuestions = [
  'Berapakah jumlah ahli aktif?',
  'Senaraikan program yang aktif',
  'Berapakah jumlah donasi bulan ini?',
  'Siapakah penerima bantuan terbesar?',
]

const aiResponses: Record<string, string> = {
  'Berapakah jumlah ahli aktif?':
    'Berdasarkan rekod terkini, PUSPA mempunyai **287 ahli aktif** daripada jumlah 342 ahli berdaftar. Ini mewakili kadar penglibatan sebanyak **83.9%**. Penambahan 12 ahli baru dicatatkan pada bulan ini, dengan majoriti dari kawasan Hulu Klang dan Gombak.',
  'Senaraikan program yang aktif':
    'Pada masa ini, PUSPA mempunyai **5 program aktif**:\n\n1. **AsnafCare** — Bantuan makanan bulanan untuk 89 keluarga\n2. **Pusat Sunnah Preschool** — 24 pelajar prasekolah\n3. **Kelas Tilawah Dewasa** — 67 peserta aktif\n4. **Mentoring Belia PUSPA** — 34 belia dan 12 mentor\n5. **Klinik Kesihatan Komuniti** — Rakan strategik dengan Klinik Nurain',
  'Berapakah jumlah donasi bulan ini?':
    'Jumlah donasi yang dikutip pada bulan ini ialah **RM 45,230**. Taburan:\n\n- Donasi individu: RM 28,500 (63.0%)\n- Derma korporat: RM 12,100 (26.7%)\n- Derma online: RM 3,400 (7.5%)\n- Lain-lain: RM 1,230 (2.7%)\n\nTerima kasih kepada **89 penderma** yang menyumbang bulan ini. 🎉',
  'Siapakah penerima bantuan terbesar?':
    'Penerima bantuan terbesar bagi suku tahun ini ialah **Program AsnafCare** dengan jumlah peruntukan sebanyak **RM 52,800**. Program ini memberikan bantuan makanan bulanan kepada **89 keluarga asnaf** di tiga kawasan utama. Purata bantuan per keluarga ialah **RM 593 sebulan**.',
}

const initialCommLogs: CommLog[] = [
  {
    id: '1',
    name: 'Puan Siti Aminah',
    type: 'Lawatan',
    notes: 'Lawatan rumah ke rumah pesakit di Hulu Klang. Keperluan segera: bekalan makanan.',
    date: '2026-04-20',
  },
  {
    id: '2',
    name: 'Encik Ahmad bin Hassan',
    type: 'Panggilan',
    notes: 'Telah dihubungi berkenaan status permohonan BMT. Akan diikuti dengan lawatan minggu depan.',
    date: '2026-04-19',
  },
  {
    id: '3',
    name: 'Puan Nurul Izzah',
    type: 'Email',
    notes: 'Pengesahan penerimaan bantuan pendidikan untuk 3 orang anak. Dokumen lengkap.',
    date: '2026-04-18',
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatMarkdown(text: string) {
  // Very simple markdown renderer for display
  return text
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-4 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-4 mb-2">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal">$2</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
    .replace(/^---$/gm, '<hr class="my-4 border-muted" />')
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AIToolsPage() {
  // ── State ──
  const [activeTab, setActiveTab] = useState('laporan')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedReport, setGeneratedReport] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [customResponse, setCustomResponse] = useState('')
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false)
  const [copied, setCopied] = useState(false)

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [chatInput, setChatInput] = useState('')
  const [isChatSending, setIsChatSending] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Member tools state
  const [icInput, setIcInput] = useState('')
  const [icResult, setIcResult] = useState<null | { eligible: boolean; programmes: { name: string; score: number; status: string }[] }>(null)
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false)

  const [calcHouseholdSize, setCalcHouseholdSize] = useState('4')
  const [calcIncome, setCalcIncome] = useState('1500')
  const [calcExpenses, setCalcExpenses] = useState('1200')
  const [calcResult, setCalcResult] = useState<null | { amount: number; breakdown: Record<string, number> }>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const [welfareSliders, setWelfareSliders] = useState({
    pendapatan: 3,
    perumahan: 4,
    kesihatan: 3,
    pendidikan: 4,
    sokonganSosial: 5,
  })
  const [welfareResult, setWelfareResult] = useState<null | { score: number; recommendation: string }>(null)
  const [isAssessing, setIsAssessing] = useState(false)

  const [commName, setCommName] = useState('')
  const [commType, setCommType] = useState('')
  const [commNotes, setCommNotes] = useState('')
  const [commLogs, setCommLogs] = useState<CommLog[]>(initialCommLogs)

  // ── Effects ──
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Handlers ──

  const handleGenerateReport = useCallback(
    (report: ReportType) => {
      setSelectedReport(report)
      setGeneratedReport('')
      setIsGenerating(true)
      setDialogOpen(true)
      setCopied(false)

      setTimeout(() => {
        setIsGenerating(false)
        setGeneratedReport(report.report)
      }, 2500)
    },
    []
  )

  const handleCopyReport = useCallback(async () => {
    if (!generatedReport) return
    await navigator.clipboard.writeText(generatedReport)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [generatedReport])

  const handleDownloadReport = useCallback(() => {
    if (!generatedReport || !selectedReport) return
    const blob = new Blob([generatedReport], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedReport.id}-laporan-puspa.md`
    a.click()
    URL.revokeObjectURL(url)
  }, [generatedReport, selectedReport])

  const handleCustomGenerate = useCallback(() => {
    if (!customPrompt.trim()) return
    setIsGeneratingCustom(true)
    setCustomResponse('')

    setTimeout(() => {
      setIsGeneratingCustom(false)
      setCustomResponse(
        `## Hasil Analisis AI\n\nBerdasarkan pertanyaan anda: _"${customPrompt}"_\n\n\n### Ringkasan\n\nBerdasarkan data yang terdapat dalam sistem PUSPA, berikut adalah maklumat yang relevan:\n\n- **Jumlah rekod berkaitan**: 47 entri ditemui\n- **Tempoh liputan**: Januari - April 2026\n- **Sumber data**: Sistem Pengurusan Ahli, Modul Kewangan, Modul Program\n\n### Butiran\n\nAnalisis menunjukkan trend positif dalam operasi PUSPA bagi suku tahun pertama 2026. Jumlah ahli aktif mencatatkan peningkatan sebanyak **12.3%** berbanding tempoh yang sama tahun lepas.\n\n### Cadangan\n\n1. Menjalankan audit dalaman untuk data yang lebih tepat\n2. Mengemaskini profil ahli secara berkala\n3. Mempertingkatkan pengumpulan data untuk analisis masa hadapan\n\n> _*Laporan ini dijana oleh AI dan perlu disahkan oleh pentadbir._*`
      )
    }, 3000)
  }, [customPrompt])

  const handleSendChat = useCallback(
    (text?: string) => {
      const messageText = text || chatInput.trim()
      if (!messageText) return

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: messageText,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMsg])
      setChatInput('')
      setIsChatSending(true)

      setTimeout(() => {
        const matchedResponse = aiResponses[messageText]
        const aiMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          role: 'ai',
          content:
            matchedResponse ||
            `Terima kasih atas soalan anda. Saya akan menganalisis data yang berkaitan dan kembali kepada anda dengan maklumat yang terperinci. Sila hubungi pentadbir PUSPA jika anda memerlukan maklumat segera.\n\n_Soalan anda: "${messageText}"_ telah direkodkan dalam sistem.`,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiMsg])
        setIsChatSending(false)
      }, 1500)
    },
    [chatInput]
  )

  const handleQuickQuestion = useCallback(
    (q: string) => {
      handleSendChat(q)
    },
    [handleSendChat]
  )

  const handleMicToggle = useCallback(() => {
    setIsListening((prev) => {
      if (!prev) {
        // Mock: start listening
        setTimeout(() => {
          setIsListening(false)
          setChatInput('Berapakah jumlah program yang aktif?')
        }, 2000)
      }
      return !prev
    })
  }, [])

  // ── Eligibility Check ──
  const handleCheckEligibility = useCallback(() => {
    if (!icInput.trim()) return
    setIsCheckingEligibility(true)
    setIcResult(null)

    setTimeout(() => {
      setIsCheckingEligibility(false)
      setIcResult({
        eligible: true,
        programmes: [
          { name: 'AsnafCare - Bantuan Makanan', score: 92, status: 'Layak' },
          { name: 'BMT Kewangan Bulanan', score: 88, status: 'Layak' },
          { name: 'Bantuan Pendidikan Anak', score: 75, status: 'Layak' },
          { name: 'Program Mentoring Belia', score: 60, status: 'Perlu Semakan' },
          { name: 'Tabung Kesihatan Komuniti', score: 45, status: 'Tidak Layak' },
        ],
      })
    }, 2000)
  }, [icInput])

  // ── Financial Calculator ──
  const handleCalculate = useCallback(() => {
    setIsCalculating(true)
    setCalcResult(null)

    const household = parseInt(calcHouseholdSize) || 4
    const income = parseFloat(calcIncome) || 0
    const expenses = parseFloat(calcExpenses) || 0
    const deficit = Math.max(0, expenses - income)
    const bmt = Math.min(deficit * 0.7, household * 400)
    const foodAllowance = Math.min(bmt * 0.45, household * 200)
    const educationAllowance = Math.min(bmt * 0.25, household * 120)
    const healthAllowance = Math.min(bmt * 0.20, household * 80)
    const otherAllowance = bmt - foodAllowance - educationAllowance - healthAllowance

    setTimeout(() => {
      setIsCalculating(false)
      setCalcResult({
        amount: Math.round(bmt),
        breakdown: {
          'Wang Saku Makanan': Math.round(foodAllowance),
          'Bantuan Pendidikan': Math.round(educationAllowance),
          'Tambahan Kesihatan': Math.round(healthAllowance),
          'Lain-lain Keperluan': Math.round(otherAllowance),
        },
      })
    }, 2000)
  }, [calcHouseholdSize, calcIncome, calcExpenses])

  // ── Welfare Assessment ──
  const handleAssessWelfare = useCallback(() => {
    setIsAssessing(true)
    setWelfareResult(null)

    const { pendapatan, perumahan, kesihatan, pendidikan, sokonganSosial } =
      welfareSliders
    const avg =
      (pendapatan + perumahan + kesihatan + pendidikan + sokonganSosial) / 5
    const score = Math.round(avg * 20)

    let recommendation = ''
    if (score >= 80) {
      recommendation =
        'Ahli ini berada dalam tahap kebajikan yang **sangat baik**. Tiada bantuan segera diperlukan. Cadangan: sertakan sebagai sukarelawan atau mentor.'
    } else if (score >= 60) {
      recommendation =
        'Tahap kebajikan adalah **sederhana**. Bantuan pencegahan dan pemantauan berkala dicadangkan. Sertakan dalam program pemerkasaan.'
    } else if (score >= 40) {
      recommendation =
        'Ahli ini **memerlukan bantuan sederhana**. Cadangkan penyertaan dalam program BMT dan pemantauan bulanan oleh pegawai kebajikan.'
    } else {
      recommendation =
        'Ahli ini **memerlukan bantuan segera dan prioriti tinggi**. Segera rujuk kepada Unit Kebajikan untuk tindakan lanjut dan bantuan kecemasan.'
    }

    setTimeout(() => {
      setIsAssessing(false)
      setWelfareResult({ score, recommendation })
    }, 2000)
  }, [welfareSliders])

  // ── Communication Log ──
  const handleAddCommLog = useCallback(() => {
    if (!commName.trim() || !commType || !commNotes.trim()) return
    const newLog: CommLog = {
      id: `cl-${Date.now()}`,
      name: commName,
      type: commType,
      notes: commNotes,
      date: new Date().toISOString().split('T')[0],
    }
    setCommLogs((prev) => [newLog, ...prev])
    setCommName('')
    setCommType('')
    setCommNotes('')
  }, [commName, commType, commNotes])

  // ── Render ──
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-200">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                AI Tools PUSPA
              </h1>
              <p className="text-sm text-slate-500">
                Alat pintar untuk pengurusan NGO yang lebih cekap
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          {/* Sub-navigation Tabs */}
          <TabsList className="w-full grid grid-cols-3 mb-6 h-auto p-1 bg-slate-100 rounded-xl">
            <TabsTrigger
              value="laporan"
              className="py-3 text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-violet-700 transition-all"
            >
              <FileText className="h-4 w-4 mr-2 hidden sm:inline-block" />
              Laporan AI
            </TabsTrigger>
            <TabsTrigger
              value="sembang"
              className="py-3 text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-violet-700 transition-all"
            >
              <MessageSquare className="h-4 w-4 mr-2 hidden sm:inline-block" />
              Sembang AI
            </TabsTrigger>
            <TabsTrigger
              value="alat"
              className="py-3 text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-violet-700 transition-all"
            >
              <Search className="h-4 w-4 mr-2 hidden sm:inline-block" />
              Alat Ahli
            </TabsTrigger>
          </TabsList>

          {/* ════════════════════════════════════════════════════════════════════ */}
          {/* TAB 1: LAPORAN AI                                                   */}
          {/* ════════════════════════════════════════════════════════════════════ */}
          <TabsContent value="laporan" className="space-y-8">
            {/* Report Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reportTypes.map((report) => (
                <Card
                  key={report.id}
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-white overflow-hidden"
                  onClick={() => handleGenerateReport(report)}
                >
                  <div
                    className={`h-2 bg-gradient-to-r ${report.color} opacity-80 group-hover:opacity-100 transition-opacity`}
                  />
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div
                        className={`p-3 rounded-xl bg-gradient-to-br ${report.color} text-white shadow-lg`}
                      >
                        {report.icon}
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-emerald-50 text-emerald-700 border-0"
                      >
                        Sedia Ada
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-3 text-slate-900">
                      {report.title}
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                      {report.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      variant="outline"
                      className="w-full border-violet-200 text-violet-700 hover:bg-violet-50 hover:border-violet-300 group-hover:bg-violet-50 transition-colors"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Jana Laporan
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Custom Prompt Section */}
            <Card className="border-0 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-violet-600" />
                  Prompt Tersuai
                </CardTitle>
                <CardDescription>
                  Masukkan soalan atau pertanyaan anda untuk menjana laporan
                  khas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Contoh: Jana laporan perbandingan prestasi program Q1 2025 vs Q1 2026..."
                  className="min-h-[100px] resize-none border-slate-200 focus:border-violet-400 focus:ring-violet-200"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    AI akan menganalisis data PUSPA berdasarkan pertanyaan anda
                  </p>
                  <Button
                    onClick={handleCustomGenerate}
                    disabled={
                      !customPrompt.trim() || isGeneratingCustom
                    }
                    className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white shadow-md shadow-purple-200"
                  >
                    {isGeneratingCustom ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Menjana...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Jana Laporan
                      </>
                    )}
                  </Button>
                </div>

                {isGeneratingCustom && (
                  <div className="flex items-center justify-center py-12 space-x-3">
                    <div className="h-3 w-3 rounded-full bg-violet-500 animate-bounce [animation-delay:0ms]" />
                    <div className="h-3 w-3 rounded-full bg-purple-500 animate-bounce [animation-delay:150ms]" />
                    <div className="h-3 w-3 rounded-full bg-fuchsia-500 animate-bounce [animation-delay:300ms]" />
                    <span className="text-sm text-slate-500 ml-2">
                      AI sedang menganalisis data...
                    </span>
                  </div>
                )}

                {customResponse && !isGeneratingCustom && (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-6">
                    <div
                      className="prose prose-sm max-w-none text-slate-700"
                      dangerouslySetInnerHTML={{
                        __html: formatMarkdown(customResponse),
                      }}
                    />
                    <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          await navigator.clipboard.writeText(customResponse)
                        }}
                        className="text-xs"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Salin
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const blob = new Blob([customResponse], {
                            type: 'text/markdown',
                          })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = 'laporan-tersuai-puspa.md'
                          a.click()
                          URL.revokeObjectURL(url)
                        }}
                        className="text-xs"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Muat Turun
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ════════════════════════════════════════════════════════════════════ */}
          {/* TAB 2: SEMBANG AI                                                   */}
          {/* ════════════════════════════════════════════════════════════════════ */}
          <TabsContent value="sembang">
            <Card className="border-0 bg-white shadow-sm overflow-hidden flex flex-col">
              <CardHeader className="border-b bg-gradient-to-r from-violet-600 to-purple-700 text-white rounded-t-xl">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white">
                      Pembantu AI PUSPA
                    </CardTitle>
                    <CardDescription className="text-violet-200">
                      Sedia membantu anda 24/7
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              {/* Quick Questions */}
              <div className="px-4 pt-4 pb-2 border-b">
                <p className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                  Soalan Pantas
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((q, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="text-xs border-violet-200 text-violet-700 hover:bg-violet-50 hover:border-violet-300"
                      onClick={() => handleQuickQuestion(q)}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 min-h-0">
                <ScrollArea className="h-[420px] sm:h-[480px]">
                  <div className="p-4 space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${
                          msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        <Avatar
                          className={`h-8 w-8 shrink-0 ${
                            msg.role === 'user'
                              ? 'bg-violet-100'
                              : 'bg-gradient-to-br from-violet-600 to-purple-700'
                          }`}
                        >
                          <AvatarFallback
                            className={
                              msg.role === 'user'
                                ? 'text-violet-700 text-xs'
                                : 'text-white text-xs'
                            }
                          >
                            {msg.role === 'user' ? (
                              <User className="h-4 w-4" />
                            ) : (
                              <Sparkles className="h-4 w-4" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`max-w-[75%] sm:max-w-[65%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-br from-violet-600 to-purple-700 text-white rounded-tr-sm'
                              : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                          }`}
                        >
                          <div
                            dangerouslySetInnerHTML={{
                              __html: formatMarkdown(msg.content),
                            }}
                          />
                          <p
                            className={`text-[10px] mt-2 ${
                              msg.role === 'user'
                                ? 'text-violet-200'
                                : 'text-slate-400'
                            }`}
                          >
                            {msg.timestamp.toLocaleTimeString('ms-MY', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    ))}

                    {isChatSending && (
                      <div className="flex gap-3">
                        <Avatar className="h-8 w-8 shrink-0 bg-gradient-to-br from-violet-600 to-purple-700">
                          <AvatarFallback className="text-white text-xs">
                            <Sparkles className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3">
                          <div className="flex gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-violet-400 animate-bounce [animation-delay:0ms]" />
                            <div className="h-2 w-2 rounded-full bg-violet-400 animate-bounce [animation-delay:150ms]" />
                            <div className="h-2 w-2 rounded-full bg-violet-400 animate-bounce [animation-delay:300ms]" />
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={chatEndRef} />
                  </div>
                </ScrollArea>
              </div>

              {/* Chat Input */}
              <div className="border-t p-4 bg-slate-50/50">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`shrink-0 rounded-full ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'text-slate-400 hover:text-violet-600 hover:bg-violet-50'}`}
                    onClick={handleMicToggle}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Taip mesej anda di sini..."
                    className="flex-1 rounded-full border-slate-200 focus:border-violet-400 focus:ring-violet-200"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendChat()
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    className="shrink-0 rounded-full bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white shadow-md shadow-purple-200"
                    onClick={() => handleSendChat()}
                    disabled={!chatInput.trim() || isChatSending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                {isListening && (
                  <p className="text-xs text-red-500 text-center mt-2 animate-pulse">
                    🎤 Mendengar... sila bercakap sekarang
                  </p>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* ════════════════════════════════════════════════════════════════════ */}
          {/* TAB 3: ALAT AHLI                                                    */}
          {/* ════════════════════════════════════════════════════════════════════ */}
          <TabsContent value="alat">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* ── Tool 1: Semakan Kelayakan Program ── */}
              <Card className="border-0 bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-cyan-200">
                      <Search className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        Semakan Kelayakan Program
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Semak kelayakan ahli untuk program PUSPA
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-700">
                      No. Kad Pengenalan Ahli
                    </Label>
                    <Input
                      placeholder="Contoh: 850101-14-5123"
                      className="mt-1.5 border-slate-200 focus:border-cyan-400 focus:ring-cyan-200"
                      value={icInput}
                      onChange={(e) => setIcInput(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleCheckEligibility}
                    disabled={!icInput.trim() || isCheckingEligibility}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-md shadow-cyan-200"
                  >
                    {isCheckingEligibility ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Menyemak...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Semak Kelayakan
                      </>
                    )}
                  </Button>

                  {icResult && (
                    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`${
                            icResult.eligible
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {icResult.eligible ? '✓ Layak' : '✗ Tidak Layak'}
                        </Badge>
                        <span className="text-sm text-slate-500">
                          Program yang tersedia
                        </span>
                      </div>
                      <div className="space-y-2">
                        {icResult.programmes.map((p, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-100"
                          >
                            <div className="flex-1 min-w-0 mr-3">
                              <p className="text-sm font-medium text-slate-800 truncate">
                                {p.name}
                              </p>
                              <div className="mt-1 flex items-center gap-2">
                                <div className="flex-1 h-1.5 rounded-full bg-slate-100 max-w-[100px]">
                                  <div
                                    className={`h-full rounded-full ${
                                      p.score >= 70
                                        ? 'bg-emerald-500'
                                        : p.score >= 50
                                        ? 'bg-amber-500'
                                        : 'bg-red-400'
                                    }`}
                                    style={{ width: `${p.score}%` }}
                                  />
                                </div>
                                <span className="text-xs text-slate-500">
                                  {p.score}%
                                </span>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={`text-[10px] shrink-0 ${
                                p.status === 'Layak'
                                  ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                                  : p.status === 'Perlu Semakan'
                                  ? 'border-amber-300 text-amber-700 bg-amber-50'
                                  : 'border-red-300 text-red-700 bg-red-50'
                              }`}
                            >
                              {p.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ── Tool 2: Kalkulator Bantuan Kewangan ── */}
              <Card className="border-0 bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-200">
                      <Calculator className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        Kalkulator Bantuan Kewangan
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Kira jumlah BMT yang layak diterima
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-slate-700">
                        Bilangan Isi Rumah
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        max="15"
                        className="mt-1.5 border-slate-200 focus:border-amber-400 focus:ring-amber-200"
                        value={calcHouseholdSize}
                        onChange={(e) =>
                          setCalcHouseholdSize(e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-700">
                        Pendapatan Bulanan (RM)
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        className="mt-1.5 border-slate-200 focus:border-amber-400 focus:ring-amber-200"
                        value={calcIncome}
                        onChange={(e) =>
                          setCalcIncome(e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-700">
                        Perbelanjaan Bulanan (RM)
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        className="mt-1.5 border-slate-200 focus:border-amber-400 focus:ring-amber-200"
                        value={calcExpenses}
                        onChange={(e) =>
                          setCalcExpenses(e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleCalculate}
                    disabled={isCalculating}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md shadow-orange-200"
                  >
                    {isCalculating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Mengira...
                      </>
                    ) : (
                      <>
                        <Calculator className="h-4 w-4 mr-2" />
                        Kira Bantuan
                      </>
                    )}
                  </Button>

                  {calcResult && (
                    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="text-center py-2">
                        <p className="text-sm text-slate-500 mb-1">
                          Jumlah BMT Yang Layak
                        </p>
                        <p className="text-3xl font-bold text-amber-600">
                          RM {calcResult.amount.toLocaleString('ms-MY')}
                        </p>
                        <p className="text-xs text-slate-400">sebulan</p>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-700">
                          Kategori Bantuan:
                        </p>
                        {Object.entries(calcResult.breakdown).map(
                          ([key, val]) => (
                            <div
                              key={key}
                              className="flex justify-between items-center text-sm"
                            >
                              <span className="text-slate-600">{key}</span>
                              <span className="font-medium text-slate-800">
                                RM {val.toLocaleString('ms-MY')}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ── Tool 3: Penilaian Kebajikan ── */}
              <Card className="border-0 bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-200">
                      <ClipboardList className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        Penilaian Kebajikan
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Nilai tahap kebajikan ahli dalam 5 dimensi
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-4">
                    {[
                      {
                        key: 'pendapatan' as const,
                        label: 'Pendapatan',
                        desc: '1 = Sangat Rendah, 10 = Sangat Tinggi',
                      },
                      {
                        key: 'perumahan' as const,
                        label: 'Perumahan',
                        desc: '1 = Tidak Memuaskan, 10 = Sangat Baik',
                      },
                      {
                        key: 'kesihatan' as const,
                        label: 'Kesihatan',
                        desc: '1 = Sangat Lemah, 10 = Sangat Sihat',
                      },
                      {
                        key: 'pendidikan' as const,
                        label: 'Pendidikan',
                        desc: '1 = Tiada Akses, 10 = Akses Penuh',
                      },
                      {
                        key: 'sokonganSosial' as const,
                        label: 'Sokongan Sosial',
                        desc: '1 = Tiada, 10 = Sangat Kuat',
                      },
                    ].map((item) => (
                      <div key={item.key} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium text-slate-700">
                            {item.label}
                          </Label>
                          <span className="text-sm font-bold text-violet-600">
                            {welfareSliders[item.key]}/10
                          </span>
                        </div>
                        <Slider
                          min={1}
                          max={10}
                          step={1}
                          value={[welfareSliders[item.key]]}
                          onValueChange={(val) =>
                            setWelfareSliders((prev) => ({
                              ...prev,
                              [item.key]: val[0],
                            }))
                          }
                          className="[&_[role=slider]]:bg-violet-600 [&_[role=slider]]:border-violet-600 [&>span:first-child]:bg-slate-200"
                        />
                        <p className="text-[10px] text-slate-400">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={handleAssessWelfare}
                    disabled={isAssessing}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-teal-200"
                  >
                    {isAssessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Menilai...
                      </>
                    ) : (
                      <>
                        <ClipboardList className="h-4 w-4 mr-2" />
                        Jalankan Penilaian
                      </>
                    )}
                  </Button>

                  {welfareResult && (
                    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="text-center py-2">
                        <p className="text-sm text-slate-500 mb-1">
                          Skor Kebajikan Keseluruhan
                        </p>
                        <p
                          className={`text-4xl font-bold ${
                            welfareResult.score >= 80
                              ? 'text-emerald-600'
                              : welfareResult.score >= 60
                              ? 'text-amber-600'
                              : welfareResult.score >= 40
                              ? 'text-orange-600'
                              : 'text-red-600'
                          }`}
                        >
                          {welfareResult.score}/100
                        </p>
                        <div className="mt-2 mx-auto w-48 h-3 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              welfareResult.score >= 80
                                ? 'bg-emerald-500'
                                : welfareResult.score >= 60
                                ? 'bg-amber-500'
                                : welfareResult.score >= 40
                                ? 'bg-orange-500'
                                : 'bg-red-500'
                            }`}
                            style={{
                              width: `${welfareResult.score}%`,
                            }}
                          />
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium text-slate-700 mb-1">
                          Cadangan:
                        </p>
                        <div
                          className="text-sm text-slate-600 leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: formatMarkdown(
                              welfareResult.recommendation
                            ),
                          }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ── Tool 4: Log Komunikasi ── */}
              <Card className="border-0 bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-pink-200">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        Log Komunikasi
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Rekod semua komunikasi dengan ahli
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-slate-700">
                        Nama Ahli
                      </Label>
                      <Input
                        placeholder="Masukkan nama ahli"
                        className="mt-1.5 border-slate-200 focus:border-rose-400 focus:ring-rose-200"
                        value={commName}
                        onChange={(e) => setCommName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-700">
                        Jenis Komunikasi
                      </Label>
                      <Select
                        value={commType}
                        onValueChange={setCommType}
                      >
                        <SelectTrigger className="mt-1.5 border-slate-200 focus:border-rose-400 focus:ring-rose-200">
                          <SelectValue placeholder="Pilih jenis" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Panggilan">
                            📞 Panggilan
                          </SelectItem>
                          <SelectItem value="Lawatan">
                            🏠 Lawatan
                          </SelectItem>
                          <SelectItem value="Email">
                            📧 Email
                          </SelectItem>
                          <SelectItem value="WhatsApp">
                            💬 WhatsApp
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-700">
                        Catatan
                      </Label>
                      <Textarea
                        placeholder="Masukkan catatan komunikasi..."
                        className="mt-1.5 min-h-[80px] resize-none border-slate-200 focus:border-rose-400 focus:ring-rose-200"
                        value={commNotes}
                        onChange={(e) => setCommNotes(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={handleAddCommLog}
                      disabled={
                        !commName.trim() || !commType || !commNotes.trim()
                      }
                      className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-md shadow-pink-200"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Tambah Rekod
                    </Button>
                  </div>

                  <Separator />

                  {/* Recent Logs */}
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-700 mb-2">
                      Rekod Terkini
                    </p>
                    <ScrollArea className="h-[220px]">
                      <div className="space-y-2 pr-2">
                        {commLogs.map((log) => (
                          <div
                            key={log.id}
                            className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-1">
                              <p className="text-sm font-medium text-slate-800">
                                {log.name}
                              </p>
                              <Badge
                                variant="outline"
                                className="text-[10px] shrink-0 ml-2"
                              >
                                {log.type}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2">
                              {log.notes}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              {log.date}
                            </p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* Report Generation Dialog                                              */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-600" />
              {selectedReport?.title}
            </DialogTitle>
            <DialogDescription>
              Laporan dijana secara automatik berdasarkan data terkini
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-4 border-violet-200 animate-ping absolute inset-0 opacity-30" />
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
                    <Sparkles className="h-7 w-7 text-white animate-spin" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-lg font-semibold text-slate-700">
                    AI sedang menjana laporan...
                  </p>
                  <p className="text-sm text-slate-400">
                    Menganalisis data PUSPA dan menyusun maklumat
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <div
                    className="h-2 w-2 rounded-full bg-violet-500 animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <div
                    className="h-2 w-2 rounded-full bg-purple-500 animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <div
                    className="h-2 w-2 rounded-full bg-fuchsia-500 animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            ) : generatedReport ? (
              <ScrollArea className="h-[55vh]">
                <div
                  className="prose prose-sm max-w-none text-slate-700 pr-4"
                  dangerouslySetInnerHTML={{
                    __html: formatMarkdown(generatedReport),
                  }}
                />
              </ScrollArea>
            ) : null}
          </div>

          {!isGenerating && generatedReport && (
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleCopyReport}
                className="flex-1"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Disalin!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Salin Laporan
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadReport}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Muat Turun (.md)
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
