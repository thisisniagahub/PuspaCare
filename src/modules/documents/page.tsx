'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  FolderOpen,
  FileText,
  Shield,
  Building,
  FileCheck,
  Construction,
  ArrowRight,
  Archive,
  File,
  Lock,
  Handshake,
} from 'lucide-react'

// ─── Document Categories ───────────────────────────────────────────────────

const documentCategories = [
  {
    title: 'Pendaftaran',
    subtitle: 'Registration',
    description:
      'Dokumen pendaftaran dan penubuhan organisasi termasuk kelulusan pihak berkuasa.',
    icon: Building,
    color: 'violet',
    documents: ['Sijil ROS', 'Perlembagaan', 'SSM'],
    count: 3,
  },
  {
    title: 'Tadbir Urus',
    subtitle: 'Governance',
    description:
      'Dokumen tadbir urus dan pengurusan mesyuarat badan pentadbiran dan Jawatankuasa.',
    icon: FileCheck,
    color: 'purple',
    documents: ['Minit AGM', 'Resolusi', 'Polisi'],
    count: 3,
  },
  {
    title: 'Kewangan',
    subtitle: 'Financial',
    description:
      'Laporan dan penyata kewangan yang disahkan oleh auditor dan dikemukakan kepada agensi berkaitan.',
    icon: FileText,
    color: 'fuchsia',
    documents: ['Laporan Audit', 'Penyata Kewangan'],
    count: 2,
  },
  {
    title: 'Pematuhan',
    subtitle: 'Compliance',
    description:
      'Dokumen pematuhan undang-undang dan regulasi termasuk perlindungan data dan AML/CFT.',
    icon: Shield,
    color: 'purple',
    documents: ['Kelulusan LHDN', 'Notis PDPA', 'Polisi AML'],
    count: 3,
  },
  {
    title: 'Operasi',
    subtitle: 'Operations',
    description:
      'Perjanjian, memorandum persefahaman, dan dokumen perkongsian dengan rakan strategik.',
    icon: Handshake,
    color: 'violet',
    documents: ['MOU', 'Perjanjian Rakan Kongsi'],
    count: 2,
  },
]

// ─── Color Maps ─────────────────────────────────────────────────────────────

const colorMap: Record<string, { bg: string; icon: string; badge: string; text: string; dot: string }> = {
  violet: {
    bg: 'bg-violet-50',
    icon: 'bg-violet-100 text-violet-600',
    badge: 'border-violet-200 text-violet-600 bg-violet-50',
    text: 'text-violet-600',
    dot: 'bg-violet-400',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'bg-purple-100 text-purple-600',
    badge: 'border-purple-200 text-purple-600 bg-purple-50',
    text: 'text-purple-600',
    dot: 'bg-purple-400',
  },
  fuchsia: {
    bg: 'bg-fuchsia-50',
    icon: 'bg-fuchsia-100 text-fuchsia-600',
    badge: 'border-fuchsia-200 text-fuchsia-600 bg-fuchsia-50',
    text: 'text-fuchsia-600',
    dot: 'bg-fuchsia-400',
  },
}

export default function DocumentsPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100">
              <Archive className="h-6 w-6 text-purple-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Gudang Dokumen
              </h1>
              <p className="text-sm text-gray-500">
                Pengurusan Dokumen Tadbir Urus
              </p>
            </div>
          </div>
        </header>

        {/* ── Quick Stats ────────────────────────────────────────────────── */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Jumlah Kategori
                  </p>
                  <p className="mt-1 text-xl sm:text-2xl font-bold text-gray-300">—</p>
                  <p className="mt-1 text-[11px] text-purple-500 font-medium">Akan Datang</p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50">
                  <FolderOpen className="h-5 w-5 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Jumlah Dokumen
                  </p>
                  <p className="mt-1 text-xl sm:text-2xl font-bold text-gray-300">—</p>
                  <p className="mt-1 text-[11px] text-purple-500 font-medium">Akan Datang</p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50">
                  <File className="h-5 w-5 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Sah Dituju
                  </p>
                  <p className="mt-1 text-xl sm:text-2xl font-bold text-gray-300">—</p>
                  <p className="mt-1 text-[11px] text-purple-500 font-medium">Akan Datang</p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50">
                  <FileCheck className="h-5 w-5 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Akses Terhad
                  </p>
                  <p className="mt-1 text-xl sm:text-2xl font-bold text-gray-300">—</p>
                  <p className="mt-1 text-[11px] text-purple-500 font-medium">Akan Datang</p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50">
                  <Lock className="h-5 w-5 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Document Categories ────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-5">
            <FolderOpen className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Kategori Dokumen</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documentCategories.map((category) => {
              const colors = colorMap[category.color]
              return (
                <Card
                  key={category.title}
                  className={`border border-dashed shadow-none transition-all duration-200 hover:bg-opacity-60 ${colors.bg}`}
                >
                  <CardHeader className="pb-3 pt-5 px-5">
                    <div className="flex items-start justify-between">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${colors.icon}`}
                      >
                        <category.icon className="h-4.5 w-4.5" />
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold px-2 py-0.5 ${colors.badge}`}
                      >
                        {category.count} dokumen
                      </Badge>
                    </div>
                    <CardTitle className="text-sm font-semibold text-gray-800 pt-3">
                      {category.title}
                    </CardTitle>
                    <CardDescription className="text-[11px] text-gray-400 font-medium">
                      {category.subtitle}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    <p className="text-xs leading-relaxed text-gray-500 mb-3">
                      {category.description}
                    </p>
                    <div className="space-y-1.5">
                      {category.documents.map((doc) => (
                        <div key={doc} className="flex items-center gap-2">
                          <span
                            className={`inline-block h-1.5 w-1.5 rounded-full ${colors.dot}`}
                          />
                          <span className="text-xs text-gray-600">{doc}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-xs font-medium text-gray-400">
                      <Badge
                        variant="outline"
                        className="border-gray-200 text-gray-400 text-[10px] px-2 py-0 font-medium"
                      >
                        Akan Datang
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* ── Development Notice ─────────────────────────────────────────── */}
        <Card className="border border-dashed border-purple-200 bg-purple-50/40 shadow-none">
          <CardContent className="py-5 px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-100">
                <Construction className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-purple-800">
                  Modul ini sedang dalam pembangunan
                </p>
                <p className="mt-0.5 text-xs text-purple-600/70">
                  Gudang dokumen sedang dalam pembangunan. Dokumen akan dikategorikan mengikut jenis
                  dan tahap akses kawalan apabila modul ini dilancarkan.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
