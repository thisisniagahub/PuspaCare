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
  UserCheck,
  MapPin,
  Clock,
  Award,
  Users,
  Construction,
  Rocket,
  ArrowRight,
} from 'lucide-react'

// ─── Roadmap Features ──────────────────────────────────────────────────────

const roadmapFeatures = [
  {
    title: 'Daftar Sukarelawan',
    subtitle: 'Registry',
    description:
      'Pendaftaran dan pengurusan profil sukarelawan dengan maklumat lengkap termasuk kemahiran, kebolehsediaan, dan sejarah khidmat.',
    icon: UserCheck,
    phase: 'Fasa 1',
  },
  {
    title: 'Penjejakan Penempatan',
    subtitle: 'Deployment Tracking',
    description:
      'Sistem penjejakan penempatan sukarelawan mengikut program, lokasi, dan masa secara masa nyata.',
    icon: MapPin,
    phase: 'Fasa 1',
  },
  {
    title: 'Log Jam Khidmat',
    subtitle: 'Hours Log',
    description:
      'Rekod dan pengesahan jam khidmat sukarelawan dengan kelulusan penyelia dan laporan bulanan.',
    icon: Clock,
    phase: 'Fasa 2',
  },
  {
    title: 'Papan Pemuka Sukarelawan',
    subtitle: 'Dashboard',
    description:
      'Papan pemuka komprehensif dengan statistik, carta, dan analitik penglibatan sukarelawan.',
    icon: Users,
    phase: 'Fasa 2',
  },
  {
    title: 'Penjanaan Sijil',
    subtitle: 'Certificate Generation',
    description:
      'Penjanaan sijil penghargaan sukarelawan secara automatik dengan templat boleh ubah dan penjanaan PDF.',
    icon: Award,
    phase: 'Fasa 3',
  },
]

// ─── Placeholder Stats ──────────────────────────────────────────────────────

const placeholderStats = [
  { label: 'Jumlah Sukarelawan', value: '—', icon: Users },
  { label: 'Aktif Bulan Ini', value: '—', icon: UserCheck },
  { label: 'Jam Khidmat', value: '—', icon: Clock },
  { label: 'Sijil Dijana', value: '—', icon: Award },
]

export default function VolunteersPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100">
              <Users className="h-6 w-6 text-purple-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Pengurusan Sukarelawan
              </h1>
              <p className="text-sm text-gray-500">
                Sistem Pengurusan Sukarelawan (VMS)
              </p>
            </div>
          </div>
        </header>

        {/* ── Placeholder Stats ──────────────────────────────────────────── */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {placeholderStats.map((stat) => (
            <Card key={stat.label} className="border-0 shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-xl sm:text-2xl font-bold text-gray-300">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-[11px] text-purple-500 font-medium">Akan Datang</p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50">
                    <stat.icon className="h-5 w-5 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Roadmap Features ───────────────────────────────────────────── */}
        <Card className="mb-8 border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg font-semibold text-gray-900">
                Peta Jalan Pembangunan
              </CardTitle>
            </div>
            <CardDescription className="text-sm text-gray-500">
              Ciri-ciri yang dirancang untuk sistem pengurusan sukarelawan PUSPA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {roadmapFeatures.map((feature) => (
                <Card
                  key={feature.title}
                  className="border border-dashed border-purple-200 bg-purple-50/30 shadow-none transition-all duration-200 hover:border-purple-300 hover:bg-purple-50/50"
                >
                  <CardHeader className="pb-3 pt-5 px-5">
                    <div className="flex items-start justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100">
                        <feature.icon className="h-4.5 w-4.5 text-purple-600" />
                      </div>
                      <Badge
                        variant="outline"
                        className="border-purple-200 bg-white text-purple-600 text-[10px] font-semibold px-2 py-0.5"
                      >
                        {feature.phase}
                      </Badge>
                    </div>
                    <CardTitle className="text-sm font-semibold text-gray-800 pt-3">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-[11px] text-gray-400 font-medium">
                      {feature.subtitle}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    <p className="text-xs leading-relaxed text-gray-500">
                      {feature.description}
                    </p>
                    <div className="mt-3 flex items-center gap-1 text-xs font-medium text-purple-500">
                      <span>Dalam Pembangunan</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

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
                  Ciri-ciri di atas sedang dalam fasa reka bentuk dan pembangunan. Sila semak semula
                  untuk kemas kini terkini.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
