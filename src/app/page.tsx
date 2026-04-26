'use client'

import { Suspense, useEffect, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import { normalizeUserRole } from '@/lib/auth-shared'
import { initializePlugins } from '@/lib/plugins/init'
import { canAccessView } from '@/lib/access-control'
import { useAppStore } from '@/stores/app-store'
import { cn } from '@/lib/utils'
import { AppSidebar } from '@/components/app-sidebar'
import { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_EXPANDED_WIDTH, VIEW_LABELS } from '@/components/sidebar/sidebar-config'
import { NotificationBell } from '@/components/notification-bell'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Toaster } from 'sonner'
import Image from 'next/image'
import { Menu, Moon, Sun, Command } from 'lucide-react'
import { useTheme } from 'next-themes'
import { CommandPalette } from '@/components/command-palette'
import { motion, AnimatePresence } from 'framer-motion'
import Aurora from '@/components/Aurora'
import type { ViewId } from '@/types'

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
const GraphView = dynamic(() => import('@/modules/openclaw/graph/page'), { loading: ModuleLoader })
const EKYC = dynamic(() => import('@/modules/ekyc/page'), { loading: ModuleLoader })
const TapSecure = dynamic(() => import('@/modules/tapsecure/page'), { loading: ModuleLoader })
const SedekahJumaat = dynamic(() => import('@/modules/sedekah-jumaat/page'), { loading: ModuleLoader })
const Docs = dynamic(() => import('@/modules/docs/page'), { loading: ModuleLoader })
const AgihanBulan = dynamic(() => import('@/modules/agihan-bulan/page'), { loading: ModuleLoader })
const OpsConductor = dynamic(() => import('@/modules/ops-conductor/page'), { loading: ModuleLoader })
const Asnafpreneur = dynamic(() => import('@/modules/asnafpreneur/page'), { loading: ModuleLoader })
const KelasAI = dynamic(() => import('@/modules/kelas-ai/page'), { loading: ModuleLoader })
const GudangBarangan = dynamic(() => import('@/modules/gudang-barangan/page'), { loading: ModuleLoader })

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
  ...VIEW_LABELS,
  dashboard: 'Dashboard',
}

function ViewRenderer({ view }: { view: string }) {
  return (
    <motion.div
      key={view}
      initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -10, filter: 'blur(8px)' }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="h-full w-full"
    >
      {(() => {
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
                            case 'openclaw-graph': return <GraphView />
                            case 'ekyc': return <EKYC />
          case 'tapsecure': return <TapSecure />
          case 'sedekah-jumaat': return <SedekahJumaat />
          case 'docs': return <Docs />
          case 'agihan-bulan': return <AgihanBulan />
          case 'ops-conductor': return <OpsConductor />
          case 'asnafpreneur': return <Asnafpreneur />
          case 'kelas-ai': return <KelasAI />
          case 'gudang-barangan': return <GudangBarangan />
          default: return <Dashboard />
        }
      })()}
    </motion.div>
  )
}

initializePlugins();

export default function Home() {
  const router = useRouter()
  const currentView = useAppStore((s) => s.currentView)
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)
  const setCommandPaletteOpen = useAppStore((s) => s.setCommandPaletteOpen)
  const setView = useAppStore((s) => s.setView)
  const { data: session, status } = useSession()
  const { theme, setTheme } = useTheme()

  // Dynamic margin logic to prevent overlap with Sidebar
  // On desktop, we handle the space based on sidebar state
  // On mobile, it's a full-width container with a sheet overlay
  const effectiveRole = normalizeUserRole(session?.user?.role)
  const safeCurrentView: ViewId = canAccessView(currentView, effectiveRole) ? currentView : 'dashboard'
  const displayName = session?.user?.name || session?.user?.email || 'Pengguna PUSPA'
  const avatarLabel = displayName.trim().charAt(0).toUpperCase() || 'P'
  const desktopSidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH

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

  useEffect(() => {
    if (status === 'authenticated' && currentView !== safeCurrentView) {
      setView(safeCurrentView)
    }
  }, [currentView, safeCurrentView, setView, status])

  if (status !== 'authenticated') {
    return (
      <div className="min-h-screen bg-background">
        <PageLoader />
      </div>
    )
  }

  const isDark = theme === 'dark'

  return (
    <div className={cn(
      "min-h-screen flex overflow-hidden transition-colors duration-300",
      isDark ? "bg-[#101415]" : "bg-[#fafafa]"
    )}>
      <AppSidebar />
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-[margin,width] duration-300 ease-in-out overflow-y-auto overflow-x-hidden motion-reduce:transition-none lg:ml-[var(--desktop-sidebar-width)]',
        )}
        style={{ '--desktop-sidebar-width': `${desktopSidebarWidth}px` } as CSSProperties}
      >
        <header className={cn(
          "sticky top-0 z-40 border-b backdrop-blur-xl transition-all duration-300",
          isDark ? "bg-black/20 border-white/10" : "bg-white/80 border-black/10"
        )}>
          <div className="flex items-center justify-between h-14 px-4 sm:px-6">
            <div className="flex items-center gap-2.5 min-w-0">
              <Button variant="ghost" size="icon" className="lg:hidden shrink-0" onClick={toggleSidebar} aria-label="Toggle menu">
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2 min-w-0">
                <motion.div
                  key={safeCurrentView}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2"
                >
                  <Image
                    src="/puspa-logo-official.png"
                    alt="PUSPA"
                    width={28}
                    height={28}
                    className="hidden sm:block shrink-0 object-contain"
                  />
                  <span className={cn(
                    "font-bold truncate tracking-tight",
                    isDark ? "text-white" : "text-gray-900"
                  )}>
                    {viewLabels[safeCurrentView] || 'Dashboard'}
                  </span>
                </motion.div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button variant="outline" size="sm" className={cn(
                "hidden sm:flex gap-2 text-xs h-8 px-3",
                isDark ? "text-muted-foreground border-white/10 hover:bg-white/5" : "text-gray-600 border-black/10 hover:bg-black/5"
              )} onClick={() => setCommandPaletteOpen(true)}>
                <Command className="h-3 w-3" />
                <span className="hidden md:inline">Cari modul…</span>
                <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded border bg-muted px-1 py-0.5 font-mono text-[10px] font-normal text-muted-foreground">⌘K</kbd>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8 shrink-0"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                aria-label="Toggle theme"
              >
                <Sun className={cn(
                  "h-4 w-4 transition-all",
                  isDark ? "rotate-0 scale-100" : "rotate-90 scale-0"
                )} />
                <Moon className={cn(
                  "absolute h-4 w-4 transition-all",
                  isDark ? "-rotate-90 scale-0" : "rotate-0 scale-100"
                )} />
              </Button>
              <NotificationBell />
              <div className={cn(
                "flex items-center gap-2 ml-0.5 pl-2.5",
                isDark ? "border-l border-white/10" : "border-l border-black/10"
              )}>
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-[0_0_15px_rgba(75,0,130,0.5)]"
                  style={{ backgroundColor: isDark ? '#4B0082' : '#7c3aed' }}
                >
                  {avatarLabel}
                </div>
                <div className="hidden sm:flex sm:flex-col">
                  <p className={cn(
                    "text-sm font-medium leading-tight",
                    isDark ? "text-white" : "text-gray-900"
                  )}>{displayName}</p>
                  <p className="text-[10px] leading-tight font-bold px-1.5 py-0 w-fit rounded bg-emerald-500/20 text-emerald-600 border border-emerald-500/30">
                    {effectiveRole === 'developer' ? 'Developer' : effectiveRole === 'admin' ? 'Pentadbir' : 'Staf'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 relative overflow-hidden">
          {isDark && (
            <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
              <Aurora
                colorStops={['#4B0082', '#1e1b4b', '#3b82f6']}
                amplitude={1.2}
              />
            </div>
          )}
          <div className="relative z-10 h-full overflow-auto">
            <AnimatePresence mode="wait">
              <ViewRenderer view={safeCurrentView} key={safeCurrentView} />
            </AnimatePresence>
          </div>
        </main>
        <footer className={cn(
          "border-t backdrop-blur-xl px-4 lg:px-6 py-3",
          isDark ? "border-white/10 bg-black/20" : "border-black/10 bg-white/50"
        )}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Image
                src="/puspa-logo-official.png"
                alt="PUSPA"
                width={20}
                height={20}
                className="object-contain opacity-80"
              />
              <span className="font-medium text-emerald-600 dark:text-emerald-400">© 2026 PUSPA</span>
              <span className={isDark ? "text-white/40" : "text-gray-500"}>— Pertubuhan Urus Peduli Asnaf KL & Selangor</span>
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
