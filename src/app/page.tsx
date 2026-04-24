'use client'

import { Suspense, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import { normalizeUserRole } from '@/lib/auth-shared'
import { useAppStore } from '@/stores/app-store'
import { cn } from '@/lib/utils'
import { AppSidebar } from '@/components/app-sidebar'
import { NotificationBell } from '@/components/notification-bell'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Toaster } from 'sonner'
import Image from 'next/image'
import { Menu, Moon, Sun, Command } from 'lucide-react'
import { useTheme } from 'next-themes'
import { CommandPalette } from '@/components/command-palette'

// Loading placeholder for modules
const ModuleLoader = () => (
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
  </div>
)

// Dynamic imports with specific loading states
const Dashboard = dynamic(() => import('@/modules/dashboard/page'), { loading: ModuleLoader })
const Members = dynamic(() => import('@/modules/members/page'), { loading: ModuleLoader })
const Cases = dynamic(() => import('@/modules/cases/page'), { loading: ModuleLoader })
const Programmes = dynamic(() => import('@/modules/programmes/page'), { loading: ModuleLoader })
const Donations = dynamic(() => import('@/modules/donations/page'), { loading: ModuleLoader })
const Disbursements = dynamic(() => import('@/modules/disbursements/page'), { loading: ModuleLoader })
const Compliance = dynamic(() => import('@/modules/compliance/page'), { loading: ModuleLoader })
const Admin = dynamic(() => import('@/modules/admin/page'), { loading: ModuleLoader })
const Reports = dynamic(() => import('@/modules/reports/page'), { loading: ModuleLoader })
const Activities = dynamic(() => import('@/modules/activities/page'), { loading: ModuleLoader })
const AITools = dynamic(() => import('@/modules/ai/page'), { loading: ModuleLoader })
const Volunteers = dynamic(() => import('@/modules/volunteers/page'), { loading: ModuleLoader })
const Donors = dynamic(() => import('@/modules/donors/page'), { loading: ModuleLoader })
const Documents = dynamic(() => import('@/modules/documents/page'), { loading: ModuleLoader })
const MCPServers = dynamic(() => import('@/modules/openclaw/mcp'), { loading: ModuleLoader })
const Plugins = dynamic(() => import('@/modules/openclaw/plugins'), { loading: ModuleLoader })
const Integrations = dynamic(() => import('@/modules/openclaw/integrations'), { loading: ModuleLoader })
const TerminalPage = dynamic(() => import('@/modules/openclaw/terminal'), { loading: ModuleLoader })
const Agents = dynamic(() => import('@/modules/openclaw/agents'), { loading: ModuleLoader })
const Models = dynamic(() => import('@/modules/openclaw/models'), { loading: ModuleLoader })
const Automation = dynamic(() => import('@/modules/openclaw/automation'), { loading: ModuleLoader })
const EKYC = dynamic(() => import('@/modules/ekyc/page'), { loading: ModuleLoader })
const TapSecure = dynamic(() => import('@/modules/tapsecure/page'), { loading: ModuleLoader })
const SedekahJumaat = dynamic(() => import('@/modules/sedekah-jumaat/page'), { loading: ModuleLoader })
const Docs = dynamic(() => import('@/modules/docs/page'), { loading: ModuleLoader })
const AgihanBulan = dynamic(() => import('@/modules/agihan-bulan/page'), { loading: ModuleLoader })
const OpsConductor = dynamic(() => import('@/modules/ops-conductor/page'), { loading: ModuleLoader })
const Asnafpreneur = dynamic(() => import('@/modules/asnafpreneur/page'), { loading: ModuleLoader })

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
  compliance: 'Compliance',
  admin: 'Pentadbiran',
  reports: 'Laporan Kewangan',
  activities: 'Aktiviti',
  ai: 'Alat AI',
  volunteers: 'Sukarelawan',
  donors: 'Penderma',
  documents: 'Dokumen',
  'openclaw-mcp': 'AI Ops — Pelayan MCP',
  'openclaw-plugins': 'AI Ops — Sambungan',
  'openclaw-integrations': 'AI Ops — Gateway & Channel',
  'openclaw-terminal': 'AI Ops — Console Operator',
  'openclaw-agents': 'AI Ops — Ejen AI',
  'openclaw-models': 'AI Ops — Enjin Model',
  'openclaw-automation': 'AI Ops — Automasi',
  'ekyc': 'eKYC',
  'tapsecure': 'TapSecure',
  'sedekah-jumaat': 'Sedekah Jumaat',
  docs: 'Panduan',
  'agihan-bulan': 'Agihan Bulanan',
  'ops-conductor': 'Ops Conductor',
  'asnafpreneur': 'Asnafpreneur',
}

function ViewRenderer({ view }: { view: string }) {
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
    case 'sedekah-jumaat': return <SedekahJumaat />
    case 'docs': return <Docs />
    case 'agihan-bulan': return <AgihanBulan />
    case 'ops-conductor': return <OpsConductor />
    case 'asnafpreneur': return <Asnafpreneur />
    default: return <Dashboard />
  }
}

export default function Home() {
  const router = useRouter()
  const currentView = useAppStore((s) => s.currentView)
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)
  const setCommandPaletteOpen = useAppStore((s) => s.setCommandPaletteOpen)
  const { data: session, status } = useSession()
  const { theme, setTheme } = useTheme()

  // Dynamic margin logic to prevent overlap with Sidebar
  // On desktop, we handle the space based on sidebar state
  // On mobile, it's a full-width container with a sheet overlay
  const effectiveRole = normalizeUserRole(session?.user?.role)
  const displayName = session?.user?.name || session?.user?.email || 'Pengguna PUSPA'
  const avatarLabel = displayName.trim().charAt(0).toUpperCase() || 'P'

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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
    }
  }, [router, status])

  if (status !== 'authenticated') {
    return (
      <div className="min-h-screen bg-background">
        <PageLoader />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      <AppSidebar />
      <div 
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out overflow-y-auto overflow-x-hidden",
          "lg:ml-[72px]", 
        )}
      >
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between h-14 px-4 sm:px-6">
            <div className="flex items-center gap-2.5 min-w-0">
              <Button variant="ghost" size="icon" className="lg:hidden shrink-0" onClick={toggleSidebar} aria-label="Toggle menu">
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2 min-w-0">
                <Image
                  src="/puspa-logo-official.png"
                  alt="PUSPA"
                  width={28}
                  height={28}
                  className="hidden sm:block shrink-0 object-contain"
                />
                <span className="font-semibold truncate" style={{ color: '#4B0082' }}>
                  {viewLabels[currentView] || 'Dashboard'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button variant="outline" size="sm" className="hidden sm:flex gap-2 text-xs text-muted-foreground h-8 px-3" onClick={() => setCommandPaletteOpen(true)}>
                <Command className="h-3 w-3" />
                <span className="hidden md:inline">Cari modul…</span>
                <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded border bg-muted px-1 py-0.5 font-mono text-[10px] font-normal text-muted-foreground">⌘K</kbd>
              </Button>
              <Button variant="ghost" size="icon" className="relative h-8 w-8 shrink-0" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
              <NotificationBell />
              <div className="flex items-center gap-2 ml-0.5 pl-2.5 border-l border-border">
                <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: '#4B0082' }}>
                  {avatarLabel}
                </div>
                <div className="hidden sm:flex sm:flex-col">
                  <p className="text-sm font-medium leading-tight">{displayName}</p>
                  <p className="text-[10px] leading-tight font-medium px-1.5 py-0 w-fit rounded" style={{ color: '#4B0082', backgroundColor: '#4B008214' }}>
                    {effectiveRole === 'developer' ? 'Developer' : effectiveRole === 'admin' ? 'Pentadbir' : 'Staf'}
                  </p>
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
              <Image
                src="/puspa-logo-official.png"
                alt="PUSPA"
                width={20}
                height={20}
                className="object-contain opacity-80"
              />
              <span className="font-medium" style={{ color: '#4B0082' }}>© 2026 PUSPA</span>
              <span className="text-muted-foreground">— Pertubuhan Urus Peduli Asnaf KL & Selangor</span>
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
