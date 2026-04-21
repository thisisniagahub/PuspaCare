'use client';

import { useAppStore } from '@/stores/app-store';
import type { ViewId } from '@/types';
import Image from 'next/image';
import {
  LayoutDashboard,
  Users,
  FileText,
  Heart,
  HandCoins,
  Banknote,
  ShieldCheck,
  BarChart3,
  Kanban,
  UserCheck,
  Gift,
  FolderOpen,
  Sparkles,
  Server,
  Puzzle,
  Link as LinkIcon,
  Terminal,
  Bot,
  Cpu,
  Clock,
  X,
  ScanFace,
  Fingerprint,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type NavItem = {
  id: ViewId;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number | string }>;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

// ---------------------------------------------------------------------------
// Navigation data
// ---------------------------------------------------------------------------

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Utama',
    items: [
      { id: 'dashboard' as ViewId, label: 'Dashboard', icon: LayoutDashboard },
      { id: 'members' as ViewId, label: 'Ahli Asnaf', icon: Users },
      { id: 'cases' as ViewId, label: 'Kes', icon: FileText },
      { id: 'programmes' as ViewId, label: 'Program', icon: Heart },
      { id: 'donations' as ViewId, label: 'Donasi', icon: HandCoins },
      { id: 'disbursements' as ViewId, label: 'Pembayaran', icon: Banknote },
    ],
  },
  {
    title: 'Compliance',
    items: [
      { id: 'compliance' as ViewId, label: 'Dashboard Compliance', icon: ShieldCheck },
      { id: 'reports' as ViewId, label: 'Laporan Kewangan', icon: BarChart3 },
    ],
  },
  {
    title: 'eKYC & Sekuriti',
    items: [
      { id: 'ekyc' as ViewId, label: 'eKYC Verification', icon: ScanFace },
      { id: 'tapsecure' as ViewId, label: 'TapSecure', icon: Fingerprint },
    ],
  },
  {
    title: 'Pengurusan',
    items: [
      { id: 'activities' as ViewId, label: 'Aktiviti', icon: Kanban },
      { id: 'volunteers' as ViewId, label: 'Sukarelawan', icon: UserCheck },
      { id: 'donors' as ViewId, label: 'Penderma', icon: Gift },
      { id: 'documents' as ViewId, label: 'Dokumen', icon: FolderOpen },
    ],
  },
  {
    title: 'AI & Automasi',
    items: [
      { id: 'ai' as ViewId, label: 'Alat AI', icon: Sparkles },
      { id: 'openclaw-mcp' as ViewId, label: 'OpenClaw', icon: Server },
      { id: 'openclaw-plugins' as ViewId, label: 'Plugins', icon: Puzzle },
      { id: 'openclaw-integrations' as ViewId, label: 'Integrations', icon: LinkIcon },
      { id: 'openclaw-terminal' as ViewId, label: 'Terminal', icon: Terminal },
      { id: 'openclaw-agents' as ViewId, label: 'Agents', icon: Bot },
      { id: 'openclaw-models' as ViewId, label: 'Models', icon: Cpu },
      { id: 'openclaw-automation' as ViewId, label: 'Automation', icon: Clock },
    ],
  },
];

// ---------------------------------------------------------------------------
// Sidebar brand header
// ---------------------------------------------------------------------------

function SidebarBrand() {
  return (
    <div className="flex items-center gap-3 px-5 py-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-lg shadow-purple-600/15 ring-1 ring-purple-100 dark:ring-purple-800/40">
        <Image
          src="/puspa-logo-transparent.png"
          alt="PUSPA Logo"
          width={36}
          height={36}
          className="object-contain"
          priority
        />
      </div>
      <div className="flex flex-col">
        <span className="text-lg font-bold tracking-tight text-foreground">
          PUSPA
        </span>
        <span className="text-[11px] leading-tight text-muted-foreground">
          Pertubuhan Urus Peduli Asnaf
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single nav item
// ---------------------------------------------------------------------------

function NavItemButton({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;

  const button = (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
        'outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2',
        isActive
          ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/20 dark:bg-purple-700 dark:shadow-purple-700/20'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <Icon
        className={cn(
          'h-[18px] w-[18px] shrink-0 transition-colors duration-150',
          isActive
            ? 'text-white'
            : 'text-muted-foreground group-hover:text-foreground',
        )}
      />
      <span className="truncate">{item.label}</span>
    </button>
  );

  return button;
}

// ---------------------------------------------------------------------------
// Navigation section
// ---------------------------------------------------------------------------

function NavSectionGroup({
  section,
  currentView,
  onNavigate,
}: {
  section: NavSection;
  currentView: ViewId;
  onNavigate: (id: ViewId) => void;
}) {
  return (
    <div className="px-3 py-2">
      <h3 className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
        {section.title}
      </h3>
      <div className="flex flex-col gap-0.5">
        {section.items.map((item) => (
          <NavItemButton
            key={item.id}
            item={item}
            isActive={currentView === item.id}
            onClick={() => onNavigate(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar footer
// ---------------------------------------------------------------------------

function SidebarFooter() {
  return (
    <div className="mt-auto px-5 py-4">
      <Separator className="mb-4 bg-border/50" />
      <div className="flex items-center gap-3">
        <Image
          src="/puspa-logo-transparent.png"
          alt="PUSPA"
          width={24}
          height={24}
          className="opacity-60"
        />
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-foreground">
            PUSPA KL &amp; Selangor
          </span>
          <span className="text-[11px] text-muted-foreground">v2.1.0 • PPM-006-14-14032020</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar content (shared between mobile sheet & desktop aside)
// ---------------------------------------------------------------------------

function SidebarContent({
  onNavigate,
  onClose,
}: {
  onNavigate: (id: ViewId) => void;
  onClose?: () => void;
}) {
  const currentView = useAppStore((s) => s.currentView);

  const handleNavigate = (id: ViewId) => {
    onNavigate(id);
    onClose?.();
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-full flex-col bg-card">
        {/* Brand */}
        <SidebarBrand />

        {/* Close button (mobile only) */}
        {onClose && (
          <div className="absolute right-3 top-4 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={onClose}
              aria-label="Tutup menu"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <Separator className="mx-4 w-auto" />

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <nav
            className="flex flex-col gap-1 py-2"
            aria-label="Navigasi utama"
          >
            {NAV_SECTIONS.map((section) => (
              <NavSectionGroup
                key={section.title}
                section={section}
                currentView={currentView}
                onNavigate={handleNavigate}
              />
            ))}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <SidebarFooter />
      </div>
    </TooltipProvider>
  );
}

// ---------------------------------------------------------------------------
// Main sidebar export
// ---------------------------------------------------------------------------

export function AppSidebar() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);
  const setView = useAppStore((s) => s.setView);

  return (
    <>
      {/* ── Mobile: Sheet overlay ── */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="left"
          className="w-[280px] p-0"
          aria-describedby={undefined}
        >
          {/* SheetTitle is required for a11y but visually hidden via sr-only */}
          <SheetTitle className="sr-only">Menu Navigasi PUSPA</SheetTitle>
          <SidebarContent
            onNavigate={(id) => {
              setView(id);
            }}
            onClose={() => setSidebarOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* ── Desktop: Fixed sidebar ── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden w-[280px] border-r border-border bg-card transition-transform duration-300 ease-in-out md:block',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Sidebar navigasi"
      >
        <SidebarContent
          onNavigate={(id) => {
            setView(id);
          }}
        />
      </aside>
    </>
  );
}

export default AppSidebar;
