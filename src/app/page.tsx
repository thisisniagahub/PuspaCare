'use client'

import { Suspense, useEffect, useState } from 'react'
import { useAppStore } from '@/stores/app-store'
import { AppSidebar } from '@/components/app-sidebar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Toaster } from 'sonner'
import { Menu, Moon, Sun, Flower2, Command, AlertTriangle, RefreshCw } from 'lucide-react'
import { useTheme } from 'next-themes'
import { CommandPalette } from '@/components/command-palette'

// All modules imported DIRECTLY — no lazy loading — to prevent Turbopack ChunkLoadError
import Dashboard from '@/modules/dashboard/page'
import Members from '@/modules/members/page'
import Cases from '@/modules/cases/page'
import Programmes from '@/modules/programmes/page'
import Donations from '@/modules/donations/page'
import Disbursements from '@/modules/disbursements/page'
import Compliance from '@/modules/compliance/page'
import Admin from '@/modules/admin/page'
import Reports from '@/modules/reports/page'
import Activities from '@/modules/activities/page'
import AITools from '@/modules/ai/page'
import Volunteers from '@/modules/volunteers/page'
import Donors from '@/modules/donors/page'
import Documents from '@/modules/documents/page'
import MCPServers from '@/modules/openclaw/mcp'
import Plugins from '@/modules/openclaw/plugins'
import Integrations from '@/modules/openclaw/integrations'
import TerminalPage from '@/modules/openclaw/terminal'
import Agents from '@/modules/openclaw/agents'
import Models from '@/modules/openclaw/models'
import Automation from '@/modules/openclaw/automation'
import EKYC from '@/modules/ekyc/page'
import TapSecure from '@/modules/tapsecure/page'

function PageLoader() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-xl" />
      <Skeleton className="h-60 rounded-xl" />
    </div>
  )
}

const viewLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  members: 'Pengurusan Ahli Asnaf',
  cases: 'Pengurusan Kes',
  programmes: 'Pengurusan Program',
  donations: 'Pengurusan Donasi',
  disbursements: 'Pengurusan Pembayaran',
  compliance: 'Dashboard Compliance',
  admin: 'Pentadbiran',
  reports: 'Laporan Kewangan',
  activities: 'Pengurusan Aktiviti',
  ai: 'Alat AI',
  volunteers: 'Pengurusan Sukarelawan',
  donors: 'CRM Penderma',
  documents: 'Gudang Dokumen',
  'openclaw-mcp': 'OpenClaw — Pelayan MCP',
  'openclaw-plugins': 'OpenClaw — Plugin',
  'openclaw-integrations': 'OpenClaw — Integrasi',
  'openclaw-terminal': 'OpenClaw — Terminal',
  'openclaw-agents': 'OpenClaw — Ejen AI',
  'openclaw-models': 'OpenClaw — Penyedia Model',
  'openclaw-automation': 'OpenClaw — Automasi',
  'ekyc': 'eKYC Verification',
  'tapsecure': 'TapSecure',
}

function ViewRenderer({ view }: { view: string }) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const handleRetry = () => {
    setHasError(false)
    setError(null)
  }

  // Reset error when view changes
  useEffect(() => {
    setHasError(false)
    setError(null)
  }, [view])

  if (hasError && error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Ralat Pemuatan Modul
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
            {error.message}
          </p>
        </div>
        <Button variant="outline" onClick={handleRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Cuba Lagi
        </Button>
      </div>
    )
  }

  try {
    switch (view) {
      case 'dashboard': return <Dashboard />
      case 'members': return <Members />
      case 'cases': return <Cases />
      case 'programmes': return <Programmes />
      case 'donations': return <Donations />
      case 'disbursements': return <Disbursements />
      case 'compliance': return <Compliance />
      case 'admin': return <Admin />
      case 'reports': return <Reports />
      case 'activities': return <Activities />
      case 'ai': return <AITools />
      case 'volunteers': return <Volunteers />
      case 'donors': return <Donors />
      case 'documents': return <Documents />
      case 'openclaw-mcp': return <MCPServers />
      case 'openclaw-plugins': return <Plugins />
      case 'openclaw-integrations': return <Integrations />
      case 'openclaw-terminal': return <TerminalPage />
      case 'openclaw-agents': return <Agents />
      case 'openclaw-models': return <Models />
      case 'openclaw-automation': return <Automation />
      case 'ekyc': return <EKYC />
      case 'tapsecure': return <TapSecure />
      default: return <Dashboard />
    }
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err))
    setError(e)
    setHasError(true)
    return null
  }
}

export default function Home() {
  const { currentView, toggleSidebar, setCommandPaletteOpen } = useAppStore()
  const { theme, setTheme } = useTheme()
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setCommandPaletteOpen])

  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between h-14 px-4 lg:px-6">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar} aria-label="Toggle menu">
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2 text-sm">
                <Flower2 className="h-4 w-4 text-purple-600 hidden sm:block" />
                <span className="font-medium truncate max-w-xs sm:max-w-md">
                  {viewLabels[currentView] || 'Dashboard'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="hidden md:flex gap-2 text-xs text-muted-foreground h-8 px-3" onClick={() => setCommandPaletteOpen(true)}>
                <Command className="h-3 w-3" />
                <span>Ctrl+K</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
              <div className="flex items-center gap-2 ml-1">
                <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">A</div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium leading-tight">Admin</p>
                  <p className="text-xs text-muted-foreground leading-tight">Pentadbir</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <Suspense fallback={<PageLoader />} key={currentView}>
            <ViewRenderer view={currentView} />
          </Suspense>
        </main>
        <footer className="border-t bg-background px-4 lg:px-6 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Flower2 className="h-3 w-3 text-purple-600" />
              <span>© 2026 PUSPA — Pertubuhan Urus Peduli Asnaf KL & Selangor</span>
            </div>
            <div className="flex items-center gap-3">
              <span>v2.1.0</span>
              <span>•</span>
              <span>PPM-006-14-14032020</span>
            </div>
          </div>
        </footer>
      </div>
      <Toaster position="top-right" richColors />
      <CommandPalette />
    </div>
  )
}
