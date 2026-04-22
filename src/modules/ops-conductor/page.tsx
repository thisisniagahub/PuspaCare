'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { api, apiFetch } from '@/lib/api'
import { useOpsStore, type ConductorTab, type ChatMessage, type OpsWorkItem, type TraceEntry, type OpsAutomation, type OpsDashboardSummary } from '@/stores/ops-store'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  MessageSquare, ListTodo, BarChart3, Zap, GitBranch, Send, Plus, Filter,
  CheckCircle2, XCircle, Loader2, Clock, AlertTriangle, Inbox, ChevronRight,
  Package, FileText, Gavel, Heart, Users, Bell, ArrowRight, Sparkles, Bot,
  User, RotateCcw, Trash2, Calendar, CalendarClock, Play, Pause
} from 'lucide-react'

/* ─── Constants ──────────────────────────────────────────────────────────────── */

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  queued:        { label: 'Menunggu', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', dot: 'bg-gray-400' },
  in_progress:   { label: 'Sedang Dijalankan', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', dot: 'bg-blue-500' },
  waiting_user:  { label: 'Menunggu Pengguna', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300', dot: 'bg-yellow-500' },
  scheduled:     { label: 'Dijadualkan', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300', dot: 'bg-indigo-500' },
  blocked:       { label: 'Disekat', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', dot: 'bg-red-500' },
  completed:     { label: 'Selesai', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300', dot: 'bg-emerald-500' },
  failed:        { label: 'Gagal', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', dot: 'bg-red-500' },
  archived:      { label: 'Diarkib', color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400', dot: 'bg-gray-400' },
}

const DOMAIN_CONFIG: Record<string, { label: string; icon: typeof Package; color: string }> = {
  inventory:   { label: 'Inventori',    icon: Package,  color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' },
  reports:     { label: 'Laporan',      icon: FileText, color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-400' },
  cases:       { label: 'Kes',          icon: Gavel,    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400' },
  donors:      { label: 'Penderma',     icon: Heart,    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' },
  volunteers:  { label: 'Sukarelawan',  icon: Users,    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400' },
  reminders:   { label: 'Peringatan',   icon: Bell,     color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400' },
  general:     { label: 'Umum',         icon: Inbox,    color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  dashboard:   { label: 'Dashboard',    icon: BarChart3, color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400' },
  continuity:  { label: 'Sambungan',    icon: RotateCcw, color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400' },
  messaging:   { label: 'Mesej',        icon: MessageSquare, color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400' },
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  urgent: { label: 'Mendesak', color: 'bg-red-500' },
  high:   { label: 'Tinggi',   color: 'bg-orange-500' },
  normal: { label: 'Normal',   color: 'bg-blue-500' },
  low:    { label: 'Rendah',   color: 'bg-gray-400' },
}

const TABS: { key: ConductorTab; label: string; icon: typeof MessageSquare }[] = [
  { key: 'chat',        label: 'Sembang',      icon: MessageSquare },
  { key: 'tasks',       label: 'Tugasan',       icon: ListTodo },
  { key: 'dashboard',   label: 'Papan Pintasan', icon: BarChart3 },
  { key: 'automations', label: 'Automasi',      icon: Zap },
  { key: 'trace',       label: 'Jejak',         icon: GitBranch },
]

const QUICK_SUGGESTIONS = [
  'Check stok beras',
  'Senarai kes pending',
  'Status donasi bulan ni',
  'Sukarelawan aktif',
  'Buat reminder',
]

const BRAND_GRADIENT = 'linear-gradient(135deg, #4B0082, #6B21A8)'

/* ─── Helpers ────────────────────────────────────────────────────────────────── */

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatRelative(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return 'baru saja'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min lalu`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} jam lalu`
  return formatDate(iso)
}

function TraceStatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'success': return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
    case 'failed':  return <XCircle className="h-4 w-4 text-red-500 shrink-0" />
    case 'pending': return <Clock className="h-4 w-4 text-gray-400 shrink-0" />
    case 'running': return <Loader2 className="h-4 w-4 text-blue-500 shrink-0 animate-spin" />
    default:        return <Clock className="h-4 w-4 text-gray-400 shrink-0" />
  }
}

function StatusDot({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.queued
  return <span className={cn('inline-block h-2 w-2 rounded-full shrink-0', cfg.dot)} />
}

/* ─── Intent → Domain API Handler ───────────────────────────────────────────── */

interface IntentResult {
  intent: string
  domain: string
  confidence: number
  actionMode: string
  suggestedTitle: string
  needsClarification: boolean
}

async function fetchDomainData(intent: string): Promise<string> {
  try {
    switch (intent) {
      case 'inventory_lookup': {
        const data = await api.get<any>('/disbursements', { pageSize: 5 })
        if (Array.isArray(data) && data.length > 0) {
          const summary = data.slice(0, 5).map((d: any) =>
            `- ${d.programme?.name || 'Tiada program'}: RM ${(d.amount || 0).toLocaleString()} (${d.status})`
          ).join('\n')
          return `Senarai pembayaran terkini:\n${summary}\n\nJumlah: ${data.length} rekod dikembalikan.`
        }
        return 'Tiada data inventori/pembayaran yang dijumpai buat masa ini.'
      }
      case 'report_list': {
        const data = await api.get<any>('/reports')
        const d = data as any
        if (d?.summary) {
          const s = d.summary
          return `Ringkasan Laporan Kewangan:\n- Jumlah Pendapatan: RM ${(s.totalIncome || 0).toLocaleString()}\n- Jumlah Perbelanjaan: RM ${(s.totalExpenditure || 0).toLocaleString()}\n- Baki Bersih: RM ${(s.netBalance || 0).toLocaleString()}\n- Jumlah Donasi: ${s.totalDonations || 0}\n- Jumlah Pembayaran: ${s.totalDisbursements || 0}`
        }
        return 'Laporan kewangan dimuat turun. Sila semula untuk melihat butiran.'
      }
      case 'case_query': {
        const data = await api.get<any>('/cases', { status: 'OPEN', pageSize: 5 })
        if (Array.isArray(data) && data.length > 0) {
          const summary = data.slice(0, 5).map((c: any) =>
            `- ${c.caseNumber}: ${c.title} (${c.applicantName || 'Tanpa nama'}) - ${c.status}`
          ).join('\n')
          return `Kes yang masih terbuka (${data.length} dipaparkan):\n${summary}`
        }
        return 'Tiada kes terbuka buat masa ini.'
      }
      case 'donor_summary': {
        const data = await api.get<any>('/donors', { pageSize: 5 })
        const stats = (data as any)?.stats
        const donors = Array.isArray(data) ? data : []
        let summary = 'Ringkasan Penderma:\n'
        if (stats) {
          summary += `- Jumlah Penderma: ${stats.totalDonators || 0}\n- Jumlah Derma: RM ${(stats.totalAmount || 0).toLocaleString()}\n- Penderma Tetap: ${stats.regularDonors || 0}\n- Resit Cukai: ${stats.totalReceipts || 0}\n`
        }
        if (donors.length > 0) {
          summary += '\nPenderma terkini:\n'
          summary += donors.slice(0, 5).map((dn: any) =>
            `- ${dn.name} (${dn.donorNumber}) - Segmen: ${dn.segment}`
          ).join('\n')
        }
        return summary
      }
      case 'volunteer_list': {
        const data = await api.get<any>('/volunteers', { status: 'active', pageSize: 5 })
        const stats = (data as any)?.stats
        const vols = Array.isArray(data) ? data : []
        let summary = 'Ringkasan Sukarelawan:\n'
        if (stats) {
          summary += `- Jumlah Sukarelawan: ${stats.totalVolunteers || 0}\n- Aktif Bulan Ini: ${stats.activeThisMonth || 0}\n- Jumlah Jam: ${stats.totalHours || 0}\n- Sijil: ${stats.totalCertificates || 0}\n`
        }
        if (vols.length > 0) {
          summary += '\nSukarelawan aktif:\n'
          summary += vols.slice(0, 5).map((v: any) =>
            `- ${v.name} (${v.volunteerNumber}) - ${v.totalHours || 0} jam`
          ).join('\n')
        }
        return summary
      }
      case 'dashboard_generate': {
        const data = await api.get<any>('/ops/dashboard')
        const d = data as any
        if (d) {
          const statusStr = Object.entries(d.workItems?.byStatus || {}).map(([k, v]: [string, any]) =>
            `${STATUS_CONFIG[k]?.label || k}: ${v}`
          ).join(', ')
          const domainStr = Object.entries(d.domainSummary || {}).map(([k, v]: [string, any]) =>
            `${DOMAIN_CONFIG[k]?.label || k}: ${v}`
          ).join(', ')
          return `Ringkasan Dashboard Operasi:\n\nTugasan mengikut status: ${statusStr}\n\nMengikut domain: ${domainStr}\n\nAutomasi: ${d.automations?.active || 0} aktif daripada ${d.automations?.total || 0} jumlah`
        }
        return 'Gagal memuatkan dashboard operasi.'
      }
      default:
        return ''
    }
  } catch (err: any) {
    return `Ralat semasa mengambil data: ${err.message || 'Tidak diketahui'}. Sila cuba lagi.`
  }
}

/* ─── Main Component ────────────────────────────────────────────────────────── */

export default function OpsConductor() {
  const store = useOpsStore()
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [dashLoading, setDashLoading] = useState(false)
  const [tasksLoading, setTasksLoading] = useState(false)
  const [autosLoading, setAutosLoading] = useState(false)
  const [leftFilter, setLeftFilter] = useState<string>('all')
  const [tasksFilter, setTasksFilter] = useState<string>('all')
  const [tasksDomainFilter, setTasksDomainFilter] = useState<string>('')
  const [createAutoOpen, setCreateAutoOpen] = useState(false)
  const [newAuto, setNewAuto] = useState({ title: '', description: '', kind: 'one_time' as string, domain: 'general' })
  const [createAutoLoading, setCreateAutoLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const chatEndRef = useRef<HTMLDivElement>(null)
  const traceEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  /* Detect mobile */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  /* Auto-scroll chat */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [store.messages])

  /* Auto-scroll trace */
  useEffect(() => {
    traceEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [store.traceEntries])

  /* Auto-resize textarea */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [inputValue])

  /* ─── Data loaders ───────────────────────────────────────────────────────── */

  const loadDashboard = useCallback(async () => {
    setDashLoading(true)
    try {
      const data = await api.get<any>('/ops/dashboard')
      store.setDashboardSummary({
        workItemsByStatus: data.workItems?.byStatus || {},
        automationCounts: { active: data.automations?.active || 0, total: data.automations?.total || 0 },
        recentEvents: (data.recentEvents || []).map((e: any) => ({
          id: e.id,
          workItemId: e.workItemId || '',
          type: e.type || '',
          summary: e.summary || '',
          detail: e.detail,
          toolName: e.toolName,
          status: e.status || 'success',
          latencyMs: e.latencyMs,
          createdAt: e.createdAt || new Date().toISOString(),
        })),
        domainSummary: data.domainSummary || {},
        upcomingAutomations: (data.upcomingAutomations || []).map((a: any) => ({
          id: a.id,
          title: a.title,
          description: a.description,
          kind: a.kind,
          expr: a.expr,
          domain: a.domain,
          relatedProject: a.relatedProject,
          isEnabled: a.isEnabled,
          lastRunAt: a.lastRunAt,
          nextRunAt: a.nextRunAt,
          lastResult: a.lastResult,
          failureState: a.failureState,
        })),
      })
    } catch { /* silent fail */ }
    setDashLoading(false)
  }, [store])

  const loadTasks = useCallback(async () => {
    setTasksLoading(true)
    try {
      const data = await api.get<any>('/ops/work-items', { pageSize: 50 })
      const items = Array.isArray(data) ? data : []
      store.setWorkItems(items.map((wi: any) => ({
        id: wi.id,
        workItemNumber: wi.workItemNumber,
        title: wi.title,
        project: wi.project || 'PUSPA',
        domain: wi.domain,
        sourceChannel: wi.sourceChannel || 'chat',
        requestText: wi.requestText || '',
        intent: wi.intent || '',
        status: wi.status,
        priority: wi.priority || 'normal',
        currentStep: wi.currentStep,
        nextAction: wi.nextAction,
        blockerReason: wi.blockerReason,
        resolutionSummary: wi.resolutionSummary,
        tags: wi.tags,
        createdAt: wi.createdAt,
        updatedAt: wi.updatedAt,
        startedAt: wi.startedAt,
        completedAt: wi.completedAt,
      })))
    } catch { /* silent fail */ }
    setTasksLoading(false)
  }, [store])

  const loadAutomations = useCallback(async () => {
    setAutosLoading(true)
    try {
      const data = await api.get<any>('/ops/automations')
      const items = Array.isArray(data) ? data : []
      store.setAutomations(items.map((a: any) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        kind: a.kind || 'one_time',
        expr: a.expr,
        domain: a.domain || 'general',
        relatedProject: a.relatedProject || 'PUSPA',
        workItemId: a.workItemId,
        isEnabled: a.isEnabled,
        lastRunAt: a.lastRunAt,
        nextRunAt: a.nextRunAt,
        lastResult: a.lastResult,
        failureState: a.failureState,
      })))
    } catch { /* silent fail */ }
    setAutosLoading(false)
  }, [store])

  const loadTrace = useCallback(async (workItemId: string) => {
    try {
      const data = await api.get<any>(`/ops/work-items/${workItemId}`)
      if (data) {
        store.setSelectedWorkItem({
          id: data.id,
          workItemNumber: data.workItemNumber,
          title: data.title,
          project: data.project || 'PUSPA',
          domain: data.domain,
          sourceChannel: data.sourceChannel || 'chat',
          requestText: data.requestText || '',
          intent: data.intent || '',
          status: data.status,
          priority: data.priority || 'normal',
          currentStep: data.currentStep,
          nextAction: data.nextAction,
          blockerReason: data.blockerReason,
          resolutionSummary: data.resolutionSummary,
          tags: data.tags,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          startedAt: data.startedAt,
          completedAt: data.completedAt,
        })
        const events = Array.isArray(data.executionEvents) ? data.executionEvents : []
        store.setTraceEntries(events.map((e: any) => ({
          id: e.id,
          workItemId: e.workItemId || workItemId,
          type: e.type || '',
          summary: e.summary || '',
          detail: e.detail,
          toolName: e.toolName,
          status: e.status || 'success',
          latencyMs: e.latencyMs,
          createdAt: e.createdAt || new Date().toISOString(),
        })))
        const arts = Array.isArray(data.artifacts) ? data.artifacts : []
        store.setArtifacts(arts.map((a: any) => ({
          id: a.id,
          workItemId: a.workItemId,
          type: a.type || '',
          title: a.title || '',
          summary: a.summary,
          pathOrRef: a.pathOrRef,
          metadata: a.metadata,
          createdAt: a.createdAt || new Date().toISOString(),
        })))
      }
    } catch { /* silent fail */ }
  }, [store])

  /* Initial loads — fetch tasks & automations on mount */
  useEffect(() => {
    let cancelled = false
    const init = async () => {
      if (!cancelled) await loadTasks()
      if (!cancelled) await loadAutomations()
    }
    init()
    return () => { cancelled = true }
  }, [loadTasks, loadAutomations])

  /* Load dashboard lazily when the dashboard tab is activated */
  useEffect(() => {
    if (store.activeTab === 'dashboard' && !store.dashboardSummary) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadDashboard()
    }
  }, [store.activeTab, store.dashboardSummary, loadDashboard])

  /* ─── Chat flow ──────────────────────────────────────────────────────────── */

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || store.isProcessing) return

    const msg = text.trim()
    setInputValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    store.addMessage({ role: 'user', content: msg })
    store.setProcessing(true)
    setIsLoading(true)

    try {
      // Step 1: Classify intent
      store.addTraceEntry({ workItemId: '__current__', type: 'intent_classification', summary: `Mengelasifikasikan niat: "${msg.slice(0, 60)}"`, status: 'running' })
      const intentResult = await api.post<IntentResult>('/ops/intent', { message: msg })

      // Step 2: Create work item
      const workItem = await api.post<OpsWorkItem>('/ops/work-items', {
        title: intentResult.suggestedTitle || msg.slice(0, 60),
        project: 'PUSPA',
        domain: intentResult.domain,
        requestText: msg,
        intent: intentResult.intent,
        priority: intentResult.actionMode === 'background' ? 'high' : 'normal',
      })

      store.setCurrentWorkItemId(workItem.id)

      // Step 3: Route intent
      store.addTraceEntry({ workItemId: workItem.id, type: 'intent_routed', summary: `Niat "${intentResult.intent}" dihalakan ke domain "${intentResult.domain}" (keyakinan: ${(intentResult.confidence * 100).toFixed(0)}%)`, status: 'success' })

      // Step 4: Fetch domain data
      let domainContext = ''
      if (intentResult.intent !== 'general' && intentResult.intent !== 'reminder_create' && intentResult.intent !== 'work_resume') {
        store.addTraceEntry({ workItemId: workItem.id, type: 'domain_fetch', summary: `Mengambil data dari domain "${intentResult.domain}"...`, status: 'running' })
        const startTime = Date.now()
        domainContext = await fetchDomainData(intentResult.intent)
        const latency = Date.now() - startTime
        store.addTraceEntry({ workItemId: workItem.id, type: 'domain_fetch', summary: `Data domain "${intentResult.domain}" berjaya dimuat (${latency}ms)`, status: 'success', latencyMs: latency })
      }

      // Step 5: Handle special intents
      if (intentResult.intent === 'work_resume') {
        const items = store.workItems.filter(wi => wi.status !== 'completed' && wi.status !== 'archived')
        if (items.length > 0) {
          domainContext = `Terdapat ${items.length} tugasan belum selesai. Yang terbaru: ${items[0].workItemNumber} - ${items[0].title} (${STATUS_CONFIG[items[0].status]?.label || items[0].status})`
          await loadTrace(items[0].id)
        } else {
          domainContext = 'Tiada tugasan belum selesai.'
        }
        store.addTraceEntry({ workItemId: workItem.id, type: 'work_resume', summary: `Menyemak tugasan belum selesai`, status: 'success' })
      }

      if (intentResult.intent === 'reminder_create') {
        domainContext = 'Pengguna ingin membuat peringatan/reminder. Sila gunakan tab Automasi untuk membuat reminder baru.'
        store.addTraceEntry({ workItemId: workItem.id, type: 'reminder_create', summary: 'Arahan membuat peringatan dikesan', status: 'success' })
      }

      // Step 6: Generate AI response
      store.addTraceEntry({ workItemId: workItem.id, type: 'ai_response_generating', summary: 'Menjana respons AI...', status: 'running' })
      const aiResult = await api.post<{ response: string }>('/ai/chat', {
        message: msg,
        context: domainContext
          ? `[Konteks data terkini dari sistem PUSPA]:\n${domainContext}\n\n[Berdasarkan data di atas, jawab soalan pengguna dalam bahasa Melayu yang profesional dan ringkas.]`
          : undefined,
      })

      const aiResponse = aiResult.response
      store.addMessage({ role: 'assistant', content: aiResponse, workItemId: workItem.id })
      store.addTraceEntry({ workItemId: workItem.id, type: 'ai_response_complete', summary: 'Respons AI berjaya dijana', status: 'success' })

      // Step 7: Update work item status
      try {
        await apiFetch<any>(`/ops/work-items/${workItem.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'completed', resolutionSummary: aiResponse.slice(0, 200) }) })
        store.addTraceEntry({ workItemId: workItem.id, type: 'work_item_completed', summary: `Tugasan ${workItem.workItemNumber} ditanda sebagai selesai`, status: 'success' })
      } catch {
        store.addTraceEntry({ workItemId: workItem.id, type: 'work_item_update_failed', summary: 'Gagal mengemas kini status tugasan', status: 'failed' })
      }

      // Reload tasks to reflect changes
      loadTasks()
    } catch (err: any) {
      store.addMessage({ role: 'assistant', content: `Maaf, berlaku ralat semasa memproses permintaan anda: ${err.message || 'Ralat tidak diketahui'}. Sila cuba lagi.` })
      store.addTraceEntry({ workItemId: '__current__', type: 'error', summary: `Ralat: ${err.message || 'Tidak diketahui'}`, status: 'failed' })
    } finally {
      store.setProcessing(false)
      setIsLoading(false)
    }
  }, [store, loadTasks])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputValue)
    }
  }, [sendMessage, inputValue])

  /* ─── Toggle automation ──────────────────────────────────────────────────── */

  const toggleAutomation = useCallback(async (id: string, isEnabled: boolean) => {
    try {
      const result = await apiFetch<any>(`/ops/automations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isEnabled: !isEnabled }),
      })
      store.setAutomations(store.automations.map(a => a.id === id ? { ...a, isEnabled: !isEnabled } : a))
    } catch { /* silent */ }
  }, [store])

  /* ─── Create automation ─────────────────────────────────────────────────── */

  const handleCreateAutomation = useCallback(async () => {
    if (!newAuto.title.trim()) return
    setCreateAutoLoading(true)
    try {
      await api.post('/ops/automations', {
        title: newAuto.title,
        description: newAuto.description || undefined,
        kind: newAuto.kind,
        domain: newAuto.domain,
      })
      setCreateAutoOpen(false)
      setNewAuto({ title: '', description: '', kind: 'one_time', domain: 'general' })
      loadAutomations()
    } catch { /* silent */ }
    setCreateAutoLoading(false)
  }, [newAuto, loadAutomations])

  /* ─── Select work item ──────────────────────────────────────────────────── */

  const selectWorkItem = useCallback((wi: OpsWorkItem) => {
    store.setSelectedWorkItem(wi)
    loadTrace(wi.id)
    if (isMobile) {
      store.setActiveTab('trace')
    }
  }, [store, loadTrace, isMobile])

  /* ─── Filtered items ────────────────────────────────────────────────────── */

  const leftFilteredItems = store.workItems.filter(wi => {
    if (leftFilter === 'active') return ['in_progress', 'queued', 'blocked', 'waiting_user'].includes(wi.status)
    if (leftFilter === 'blocked') return wi.status === 'blocked'
    if (leftFilter === 'completed') return wi.status === 'completed'
    return true
  }).slice(0, 20)

  const centerFilteredItems = store.workItems.filter(wi => {
    if (tasksFilter !== 'all' && wi.status !== tasksFilter) return false
    if (tasksDomainFilter && wi.domain !== tasksDomainFilter) return false
    return true
  })

  /* ─── Left sidebar ──────────────────────────────────────────────────────── */

  const renderLeftSidebar = () => (
    <aside className="hidden lg:flex flex-col w-[280px] border-r bg-muted/30 shrink-0">
      <div className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold" style={{ color: '#4B0082' }}>Tugasan Aktif</h3>
          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => store.setActiveTab('chat')}>
            <Plus className="h-3 w-3 mr-1" /> Baru
          </Button>
        </div>
        <div className="flex gap-1">
          {(['all', 'active', 'blocked', 'completed'] as const).map((f) => (
            <Button key={f} size="sm" variant={leftFilter === f ? 'default' : 'ghost'} className={cn('h-7 px-2.5 text-xs flex-1', leftFilter === f && 'text-white')} style={leftFilter === f ? { background: BRAND_GRADIENT } : {}} onClick={() => setLeftFilter(f)}>
              {f === 'all' ? 'Semua' : f === 'active' ? 'Aktif' : f === 'blocked' ? 'Sekat' : 'Siap'}
            </Button>
          ))}
        </div>
      </div>
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 pb-4">
          {tasksLoading && leftFilteredItems.length === 0 ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)
          ) : leftFilteredItems.length === 0 ? (
            <div className="text-center text-xs text-muted-foreground py-8">Tiada tugasan</div>
          ) : leftFilteredItems.map((wi) => (
            <button
              key={wi.id}
              className={cn(
                'w-full text-left p-2.5 rounded-lg transition-colors hover:bg-accent/50 space-y-1',
                store.selectedWorkItem?.id === wi.id && 'bg-accent ring-1 ring-ring'
              )}
              onClick={() => selectWorkItem(wi)}
            >
              <div className="flex items-center gap-2">
                <StatusDot status={wi.status} />
                <span className="text-xs font-mono font-medium text-muted-foreground">{wi.workItemNumber}</span>
                <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 h-4 ml-auto', DOMAIN_CONFIG[wi.domain]?.color)}>
                  {DOMAIN_CONFIG[wi.domain]?.label || wi.domain}
                </Badge>
              </div>
              <p className="text-xs font-medium truncate">{wi.title}</p>
              <p className="text-[10px] text-muted-foreground">{formatRelative(wi.createdAt)}</p>
            </button>
          ))}
        </div>
      </ScrollArea>
    </aside>
  )

  /* ─── Right trace panel ─────────────────────────────────────────────────── */

  const renderTracePanel = () => {
    const wi = store.selectedWorkItem
    if (!wi) {
      return (
        <aside className="hidden lg:flex flex-col w-[320px] border-l bg-muted/20 shrink-0 items-center justify-center p-6 text-center">
          <GitBranch className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">Pilih tugasan untuk melihat jejak pelaksanaan</p>
        </aside>
      )
    }

    return (
      <aside className="hidden lg:flex flex-col w-[320px] border-l bg-muted/20 shrink-0">
        {/* Work item header */}
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center gap-2">
            <Badge className={cn('text-xs', STATUS_CONFIG[wi.status]?.color)}>{STATUS_CONFIG[wi.status]?.label || wi.status}</Badge>
            <Badge variant="outline" className={cn('text-[10px]', DOMAIN_CONFIG[wi.domain]?.color)}>{DOMAIN_CONFIG[wi.domain]?.label || wi.domain}</Badge>
            <span className={cn('ml-auto h-2 w-2 rounded-full', PRIORITY_CONFIG[wi.priority]?.color)} title={PRIORITY_CONFIG[wi.priority]?.label} />
          </div>
          <div>
            <p className="text-xs font-mono text-muted-foreground">{wi.workItemNumber}</p>
            <p className="text-sm font-semibold mt-0.5">{wi.title}</p>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(wi.createdAt)}</span>
            {wi.startedAt && <span className="flex items-center gap-1"><Play className="h-3 w-3" />{formatTime(wi.startedAt)}</span>}
            {wi.completedAt && <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />{formatTime(wi.completedAt)}</span>}
          </div>
          {wi.blockerReason && (
            <div className="flex items-start gap-1.5 p-2 rounded bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-[11px]">
              <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
              <span>{wi.blockerReason}</span>
            </div>
          )}
        </div>

        {/* Trace timeline */}
        <div className="px-4 py-2 border-b">
          <h4 className="text-xs font-semibold flex items-center gap-1.5" style={{ color: '#4B0082' }}>
            <GitBranch className="h-3.5 w-3.5" /> Jejak Pelaksanaan
          </h4>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {store.traceEntries.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Tiada jejak</p>
            ) : store.traceEntries.map((entry, idx) => (
              <div key={entry.id} className="flex gap-2.5">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'flex items-center justify-center h-6 w-6 rounded-full text-[10px] font-bold text-white shrink-0',
                    entry.status === 'success' ? 'bg-emerald-500' :
                    entry.status === 'failed' ? 'bg-red-500' :
                    entry.status === 'running' ? 'bg-blue-500' : 'bg-gray-300'
                  )}>
                    {entry.status === 'running' ? <Loader2 className="h-3 w-3 animate-spin" /> : (idx + 1)}
                  </div>
                  {idx < store.traceEntries.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                </div>
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-mono">{entry.type.replace(/_/g, ' ')}</Badge>
                    {entry.latencyMs != null && (
                      <span className="text-[10px] text-muted-foreground">{entry.latencyMs}ms</span>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed">{entry.summary}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{formatTime(entry.createdAt)}</p>
                </div>
              </div>
            ))}
            <div ref={traceEndRef} />
          </div>
        </ScrollArea>

        {/* Artifacts */}
        {store.artifacts.length > 0 && (
          <div className="border-t p-4 space-y-2">
            <h4 className="text-xs font-semibold flex items-center gap-1.5" style={{ color: '#4B0082' }}>
              <FileText className="h-3.5 w-3.5" /> Artifak ({store.artifacts.length})
            </h4>
            {store.artifacts.map((art) => (
              <div key={art.id} className="flex items-center gap-2 p-1.5 rounded bg-background text-xs">
                <FileText className="h-3 w-3 text-muted-foreground" />
                <span className="truncate">{art.title}</span>
                <Badge variant="outline" className="text-[10px] ml-auto">{art.type}</Badge>
              </div>
            ))}
          </div>
        )}
      </aside>
    )
  }

  /* ─── Chat Tab ───────────────────────────────────────────────────────────── */

  const renderChatTab = () => (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 px-4">
        <div className="max-w-2xl mx-auto py-4 space-y-4">
          {store.messages.length === 0 && (
            <div className="text-center py-16 space-y-4">
              <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: BRAND_GRADIENT }}>
                <Bot className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ color: '#4B0082' }}>Ops Conductor</h3>
                <p className="text-sm text-muted-foreground mt-1">Pembantu operasi AI untuk pengurusan PUSPA</p>
              </div>
              <p className="text-xs text-muted-foreground">Taip mesej atau gunakan cadangan di bawah</p>
            </div>
          )}
          {store.messages.map((msg) => (
            <div key={msg.id} className={cn('flex gap-2.5', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              {msg.role === 'assistant' && (
                <div className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: BRAND_GRADIENT }}>
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div className={cn(
                'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
                msg.role === 'user'
                  ? 'text-white rounded-br-md'
                  : 'bg-muted rounded-bl-md'
              )} style={msg.role === 'user' ? { background: BRAND_GRADIENT } : {}}>
                {msg.content}
                {msg.workItemId && msg.role === 'assistant' && (
                  <p className="text-[10px] opacity-60 mt-1">Tugasan: {msg.workItemId}</p>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-4 w-4 text-primary" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2.5 justify-start">
              <div className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: BRAND_GRADIENT }}>
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Memproses...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </ScrollArea>

      {/* Quick suggestions */}
      {store.messages.length === 0 && !isLoading && (
        <div className="px-4 pb-2">
          <div className="max-w-2xl mx-auto flex flex-wrap gap-2">
            {QUICK_SUGGESTIONS.map((s) => (
              <Button key={s} variant="outline" size="sm" className="h-7 text-xs rounded-full" onClick={() => sendMessage(s)}>
                <Sparkles className="h-3 w-3 mr-1 text-purple-500" />{s}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="border-t p-3 bg-background">
        <div className="max-w-2xl mx-auto flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Taip arahan anda di sini..."
            className="min-h-[40px] max-h-[120px] resize-none rounded-xl text-sm"
            rows={1}
            disabled={isLoading}
          />
          <Button
            size="icon"
            className="h-10 w-10 rounded-xl shrink-0 text-white"
            style={{ background: BRAND_GRADIENT }}
            onClick={() => sendMessage(inputValue)}
            disabled={!inputValue.trim() || isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-1.5">Shift+Enter untuk baris baru, Enter untuk hantar</p>
      </div>
    </div>
  )

  /* ─── Tasks Tab ──────────────────────────────────────────────────────────── */

  const renderTasksTab = () => (
    <div className="p-4 space-y-4 overflow-auto h-full">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1">
          {['all', 'queued', 'in_progress', 'blocked', 'completed'].map((s) => (
            <Button key={s} size="sm" variant={tasksFilter === s ? 'default' : 'ghost'} className={cn('h-7 px-2.5 text-xs', tasksFilter === s && 'text-white')} style={tasksFilter === s ? { background: BRAND_GRADIENT } : {}} onClick={() => setTasksFilter(s)}>
              {s === 'all' ? 'Semua' : STATUS_CONFIG[s]?.label || s}
            </Button>
          ))}
        </div>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <select
          className="h-7 text-xs border rounded-md px-2 bg-background"
          value={tasksDomainFilter}
          onChange={(e) => setTasksDomainFilter(e.target.value)}
        >
          <option value="">Semua Domain</option>
          {Object.entries(DOMAIN_CONFIG).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
        <span className="text-xs text-muted-foreground ml-auto">{centerFilteredItems.length} tugasan</span>
      </div>

      <div className="space-y-3">
        {tasksLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : centerFilteredItems.length === 0 ? (
          <div className="text-center py-16">
            <ListTodo className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Tiada tugasan dijumpai</p>
          </div>
        ) : centerFilteredItems.map((wi) => (
          <Card key={wi.id} className={cn('cursor-pointer transition-all hover:shadow-md', store.selectedWorkItem?.id === wi.id && 'ring-2 ring-purple-500/50')} onClick={() => selectWorkItem(wi)}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-semibold text-muted-foreground">{wi.workItemNumber}</span>
                    <Badge className={cn('text-[10px]', STATUS_CONFIG[wi.status]?.color)}>{STATUS_CONFIG[wi.status]?.label || wi.status}</Badge>
                    <Badge variant="outline" className={cn('text-[10px]', DOMAIN_CONFIG[wi.domain]?.color)}>{DOMAIN_CONFIG[wi.domain]?.label || wi.domain}</Badge>
                  </div>
                  <p className="text-sm font-medium truncate">{wi.title}</p>
                  {wi.resolutionSummary && (
                    <p className="text-xs text-muted-foreground line-clamp-1">{wi.resolutionSummary}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className={cn('h-2.5 w-2.5 rounded-full', PRIORITY_CONFIG[wi.priority]?.color)} title={PRIORITY_CONFIG[wi.priority]?.label} />
                  <span className="text-[10px] text-muted-foreground">{formatRelative(wi.createdAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  /* ─── Dashboard Tab ─────────────────────────────────────────────────────── */

  const renderDashboardTab = () => {
    const ds = store.dashboardSummary
    if (dashLoading || !ds) {
      return (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
          <Skeleton className="h-40 rounded-xl" />
        </div>
      )
    }

    const domainCards: { key: string; icon: typeof Package; label: string; count: number; action: string }[] = [
      { key: 'inventory',  icon: Package,  label: 'Inventori',   count: ds.domainSummary['inventory'] || 0,   action: 'Check stok' },
      { key: 'reports',    icon: FileText, label: 'Laporan',     count: ds.domainSummary['reports'] || 0,      action: 'Lihat laporan' },
      { key: 'cases',      icon: Gavel,    label: 'Kes',         count: ds.domainSummary['cases'] || 0,        action: 'Senarai kes' },
      { key: 'donors',     icon: Heart,    label: 'Penderma',    count: ds.domainSummary['donors'] || 0,       action: 'Ringkasan' },
      { key: 'volunteers', icon: Users,    label: 'Sukarelawan', count: ds.domainSummary['volunteers'] || 0,  action: 'Senarai' },
      { key: 'reminders',  icon: Bell,     label: 'Automasi',    count: ds.automationCounts.total,            action: 'Urus' },
    ]

    const totalWi = Object.values(ds.workItemsByStatus).reduce((a, b) => a + b, 0)
    const maxStatus = Math.max(...Object.values(ds.workItemsByStatus), 1)

    return (
      <ScrollArea className="h-full">
        <div className="p-4 space-y-6">
          {/* Domain summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {domainCards.map((dc) => {
              const Icon = dc.icon
              return (
                <Card key={dc.key} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className={cn('p-2 rounded-lg', DOMAIN_CONFIG[dc.key]?.color)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-2xl font-bold" style={{ color: '#4B0082' }}>{dc.count}</span>
                    </div>
                    <p className="text-sm font-medium mt-2">{dc.label}</p>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] mt-1 text-purple-600 hover:text-purple-700" onClick={() => sendMessage(dc.action)}>
                      {dc.action} <ChevronRight className="h-3 w-3 ml-0.5" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Status distribution */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4" style={{ color: '#4B0082' }} />
                Taburan Status Tugasan
              </CardTitle>
              <CardDescription>Jumlah: {totalWi} tugasan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {Object.entries(ds.workItemsByStatus).sort((a, b) => b[1] - a[1]).map(([status, count]) => {
                  const pct = totalWi > 0 ? (count / maxStatus) * 100 : 0
                  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.queued
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <div className="flex items-center gap-2 w-32 shrink-0">
                        <StatusDot status={status} />
                        <span className="text-xs font-medium">{cfg.label}</span>
                      </div>
                      <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full transition-all', cfg.dot)} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-semibold w-8 text-right">{count}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent events */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" style={{ color: '#4B0082' }} />
                Acara Terkini
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ds.recentEvents.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Tiada acara terkini</p>
                ) : ds.recentEvents.slice(0, 8).map((ev) => (
                  <div key={ev.id} className="flex items-center gap-2.5">
                    <TraceStatusIcon status={ev.status} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate">{ev.summary}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0 font-mono">{ev.type.replace(/_/g, ' ')}</Badge>
                    <span className="text-[10px] text-muted-foreground shrink-0">{formatRelative(ev.createdAt)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button variant="outline" size="sm" className="text-xs" onClick={loadDashboard}>
              <RotateCcw className="h-3 w-3 mr-1" /> Muat Semula
            </Button>
          </div>
        </div>
      </ScrollArea>
    )
  }

  /* ─── Automations Tab ───────────────────────────────────────────────────── */

  const renderAutomationsTab = () => (
    <div className="p-4 space-y-4 overflow-auto h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5" style={{ color: '#4B0082' }} />
          <h3 className="text-sm font-semibold">Automasi & Peringatan</h3>
          <Badge variant="secondary" className="text-[10px]">{store.automations.filter(a => a.isEnabled).length} aktif</Badge>
        </div>
        <Dialog open={createAutoOpen} onOpenChange={setCreateAutoOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 text-xs text-white" style={{ background: BRAND_GRADIENT }}>
              <Plus className="h-3 w-3 mr-1" /> Buat Peringatan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buat Peringatan Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-xs">Tajuk</Label>
                <Input value={newAuto.title} onChange={(e) => setNewAuto(p => ({ ...p, title: e.target.value }))} placeholder="Contoh: Hantar laporan mingguan" className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Penerangan</Label>
                <Textarea value={newAuto.description} onChange={(e) => setNewAuto(p => ({ ...p, description: e.target.value }))} placeholder="Butiran peringatan..." className="text-sm min-h-[60px]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Jenis</Label>
                  <select value={newAuto.kind} onChange={(e) => setNewAuto(p => ({ ...p, kind: e.target.value }))} className="h-9 text-sm border rounded-md px-2 w-full bg-background">
                    <option value="one_time">Sekali Sahaja</option>
                    <option value="fixed_rate">Kadar Tetap</option>
                    <option value="cron">Cron (Berulang)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Domain</Label>
                  <select value={newAuto.domain} onChange={(e) => setNewAuto(p => ({ ...p, domain: e.target.value }))} className="h-9 text-sm border rounded-md px-2 w-full bg-background">
                    {Object.entries(DOMAIN_CONFIG).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateAutoOpen(false)}>Batal</Button>
              <Button className="text-white" style={{ background: BRAND_GRADIENT }} onClick={handleCreateAutomation} disabled={!newAuto.title.trim() || createAutoLoading}>
                {createAutoLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
                Cipta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {autosLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
        ) : store.automations.length === 0 ? (
          <div className="text-center py-16">
            <Zap className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Tiada automasi</p>
            <p className="text-xs text-muted-foreground mt-1">Cipta peringatan baru untuk mengautomasi tugasan anda</p>
          </div>
        ) : store.automations.map((auto) => {
          const DomainIcon = DOMAIN_CONFIG[auto.domain]?.icon || Inbox
          return (
            <Card key={auto.id} className={cn('transition-all', !auto.isEnabled && 'opacity-60')}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn('p-2 rounded-lg shrink-0', DOMAIN_CONFIG[auto.domain]?.color)}>
                    <DomainIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{auto.title}</p>
                      <Badge variant="outline" className="text-[10px] shrink-0">{auto.kind === 'one_time' ? 'Sekali' : auto.kind === 'cron' ? 'Cron' : 'Tetap'}</Badge>
                    </div>
                    {auto.description && <p className="text-xs text-muted-foreground line-clamp-1">{auto.description}</p>}
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      {auto.lastRunAt && <span className="flex items-center gap-1"><RotateCcw className="h-3 w-3" />Terakhir: {formatRelative(auto.lastRunAt)}</span>}
                      {auto.nextRunAt && <span className="flex items-center gap-1"><CalendarClock className="h-3 w-3" />Seterusnya: {formatRelative(auto.nextRunAt)}</span>}
                    </div>
                  </div>
                  <Switch checked={auto.isEnabled} onCheckedChange={() => toggleAutomation(auto.id, auto.isEnabled)} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )

  /* ─── Trace Tab (mobile / center) ───────────────────────────────────────── */

  const renderTraceTabCenter = () => {
    const wi = store.selectedWorkItem
    if (!wi) {
      return (
        <div className="flex items-center justify-center h-full p-8 text-center">
          <div className="space-y-3">
            <GitBranch className="h-10 w-10 text-muted-foreground/40 mx-auto" />
            <p className="text-sm text-muted-foreground">Pilih tugasan dari tab Tugasan untuk melihat jejak pelaksanaan</p>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => store.setActiveTab('tasks')}>
              <ListTodo className="h-3 w-3 mr-1" /> Pergi ke Tugasan
            </Button>
          </div>
        </div>
      )
    }

    return (
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          {/* Work item metadata */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-mono font-semibold">{wi.workItemNumber}</span>
                <Badge className={cn('text-xs', STATUS_CONFIG[wi.status]?.color)}>{STATUS_CONFIG[wi.status]?.label}</Badge>
                <Badge variant="outline" className={cn('text-xs', DOMAIN_CONFIG[wi.domain]?.color)}>{DOMAIN_CONFIG[wi.domain]?.label}</Badge>
                <TooltipProvider><Tooltip><TooltipTrigger asChild><span className={cn('ml-auto h-3 w-3 rounded-full', PRIORITY_CONFIG[wi.priority]?.color)} /><TooltipContent>{PRIORITY_CONFIG[wi.priority]?.label}</TooltipContent></TooltipTrigger></Tooltip></TooltipProvider>
              </div>
              <p className="text-sm font-semibold">{wi.title}</p>
              <p className="text-xs text-muted-foreground">{wi.requestText}</p>
              <Separator />
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">Dicipta:</span> {formatDate(wi.createdAt)}</div>
                {wi.startedAt && <div><span className="text-muted-foreground">Mula:</span> {formatDate(wi.startedAt)}</div>}
                {wi.completedAt && <div><span className="text-muted-foreground">Selesai:</span> {formatDate(wi.completedAt)}</div>}
                <div><span className="text-muted-foreground">Niat:</span> {wi.intent}</div>
              </div>
              {wi.blockerReason && (
                <div className="flex items-start gap-1.5 p-2 rounded bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs">
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>{wi.blockerReason}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trace entries */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <GitBranch className="h-4 w-4" style={{ color: '#4B0082' }} />
                Jejak Pelaksanaan ({store.traceEntries.length} langkah)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {store.traceEntries.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Tiada jejak</p>
                ) : store.traceEntries.map((entry, idx) => (
                  <div key={entry.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        'flex items-center justify-center h-7 w-7 rounded-full text-[10px] font-bold text-white shrink-0',
                        entry.status === 'success' ? 'bg-emerald-500' :
                        entry.status === 'failed' ? 'bg-red-500' :
                        entry.status === 'running' ? 'bg-blue-500' : 'bg-gray-300'
                      )}>
                        {entry.status === 'running' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : (idx + 1)}
                      </div>
                      {idx < store.traceEntries.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                    </div>
                    <div className="flex-1 min-w-0 pb-2">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-mono">{entry.type.replace(/_/g, ' ')}</Badge>
                        {entry.latencyMs != null && <span className="text-[10px] text-muted-foreground">{entry.latencyMs}ms</span>}
                        <TraceStatusIcon status={entry.status} />
                      </div>
                      <p className="text-xs leading-relaxed">{entry.summary}</p>
                      {entry.detail && <p className="text-[10px] text-muted-foreground mt-0.5">{entry.detail}</p>}
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">{formatTime(entry.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Artifacts */}
          {store.artifacts.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" style={{ color: '#4B0082' }} />
                  Artifak ({store.artifacts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {store.artifacts.map((art) => (
                    <div key={art.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-xs">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="flex-1 truncate">{art.title}</span>
                      <Badge variant="outline" className="text-[10px]">{art.type}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    )
  }

  /* ─── Center panel ───────────────────────────────────────────────────────── */

  const renderCenterPanel = () => {
    switch (store.activeTab) {
      case 'chat': return renderChatTab()
      case 'tasks': return renderTasksTab()
      case 'dashboard': return renderDashboardTab()
      case 'automations': return renderAutomationsTab()
      case 'trace': return renderTraceTabCenter()
      default: return renderChatTab()
    }
  }

  /* ─── Tab bar ────────────────────────────────────────────────────────────── */

  const renderTabBar = () => (
    <div className="flex items-center gap-1 overflow-x-auto px-2 pb-0 scrollbar-none">
      {TABS.map((tab) => {
        const Icon = tab.icon
        const isActive = store.activeTab === tab.key
        return (
          <Button
            key={tab.key}
            variant="ghost"
            size="sm"
            className={cn(
              'h-8 px-3 text-xs gap-1.5 shrink-0 transition-all',
              isActive ? 'text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
            style={isActive ? { background: BRAND_GRADIENT } : {}}
            onClick={() => store.setActiveTab(tab.key)}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{tab.label}</span>
          </Button>
        )
      })}
    </div>
  )

  /* ─── Header ─────────────────────────────────────────────────────────────── */

  const activeWiCount = store.workItems.filter(wi => ['in_progress', 'queued', 'blocked'].includes(wi.status)).length

  /* ─── Render ─────────────────────────────────────────────────────────────── */

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col h-[calc(100vh-7rem)] lg:h-[calc(100vh-5.5rem)]">
        {/* Header bar with tabs */}
        <div className="shrink-0 space-y-2">
          <div className="flex items-center justify-between px-4 pt-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl flex items-center justify-center text-white" style={{ background: BRAND_GRADIENT }}>
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-bold" style={{ color: '#4B0082' }}>Ops Conductor</h1>
                <p className="text-[10px] text-muted-foreground -mt-0.5">Konsol operasi PUSPA</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-[10px]">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                <Loader2 className="h-3 w-3" />{activeWiCount} aktif
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />{store.workItems.filter(w => w.status === 'completed').length} selesai
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
                <Zap className="h-3 w-3" />{store.automations.filter(a => a.isEnabled).length} automasi
              </div>
            </div>
            <Button variant="ghost" size="sm" className="lg:hidden h-8 text-xs" onClick={() => store.setActiveTab(store.activeTab === 'trace' ? 'tasks' : 'trace')}>
              <GitBranch className="h-3.5 w-3.5 mr-1" /> {store.activeTab === 'trace' ? 'Tugasan' : 'Jejak'}
            </Button>
          </div>
          {renderTabBar()}
        </div>
        <Separator />

        {/* Three-panel layout */}
        <div className="flex flex-1 min-h-0">
          {/* Left sidebar — desktop only */}
          {renderLeftSidebar()}

          {/* Center panel */}
          <main className="flex-1 min-w-0 flex flex-col">
            {renderCenterPanel()}
          </main>

          {/* Right trace panel — desktop only */}
          {renderTracePanel()}
        </div>
      </div>
    </TooltipProvider>
  )
}
