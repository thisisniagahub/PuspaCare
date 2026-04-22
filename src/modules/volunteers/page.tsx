'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Users,
  UserCheck,
  Clock,
  Award,
  Plus,
  Search,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Filter,
  Loader2,
  HeartHandshake,
  MapPin,
  FileBadge,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import { api } from '@/lib/api'
import { toast } from 'sonner'

// ─── Types ──────────────────────────────────────────────────────────────────

interface Volunteer {
  id: string
  volunteerNumber: string
  name: string
  ic: string
  phone: string
  email: string | null
  address: string | null
  city: string | null
  state: string | null
  occupation: string | null
  skills: string | null
  availability: string | null
  emergencyContact: string | null
  emergencyPhone: string | null
  status: string
  joinedAt: string
  totalHours: number
  createdAt: string
  _count: { deployments: number; hourLogs: number; certificates: number }
}

interface HourLog {
  id: string
  volunteerId: string
  date: string
  hours: number
  activity: string | null
  status: string
  approvedBy: string | null
  approvedAt: string | null
  createdAt: string
  volunteer: { id: string; name: string; volunteerNumber: string }
}

interface Deployment {
  id: string
  volunteerId: string
  programmeId: string | null
  role: string
  status: string
  startDate: string
  endDate: string | null
  location: string | null
  notes: string | null
  createdAt: string
  volunteer: { id: string; name: string; volunteerNumber: string }
  programme: { id: string; name: string } | null
}

interface Certificate {
  id: string
  volunteerId: string
  certificateNumber: string
  title: string
  description: string | null
  issuedAt: string
  totalHours: number
  issuedBy: string | null
  createdAt: string
  volunteer: { id: string; name: string; volunteerNumber: string }
}

interface Stats {
  totalVolunteers: number
  activeThisMonth: number
  totalHours: number
  totalCertificates: number
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ms-MY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function parseSkills(skills: string | null): string[] {
  if (!skills) return []
  try {
    return JSON.parse(skills)
  } catch {
    return []
  }
}

function statusColor(status: string): string {
  switch (status) {
    case 'active':
    case 'confirmed':
    case 'completed':
    case 'approved':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
    case 'inactive':
    case 'cancelled':
    case 'rejected':
      return 'bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400 border-gray-200 dark:border-gray-700'
    case 'blacklisted':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
    case 'assigned':
    case 'pending':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    active: 'Aktif',
    inactive: 'Tidak Aktif',
    blacklisted: 'Senarai Hitam',
    pending: 'Menunggu',
    approved: 'Diluluskan',
    rejected: 'Ditolak',
    assigned: 'Ditempatkan',
    confirmed: 'Disahkan',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
  }
  return map[status] || status
}

function roleLabel(role: string): string {
  const map: Record<string, string> = {
    coordinator: 'Penyelaras',
    participant: 'Peserta',
    lead: 'Ketua',
  }
  return map[role] || role
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function VolunteersPage() {
  const [activeTab, setActiveTab] = useState('volunteers')
  const [loading, setLoading] = useState(true)

  // Volunteers state
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [volunteerTotal, setVolunteerTotal] = useState(0)
  const [volPage, setVolPage] = useState(1)
  const [volSearch, setVolSearch] = useState('')
  const [volStatusFilter, setVolStatusFilter] = useState('')

  // Hours state
  const [hourLogs, setHourLogs] = useState<HourLog[]>([])
  const [hourTotal, setHourTotal] = useState(0)
  const [hourPage, setHourPage] = useState(1)

  // Deployments state
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [depTotal, setDepTotal] = useState(0)
  const [depPage, setDepPage] = useState(1)

  // Certificates state
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [certTotal, setCertTotal] = useState(0)
  const [certPage, setCertPage] = useState(1)

  // Stats
  const [stats, setStats] = useState<Stats>({
    totalVolunteers: 0,
    activeThisMonth: 0,
    totalHours: 0,
    totalCertificates: 0,
  })

  // Dialogs
  const [volunteerDialogOpen, setVolunteerDialogOpen] = useState(false)
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingTarget, setDeletingTarget] = useState<{ type: string; id: string } | null>(null)

  const [hourDialogOpen, setHourDialogOpen] = useState(false)
  const [deploymentDialogOpen, setDeploymentDialogOpen] = useState(false)
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false)

  // Form state
  const [volForm, setVolForm] = useState({
    name: '', ic: '', phone: '', email: '', address: '', city: '',
    state: '', occupation: '', skills: '', availability: 'anytime',
    emergencyContact: '', emergencyPhone: '', status: 'active',
  })
  const [hourForm, setHourForm] = useState({
    volunteerId: '', date: '', hours: '2', activity: '', status: 'approved',
  })
  const [depForm, setDepForm] = useState({
    volunteerId: '', role: 'participant', status: 'assigned',
    startDate: '', endDate: '', location: '', notes: '',
  })
  const [certForm, setCertForm] = useState({
    volunteerId: '', title: '', description: '', totalHours: '0',
  })

  const [submitting, setSubmitting] = useState(false)
  const pageSize = 10

  // ─── Data Fetching ──────────────────────────────────────────────────────

  const fetchVolunteers = useCallback(async () => {
    try {
      const params: Record<string, string | number | undefined> = {
        page: volPage,
        pageSize,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }
      if (volSearch) params.search = volSearch
      if (volStatusFilter) params.status = volStatusFilter

      const res = await api.get<Volunteer[] & { total?: number; stats?: Stats }>('/volunteers', params)
      const data = Array.isArray(res) ? res : (res as unknown as { data?: Volunteer[]; total?: number; stats?: Stats })
      // The api helper unwraps, so res is the data array directly
      // But GET returns { data, total, page, pageSize, stats }
      // So we need to handle this differently
    } catch {
      // Will handle below
    }
  }, [volPage, volSearch, volStatusFilter])

  // Use raw fetch to get full response envelope
  const fetchAllData = useCallback(async () => {
    setLoading(true)
    try {
      const buildUrl = (base: string, params: Record<string, string | number | undefined>) => {
        const sp = new URLSearchParams()
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== '') sp.append(k, String(v))
        })
        const qs = sp.toString()
        return qs ? `${base}?${qs}` : base
      }

      // Fetch volunteers + stats
      const volParams: Record<string, string | number | undefined> = {
        page: volPage, pageSize, sortBy: 'createdAt', sortOrder: 'desc',
      }
      if (volSearch) volParams.search = volSearch
      if (volStatusFilter) volParams.status = volStatusFilter

      const [volRes, hourRes, depRes, certRes] = await Promise.all([
        fetch(buildUrl('/api/v1/volunteers', volParams)).then(r => r.json()),
        fetch(buildUrl('/api/v1/volunteers/hours', { page: hourPage, pageSize })).then(r => r.json()),
        fetch(buildUrl('/api/v1/volunteers/deployments', { page: depPage, pageSize })).then(r => r.json()),
        fetch(buildUrl('/api/v1/volunteers/certificates', { page: certPage, pageSize })).then(r => r.json()),
      ])

      if (volRes.success) {
        setVolunteers(volRes.data || [])
        setVolunteerTotal(volRes.total || 0)
        if (volRes.stats) setStats(volRes.stats)
      }
      if (hourRes.success) {
        setHourLogs(hourRes.data || [])
        setHourTotal(hourRes.total || 0)
      }
      if (depRes.success) {
        setDeployments(depRes.data || [])
        setDepTotal(depRes.total || 0)
      }
      if (certRes.success) {
        setCertificates(certRes.data || [])
        setCertTotal(certRes.total || 0)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      toast.error('Gagal memuatkan data')
    } finally {
      setLoading(false)
    }
  }, [volPage, volSearch, volStatusFilter, hourPage, depPage, certPage])

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  // Reset page on filter change
  const handleVolSearch = (val: string) => { setVolSearch(val); setVolPage(1) }
  const handleVolStatusFilter = (val: string) => { setVolStatusFilter(val === 'all' ? '' : val); setVolPage(1) }

  // ─── Volunteer CRUD ──────────────────────────────────────────────────────

  const openVolunteerDialog = (vol?: Volunteer) => {
    if (vol) {
      setEditingVolunteer(vol)
      setVolForm({
        name: vol.name,
        ic: vol.ic,
        phone: vol.phone,
        email: vol.email || '',
        address: vol.address || '',
        city: vol.city || '',
        state: vol.state || '',
        occupation: vol.occupation || '',
        skills: parseSkills(vol.skills).join(', '),
        availability: vol.availability || 'anytime',
        emergencyContact: vol.emergencyContact || '',
        emergencyPhone: vol.emergencyPhone || '',
        status: vol.status,
      })
    } else {
      setEditingVolunteer(null)
      setVolForm({
        name: '', ic: '', phone: '', email: '', address: '', city: '',
        state: '', occupation: '', skills: '', availability: 'anytime',
        emergencyContact: '', emergencyPhone: '', status: 'active',
      })
    }
    setVolunteerDialogOpen(true)
  }

  const handleVolunteerSubmit = async () => {
    if (!volForm.name.trim() || !volForm.ic.trim() || !volForm.phone.trim()) {
      toast.error('Sila isi nama, No. IC dan telefon')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        ...volForm,
        skills: volForm.skills ? volForm.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
      }
      if (editingVolunteer) {
        await api.put('/volunteers', { id: editingVolunteer.id, ...payload })
        toast.success('Sukarelawan berjaya dikemaskini')
      } else {
        await api.post('/volunteers', payload)
        toast.success('Sukarelawan berjaya didaftarkan')
      }
      setVolunteerDialogOpen(false)
      fetchAllData()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan sukarelawan')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingTarget) return
    setSubmitting(true)
    try {
      if (deletingTarget.type === 'volunteer') {
        await api.delete(`/volunteers?id=${deletingTarget.id}`)
        toast.success('Sukarelawan berjaya dipadam')
      } else if (deletingTarget.type === 'hour') {
        await api.delete(`/volunteers/hours?id=${deletingTarget.id}`)
        toast.success('Log jam berjaya dipadam')
      } else if (deletingTarget.type === 'deployment') {
        await api.delete(`/volunteers/deployments?id=${deletingTarget.id}`)
        toast.success('Penempatan berjaya dipadam')
      } else if (deletingTarget.type === 'certificate') {
        await api.delete(`/volunteers/certificates?id=${deletingTarget.id}`)
        toast.success('Sijil berjaya dipadam')
      }
      setDeleteDialogOpen(false)
      setDeletingTarget(null)
      fetchAllData()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal memadam')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Hour Log CRUD ───────────────────────────────────────────────────────

  const openHourDialog = () => {
    setHourForm({ volunteerId: '', date: new Date().toISOString().split('T')[0], hours: '2', activity: '', status: 'approved' })
    setHourDialogOpen(true)
  }

  const handleHourSubmit = async () => {
    if (!hourForm.volunteerId || !hourForm.date || !hourForm.hours) {
      toast.error('Sila isi semua ruangan yang diperlukan')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/volunteers/hours', {
        ...hourForm,
        hours: parseFloat(hourForm.hours),
      })
      toast.success('Jam khidmat berjaya direkod')
      setHourDialogOpen(false)
      fetchAllData()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal merekod jam')
    } finally {
      setSubmitting(false)
    }
  }

  const handleApproveHour = async (id: string, status: string) => {
    try {
      await api.put('/volunteers/hours', { id, status })
      toast.success(status === 'approved' ? 'Jam khidmat diluluskan' : 'Jam khidmat ditolak')
      fetchAllData()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengemas kini')
    }
  }

  // ─── Deployment CRUD ─────────────────────────────────────────────────────

  const openDeploymentDialog = () => {
    setDepForm({ volunteerId: '', role: 'participant', status: 'assigned', startDate: '', endDate: '', location: '', notes: '' })
    setDeploymentDialogOpen(true)
  }

  const handleDeploymentSubmit = async () => {
    if (!depForm.volunteerId || !depForm.startDate) {
      toast.error('Sila pilih sukarelawan dan tarikh mula')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/volunteers/deployments', depForm)
      toast.success('Penempatan berjaya ditambah')
      setDeploymentDialogOpen(false)
      fetchAllData()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal menambah penempatan')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Certificate CRUD ────────────────────────────────────────────────────

  const openCertificateDialog = () => {
    setCertForm({ volunteerId: '', title: '', description: '', totalHours: '0' })
    setCertificateDialogOpen(true)
  }

  const handleCertificateSubmit = async () => {
    if (!certForm.volunteerId || !certForm.title) {
      toast.error('Sila pilih sukarelawan dan masukkan tajuk sijil')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/volunteers/certificates', {
        ...certForm,
        totalHours: parseFloat(certForm.totalHours) || 0,
      })
      toast.success('Sijil berjaya dijana')
      setCertificateDialogOpen(false)
      fetchAllData()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gagal menjana sijil')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Pagination helpers ─────────────────────────────────────────────────

  const totalPages = (total: number) => Math.max(1, Math.ceil(total / pageSize))

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/60 via-white to-violet-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950/20">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-md shadow-purple-200 dark:shadow-purple-900/30">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                Pengurusan Sukarelawan
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sistem Pengurusan Sukarelawan (VMS)
              </p>
            </div>
          </div>
        </header>

        {/* ── Stats Cards ─────────────────────────────────────────────── */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <Card className="border-0 shadow-sm bg-white dark:bg-slate-800/50">
            <CardContent className="flex items-center gap-3 p-4 sm:p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/40">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Jumlah Sukarelawan</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.totalVolunteers}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white dark:bg-slate-800/50">
            <CardContent className="flex items-center gap-3 p-4 sm:p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Aktif Bulan Ini</p>
                <p className="text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-300">{stats.activeThisMonth}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white dark:bg-slate-800/50">
            <CardContent className="flex items-center gap-3 p-4 sm:p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Jam Khidmat</p>
                <p className="text-xl sm:text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.totalHours.toFixed(1)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white dark:bg-slate-800/50">
            <CardContent className="flex items-center gap-3 p-4 sm:p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/40">
                <Award className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Sijil Dijana</p>
                <p className="text-xl sm:text-2xl font-bold text-rose-700 dark:text-rose-300">{stats.totalCertificates}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────────── */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-white dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 shadow-sm h-auto p-1">
            <TabsTrigger value="volunteers" className="gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-600 dark:text-gray-300 px-4 py-2 text-sm font-medium">
              <HeartHandshake className="h-4 w-4" />
              <span className="hidden sm:inline">Senarai Sukarelawan</span>
              <span className="sm:hidden">Sukarelawan</span>
            </TabsTrigger>
            <TabsTrigger value="hours" className="gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-600 dark:text-gray-300 px-4 py-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Log Jam Khidmat</span>
              <span className="sm:hidden">Jam</span>
            </TabsTrigger>
            <TabsTrigger value="certificates" className="gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-600 dark:text-gray-300 px-4 py-2 text-sm font-medium">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Sijil</span>
            </TabsTrigger>
            <TabsTrigger value="deployments" className="gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-600 dark:text-gray-300 px-4 py-2 text-sm font-medium">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Penempatan</span>
              <span className="sm:hidden">Tempat</span>
            </TabsTrigger>
          </TabsList>

          {/* ═══════════════════════════════════════════════════════════════
              TAB 1: Senarai Sukarelawan
              ═══════════════════════════════════════════════════════════════ */}
          <TabsContent value="volunteers">
            <Card className="border-0 shadow-sm bg-white dark:bg-slate-800/50">
              <CardContent className="p-0">
                {/* Search & Filter */}
                <div className="border-b border-gray-100 dark:border-slate-700 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Cari nama, No. IC atau No. Sukarelawan..."
                        value={volSearch}
                        onChange={(e) => handleVolSearch(e.target.value)}
                        className="pl-9 border-gray-200 bg-gray-50 dark:border-slate-600 dark:bg-slate-900/50"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select value={volStatusFilter || 'all'} onValueChange={handleVolStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[150px] border-gray-200 bg-gray-50 dark:border-slate-600 dark:bg-slate-900/50">
                          <Filter className="mr-2 h-3.5 w-3.5 text-gray-400" />
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Status</SelectItem>
                          <SelectItem value="active">Aktif</SelectItem>
                          <SelectItem value="inactive">Tidak Aktif</SelectItem>
                          <SelectItem value="blacklisted">Senarai Hitam</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => openVolunteerDialog()}
                        className="shrink-0 gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Daftar Sukarelawan</span>
                        <span className="sm:inline">+</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Table */}
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-100 bg-gray-50/80 hover:bg-gray-50/80 dark:border-slate-700 dark:bg-slate-900/40">
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300">No. Sukarelawan</TableHead>
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Nama</TableHead>
                            <TableHead className="hidden md:table-cell font-semibold text-gray-700 dark:text-gray-300">No. IC</TableHead>
                            <TableHead className="hidden sm:table-cell font-semibold text-gray-700 dark:text-gray-300">Telefon</TableHead>
                            <TableHead className="hidden lg:table-cell font-semibold text-gray-700 dark:text-gray-300">Kemahiran</TableHead>
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Status</TableHead>
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Jam</TableHead>
                            <TableHead className="text-center font-semibold text-gray-700 dark:text-gray-300">Tindakan</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {volunteers.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} className="h-40 text-center">
                                <div className="flex flex-col items-center gap-2 text-gray-400">
                                  <Users className="h-10 w-10" />
                                  <p className="font-medium">Tiada sukarelawan ditemui</p>
                                  <p className="text-sm">Cuba ubah kriteria carian anda.</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            volunteers.map((vol) => (
                              <TableRow key={vol.id} className="border-gray-100 dark:border-slate-700/50 hover:bg-purple-50/30 dark:hover:bg-purple-900/10">
                                <TableCell className="font-mono text-xs text-purple-600 dark:text-purple-400 font-medium">{vol.volunteerNumber}</TableCell>
                                <TableCell className="font-medium text-gray-900 dark:text-white">{vol.name}</TableCell>
                                <TableCell className="hidden md:table-cell font-mono text-sm text-gray-600 dark:text-gray-400">{vol.ic}</TableCell>
                                <TableCell className="hidden sm:table-cell text-sm text-gray-600 dark:text-gray-400">{vol.phone}</TableCell>
                                <TableCell className="hidden lg:table-cell">
                                  <div className="flex flex-wrap gap-1">
                                    {parseSkills(vol.skills).slice(0, 2).map((skill, i) => (
                                      <Badge key={i} variant="outline" className="text-[10px] font-normal border-purple-200 text-purple-600 dark:border-purple-800 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/20">
                                        {skill}
                                      </Badge>
                                    ))}
                                    {parseSkills(vol.skills).length > 2 && (
                                      <Badge variant="outline" className="text-[10px] font-normal border-gray-200 text-gray-500">
                                        +{parseSkills(vol.skills).length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={`text-xs font-medium ${statusColor(vol.status)}`}>
                                    {statusLabel(vol.status)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-medium text-gray-700 dark:text-gray-300">{vol.totalHours.toFixed(1)}</TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:text-purple-400 dark:hover:bg-purple-900/30"
                                      onClick={() => openVolunteerDialog(vol)}
                                      title="Sunting"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/30"
                                      onClick={() => { setDeletingTarget({ type: 'volunteer', id: vol.id }); setDeleteDialogOpen(true) }}
                                      title="Padam"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    {volunteerTotal > pageSize && (
                      <div className="flex items-center justify-between border-t border-gray-100 dark:border-slate-700 px-4 py-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Menunjukkan {(volPage - 1) * pageSize + 1}–{Math.min(volPage * pageSize, volunteerTotal)} daripada {volunteerTotal}
                        </p>
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-gray-200 dark:border-slate-600" onClick={() => setVolPage(p => Math.max(1, p - 1))} disabled={volPage === 1}>
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          {Array.from({ length: totalPages(volunteerTotal) }, (_, i) => i + 1).map(p => (
                            <Button key={p} variant={volPage === p ? 'default' : 'outline'} size="sm" className={`h-8 w-8 p-0 ${volPage === p ? 'bg-purple-600 hover:bg-purple-700' : 'border-gray-200 dark:border-slate-600'}`} onClick={() => setVolPage(p)}>{p}</Button>
                          ))}
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-gray-200 dark:border-slate-600" onClick={() => setVolPage(p => Math.min(totalPages(volunteerTotal), p + 1))} disabled={volPage === totalPages(volunteerTotal)}>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════
              TAB 2: Log Jam Khidmat
              ═══════════════════════════════════════════════════════════════ */}
          <TabsContent value="hours">
            <Card className="border-0 shadow-sm bg-white dark:bg-slate-800/50">
              <CardContent className="p-0">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 p-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Log Jam Khidmat Sukarelawan</h3>
                  <Button onClick={openHourDialog} className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
                    <Plus className="h-4 w-4" />
                    Log Jam
                  </Button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-100 bg-gray-50/80 hover:bg-gray-50/80 dark:border-slate-700 dark:bg-slate-900/40">
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Sukarelawan</TableHead>
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Tarikh</TableHead>
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Jam</TableHead>
                            <TableHead className="hidden sm:table-cell font-semibold text-gray-700 dark:text-gray-300">Aktiviti</TableHead>
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Status</TableHead>
                            <TableHead className="text-center font-semibold text-gray-700 dark:text-gray-300">Tindakan</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {hourLogs.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="h-40 text-center">
                                <div className="flex flex-col items-center gap-2 text-gray-400">
                                  <Clock className="h-10 w-10" />
                                  <p className="font-medium">Tiada log jam khidmat</p>
                                  <p className="text-sm">Klik &quot;Log Jam&quot; untuk menambah rekod baharu.</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            hourLogs.map((log) => (
                              <TableRow key={log.id} className="border-gray-100 dark:border-slate-700/50">
                                <TableCell>
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white text-sm">{log.volunteer.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{log.volunteer.volunteerNumber}</p>
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm text-gray-600 dark:text-gray-400">{formatDate(log.date)}</TableCell>
                                <TableCell className="font-semibold text-gray-900 dark:text-white">{log.hours}h</TableCell>
                                <TableCell className="hidden sm:table-cell text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate">{log.activity || '—'}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={`text-xs font-medium ${statusColor(log.status)}`}>
                                    {statusLabel(log.status)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-center gap-1">
                                    {log.status === 'pending' && (
                                      <>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30" onClick={() => handleApproveHour(log.id, 'approved')} title="Luluskan">
                                          <CheckCircle2 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30" onClick={() => handleApproveHour(log.id, 'rejected')} title="Tolak">
                                          <XCircle className="h-4 w-4" />
                                        </Button>
                                      </>
                                    )}
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30" onClick={() => { setDeletingTarget({ type: 'hour', id: log.id }); setDeleteDialogOpen(true) }} title="Padam">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {hourTotal > pageSize && (
                      <div className="flex items-center justify-between border-t border-gray-100 dark:border-slate-700 px-4 py-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {(hourPage - 1) * pageSize + 1}–{Math.min(hourPage * pageSize, hourTotal)} daripada {hourTotal}
                        </p>
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-gray-200 dark:border-slate-600" onClick={() => setHourPage(p => Math.max(1, p - 1))} disabled={hourPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
                          {Array.from({ length: totalPages(hourTotal) }, (_, i) => i + 1).map(p => (
                            <Button key={p} variant={hourPage === p ? 'default' : 'outline'} size="sm" className={`h-8 w-8 p-0 ${hourPage === p ? 'bg-purple-600 hover:bg-purple-700' : 'border-gray-200 dark:border-slate-600'}`} onClick={() => setHourPage(p)}>{p}</Button>
                          ))}
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-gray-200 dark:border-slate-600" onClick={() => setHourPage(p => Math.min(totalPages(hourTotal), p + 1))} disabled={hourPage === totalPages(hourTotal)}><ChevronRight className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════
              TAB 3: Sijil
              ═══════════════════════════════════════════════════════════════ */}
          <TabsContent value="certificates">
            <Card className="border-0 shadow-sm bg-white dark:bg-slate-800/50">
              <CardContent className="p-0">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 p-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Sijil Penghargaan Sukarelawan</h3>
                  <Button onClick={openCertificateDialog} className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
                    <FileBadge className="h-4 w-4" />
                    Jana Sijil
                  </Button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-100 bg-gray-50/80 hover:bg-gray-50/80 dark:border-slate-700 dark:bg-slate-900/40">
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300">No. Sijil</TableHead>
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Sukarelawan</TableHead>
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Tajuk</TableHead>
                            <TableHead className="hidden sm:table-cell font-semibold text-gray-700 dark:text-gray-300">Jumlah Jam</TableHead>
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Tarikh Dikeluarkan</TableHead>
                            <TableHead className="text-center font-semibold text-gray-700 dark:text-gray-300">Tindakan</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {certificates.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="h-40 text-center">
                                <div className="flex flex-col items-center gap-2 text-gray-400">
                                  <Award className="h-10 w-10" />
                                  <p className="font-medium">Tiada sijil dijana</p>
                                  <p className="text-sm">Klik &quot;Jana Sijil&quot; untuk mencipta sijil baharu.</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            certificates.map((cert) => (
                              <TableRow key={cert.id} className="border-gray-100 dark:border-slate-700/50">
                                <TableCell className="font-mono text-xs text-purple-600 dark:text-purple-400 font-medium">{cert.certificateNumber}</TableCell>
                                <TableCell>
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white text-sm">{cert.volunteer.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{cert.volunteer.volunteerNumber}</p>
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium text-gray-900 dark:text-white text-sm">{cert.title}</TableCell>
                                <TableCell className="hidden sm:table-cell font-semibold text-amber-600 dark:text-amber-400">{cert.totalHours}h</TableCell>
                                <TableCell className="text-sm text-gray-600 dark:text-gray-400">{formatDate(cert.issuedAt)}</TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-center">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30" onClick={() => { setDeletingTarget({ type: 'certificate', id: cert.id }); setDeleteDialogOpen(true) }} title="Padam">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {certTotal > pageSize && (
                      <div className="flex items-center justify-between border-t border-gray-100 dark:border-slate-700 px-4 py-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {(certPage - 1) * pageSize + 1}–{Math.min(certPage * pageSize, certTotal)} daripada {certTotal}
                        </p>
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-gray-200 dark:border-slate-600" onClick={() => setCertPage(p => Math.max(1, p - 1))} disabled={certPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
                          {Array.from({ length: totalPages(certTotal) }, (_, i) => i + 1).map(p => (
                            <Button key={p} variant={certPage === p ? 'default' : 'outline'} size="sm" className={`h-8 w-8 p-0 ${certPage === p ? 'bg-purple-600 hover:bg-purple-700' : 'border-gray-200 dark:border-slate-600'}`} onClick={() => setCertPage(p)}>{p}</Button>
                          ))}
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-gray-200 dark:border-slate-600" onClick={() => setCertPage(p => Math.min(totalPages(certTotal), p + 1))} disabled={certPage === totalPages(certTotal)}><ChevronRight className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════
              TAB 4: Penempatan
              ═══════════════════════════════════════════════════════════════ */}
          <TabsContent value="deployments">
            <Card className="border-0 shadow-sm bg-white dark:bg-slate-800/50">
              <CardContent className="p-0">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 p-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Penempatan Sukarelawan</h3>
                  <Button onClick={openDeploymentDialog} className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
                    <Plus className="h-4 w-4" />
                    Tambah Penempatan
                  </Button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-100 bg-gray-50/80 hover:bg-gray-50/80 dark:border-slate-700 dark:bg-slate-900/40">
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Sukarelawan</TableHead>
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Peranan</TableHead>
                            <TableHead className="hidden sm:table-cell font-semibold text-gray-700 dark:text-gray-300">Program</TableHead>
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Status</TableHead>
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Tarikh Mula</TableHead>
                            <TableHead className="text-center font-semibold text-gray-700 dark:text-gray-300">Tindakan</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {deployments.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="h-40 text-center">
                                <div className="flex flex-col items-center gap-2 text-gray-400">
                                  <MapPin className="h-10 w-10" />
                                  <p className="font-medium">Tiada penempatan</p>
                                  <p className="text-sm">Klik &quot;Tambah Penempatan&quot; untuk membuat penempatan baharu.</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            deployments.map((dep) => (
                              <TableRow key={dep.id} className="border-gray-100 dark:border-slate-700/50">
                                <TableCell>
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white text-sm">{dep.volunteer.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{dep.volunteer.volunteerNumber}</p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-xs border-purple-200 text-purple-600 dark:border-purple-800 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/20">
                                    {roleLabel(dep.role)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell text-sm text-gray-600 dark:text-gray-400">{dep.programme?.name || '—'}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={`text-xs font-medium ${statusColor(dep.status)}`}>
                                    {statusLabel(dep.status)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-gray-600 dark:text-gray-400">{formatDate(dep.startDate)}</TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-center">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30" onClick={() => { setDeletingTarget({ type: 'deployment', id: dep.id }); setDeleteDialogOpen(true) }} title="Padam">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {depTotal > pageSize && (
                      <div className="flex items-center justify-between border-t border-gray-100 dark:border-slate-700 px-4 py-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {(depPage - 1) * pageSize + 1}–{Math.min(depPage * pageSize, depTotal)} daripada {depTotal}
                        </p>
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-gray-200 dark:border-slate-600" onClick={() => setDepPage(p => Math.max(1, p - 1))} disabled={depPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
                          {Array.from({ length: totalPages(depTotal) }, (_, i) => i + 1).map(p => (
                            <Button key={p} variant={depPage === p ? 'default' : 'outline'} size="sm" className={`h-8 w-8 p-0 ${depPage === p ? 'bg-purple-600 hover:bg-purple-700' : 'border-gray-200 dark:border-slate-600'}`} onClick={() => setDepPage(p)}>{p}</Button>
                          ))}
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-gray-200 dark:border-slate-600" onClick={() => setDepPage(p => Math.min(totalPages(depTotal), p + 1))} disabled={depPage === totalPages(depTotal)}><ChevronRight className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          DIALOGS
          ═══════════════════════════════════════════════════════════════════ */}

      {/* ─── Volunteer Dialog ──────────────────────────────────────────── */}
      <Dialog open={volunteerDialogOpen} onOpenChange={setVolunteerDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingVolunteer ? 'Sunting Sukarelawan' : 'Daftar Sukarelawan Baharu'}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {editingVolunteer ? 'Kemaskini maklumat sukarelawan.' : 'Isi maklumat untuk mendaftar sukarelawan baharu.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nama Penuh <span className="text-red-500">*</span></Label>
                <Input value={volForm.name} onChange={e => setVolForm({ ...volForm, name: e.target.value })} placeholder="Ahmad bin Abdullah" className="border-gray-200 dark:border-slate-600" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">No. Kad Pengenalan <span className="text-red-500">*</span></Label>
                <Input value={volForm.ic} onChange={e => setVolForm({ ...volForm, ic: e.target.value })} placeholder="850315-01-5123" className="border-gray-200 dark:border-slate-600" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">No. Telefon <span className="text-red-500">*</span></Label>
                <Input value={volForm.phone} onChange={e => setVolForm({ ...volForm, phone: e.target.value })} placeholder="013-7892341" className="border-gray-200 dark:border-slate-600" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Emel</Label>
                <Input type="email" value={volForm.email} onChange={e => setVolForm({ ...volForm, email: e.target.value })} placeholder="emel@contoh.com" className="border-gray-200 dark:border-slate-600" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Alamat</Label>
              <Input value={volForm.address} onChange={e => setVolForm({ ...volForm, address: e.target.value })} placeholder="No. 12, Jalan Hulu Klang" className="border-gray-200 dark:border-slate-600" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bandar</Label>
                <Input value={volForm.city} onChange={e => setVolForm({ ...volForm, city: e.target.value })} placeholder="Kuala Lumpur" className="border-gray-200 dark:border-slate-600" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Negeri</Label>
                <Input value={volForm.state} onChange={e => setVolForm({ ...volForm, state: e.target.value })} placeholder="Selangor" className="border-gray-200 dark:border-slate-600" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Pekerjaan</Label>
                <Input value={volForm.occupation} onChange={e => setVolForm({ ...volForm, occupation: e.target.value })} placeholder="Guru" className="border-gray-200 dark:border-slate-600" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Kemahiran <span className="text-xs text-gray-400">(asingkan dengan koma)</span></Label>
              <Input value={volForm.skills} onChange={e => setVolForm({ ...volForm, skills: e.target.value })} placeholder="mengajar, perubatan, memandu" className="border-gray-200 dark:border-slate-600" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ketersediaan</Label>
                <Select value={volForm.availability} onValueChange={v => setVolForm({ ...volForm, availability: v })}>
                  <SelectTrigger className="border-gray-200 dark:border-slate-600"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anytime">Bila-bila masa</SelectItem>
                    <SelectItem value="weekday">Hari Kerja</SelectItem>
                    <SelectItem value="weekend">Hujung Minggu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</Label>
                <Select value={volForm.status} onValueChange={v => setVolForm({ ...volForm, status: v })}>
                  <SelectTrigger className="border-gray-200 dark:border-slate-600"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Tidak Aktif</SelectItem>
                    <SelectItem value="blacklisted">Senarai Hitam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Hubungan Kecemasan</Label>
                <Input value={volForm.emergencyContact} onChange={e => setVolForm({ ...volForm, emergencyContact: e.target.value })} placeholder="Nama" className="border-gray-200 dark:border-slate-600" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Telefon Kecemasan</Label>
                <Input value={volForm.emergencyPhone} onChange={e => setVolForm({ ...volForm, emergencyPhone: e.target.value })} placeholder="013-XXXXXXX" className="border-gray-200 dark:border-slate-600" />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setVolunteerDialogOpen(false)} className="border-gray-200 dark:border-slate-600">Batal</Button>
            <Button onClick={handleVolunteerSubmit} disabled={submitting} className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingVolunteer ? 'Kemaskini' : 'Daftar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Hour Log Dialog ───────────────────────────────────────────── */}
      <Dialog open={hourDialogOpen} onOpenChange={setHourDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">Log Jam Khidmat</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">Rekod jam khidmat sukarelawan.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sukarelawan <span className="text-red-500">*</span></Label>
              <Select value={hourForm.volunteerId} onValueChange={v => setHourForm({ ...hourForm, volunteerId: v })}>
                <SelectTrigger className="border-gray-200 dark:border-slate-600"><SelectValue placeholder="Pilih sukarelawan" /></SelectTrigger>
                <SelectContent>
                  {volunteers.filter(v => v.status === 'active').map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.name} ({v.volunteerNumber})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tarikh <span className="text-red-500">*</span></Label>
                <Input type="date" value={hourForm.date} onChange={e => setHourForm({ ...hourForm, date: e.target.value })} className="border-gray-200 dark:border-slate-600" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Jam <span className="text-red-500">*</span></Label>
                <Input type="number" step="0.5" min="0.5" max="24" value={hourForm.hours} onChange={e => setHourForm({ ...hourForm, hours: e.target.value })} className="border-gray-200 dark:border-slate-600" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Aktiviti</Label>
              <Textarea value={hourForm.activity} onChange={e => setHourForm({ ...hourForm, activity: e.target.value })} placeholder="Terangkan aktiviti yang dilakukan..." className="border-gray-200 dark:border-slate-600 min-h-[80px]" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</Label>
              <Select value={hourForm.status} onValueChange={v => setHourForm({ ...hourForm, status: v })}>
                <SelectTrigger className="border-gray-200 dark:border-slate-600"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Diluluskan</SelectItem>
                  <SelectItem value="pending">Menunggu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setHourDialogOpen(false)} className="border-gray-200 dark:border-slate-600">Batal</Button>
            <Button onClick={handleHourSubmit} disabled={submitting} className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Deployment Dialog ─────────────────────────────────────────── */}
      <Dialog open={deploymentDialogOpen} onOpenChange={setDeploymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">Tambah Penempatan</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">Tempatkan sukarelawan ke program atau aktiviti.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sukarelawan <span className="text-red-500">*</span></Label>
              <Select value={depForm.volunteerId} onValueChange={v => setDepForm({ ...depForm, volunteerId: v })}>
                <SelectTrigger className="border-gray-200 dark:border-slate-600"><SelectValue placeholder="Pilih sukarelawan" /></SelectTrigger>
                <SelectContent>
                  {volunteers.filter(v => v.status === 'active').map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.name} ({v.volunteerNumber})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Peranan</Label>
                <Select value={depForm.role} onValueChange={v => setDepForm({ ...depForm, role: v })}>
                  <SelectTrigger className="border-gray-200 dark:border-slate-600"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="participant">Peserta</SelectItem>
                    <SelectItem value="coordinator">Penyelaras</SelectItem>
                    <SelectItem value="lead">Ketua</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</Label>
                <Select value={depForm.status} onValueChange={v => setDepForm({ ...depForm, status: v })}>
                  <SelectTrigger className="border-gray-200 dark:border-slate-600"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assigned">Ditempatkan</SelectItem>
                    <SelectItem value="confirmed">Disahkan</SelectItem>
                    <SelectItem value="completed">Selesai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tarikh Mula <span className="text-red-500">*</span></Label>
                <Input type="date" value={depForm.startDate} onChange={e => setDepForm({ ...depForm, startDate: e.target.value })} className="border-gray-200 dark:border-slate-600" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tarikh Tamat</Label>
                <Input type="date" value={depForm.endDate} onChange={e => setDepForm({ ...depForm, endDate: e.target.value })} className="border-gray-200 dark:border-slate-600" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Lokasi</Label>
              <Input value={depForm.location} onChange={e => setDepForm({ ...depForm, location: e.target.value })} placeholder="Masukkan lokasi" className="border-gray-200 dark:border-slate-600" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Catatan</Label>
              <Textarea value={depForm.notes} onChange={e => setDepForm({ ...depForm, notes: e.target.value })} placeholder="Catatan tambahan..." className="border-gray-200 dark:border-slate-600 min-h-[60px]" />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeploymentDialogOpen(false)} className="border-gray-200 dark:border-slate-600">Batal</Button>
            <Button onClick={handleDeploymentSubmit} disabled={submitting} className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Certificate Dialog ────────────────────────────────────────── */}
      <Dialog open={certificateDialogOpen} onOpenChange={setCertificateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">Jana Sijil</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">Jana sijil penghargaan untuk sukarelawan.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sukarelawan <span className="text-red-500">*</span></Label>
              <Select value={certForm.volunteerId} onValueChange={v => {
                const vol = volunteers.find(x => x.id === v)
                setCertForm({ ...certForm, volunteerId: v, totalHours: vol ? String(vol.totalHours) : '0' })
              }}>
                <SelectTrigger className="border-gray-200 dark:border-slate-600"><SelectValue placeholder="Pilih sukarelawan" /></SelectTrigger>
                <SelectContent>
                  {volunteers.map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.name} ({v.volunteerNumber})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tajuk Sijil <span className="text-red-500">*</span></Label>
              <Input value={certForm.title} onChange={e => setCertForm({ ...certForm, title: e.target.value })} placeholder="Sijil Penghargaan Khidmat Sukarelawan" className="border-gray-200 dark:border-slate-600" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Penerangan</Label>
              <Textarea value={certForm.description} onChange={e => setCertForm({ ...certForm, description: e.target.value })} placeholder="Penerangan sijil..." className="border-gray-200 dark:border-slate-600 min-h-[60px]" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Jumlah Jam Khidmat</Label>
              <Input type="number" min="0" step="0.5" value={certForm.totalHours} onChange={e => setCertForm({ ...certForm, totalHours: e.target.value })} className="border-gray-200 dark:border-slate-600" />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCertificateDialogOpen(false)} className="border-gray-200 dark:border-slate-600">Batal</Button>
            <Button onClick={handleCertificateSubmit} disabled={submitting} className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Jana Sijil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation Dialog ────────────────────────────────── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white">Padam Rekod?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              Tindakan ini tidak boleh dibatalkan. Rekod ini akan dipadam secara kekal dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="border-gray-200 dark:border-slate-600">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 text-white gap-2"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Padam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
