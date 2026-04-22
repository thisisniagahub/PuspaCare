'use client';

import { useState } from 'react';
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
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen,
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
    title: 'Sokongan',
    items: [
      { id: 'docs' as ViewId, label: 'Panduan', icon: BookOpen },
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

function SidebarBrand({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={cn(
      'flex items-center px-4 py-4 transition-all duration-300 ease-in-out',
      collapsed ? 'justify-center' : 'gap-3',
    )}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-emerald-600 shadow-lg shadow-purple-600/20 ring-1 ring-purple-100 dark:ring-purple-800/40 transition-all duration-300">
        <Image
          src="/puspa-icon-white.png"
          alt="PUSPA Logo"
          width={30}
          height={30}
          className="object-contain"
          priority
        />
      </div>
      <div
        className={cn(
          'flex flex-col overflow-hidden transition-all duration-300 ease-in-out',
          collapsed ? 'max-h-0 max-w-0 opacity-0' : 'max-h-20 max-w-[200px] opacity-100',
        )}
      >
        <span className="text-lg font-bold tracking-tight text-foreground whitespace-nowrap">
          PUSPA
        </span>
        <span className="text-[11px] leading-tight text-muted-foreground whitespace-nowrap">
          Pertubuhan Urus Peduli Penasaf
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
  collapsed,
}: {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
  collapsed: boolean;
}) {
  const Icon = item.icon;

  const button = (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex w-full items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200',
        collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2',
        'outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2',
        isActive
          ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/25 dark:bg-purple-700 dark:shadow-purple-700/25'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <Icon
        className={cn(
          'h-[18px] w-[18px] shrink-0 transition-all duration-200',
          isActive
            ? 'text-white'
            : 'text-muted-foreground group-hover:text-foreground',
        )}
      />
      <span
        className={cn(
          'truncate whitespace-nowrap transition-all duration-300 ease-in-out',
          collapsed ? 'max-h-0 max-w-0 opacity-0 overflow-hidden' : 'max-h-6 opacity-100',
        )}
      >
        {item.label}
      </span>
    </button>
  );

  // Show tooltip when collapsed
  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent
          side="right"
          sideOffset={8}
          className="font-medium"
        >
          {item.label}
          {isActive && (
            <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-purple-500" />
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}

// ---------------------------------------------------------------------------
// Navigation section
// ---------------------------------------------------------------------------

function NavSectionGroup({
  section,
  currentView,
  onNavigate,
  collapsed,
}: {
  section: NavSection;
  currentView: ViewId;
  onNavigate: (id: ViewId) => void;
  collapsed: boolean;
}) {
  return (
    <div className={cn('py-1.5', collapsed ? 'px-2' : 'px-3')}>
      <h3
        className={cn(
          'mb-1 font-semibold uppercase tracking-wider text-muted-foreground/60 transition-all duration-300 ease-in-out',
          collapsed ? 'max-h-0 overflow-hidden opacity-0 px-0 text-[0px]' : 'px-3 text-[11px]',
        )}
      >
        {section.title}
      </h3>
      <div className="flex flex-col gap-0.5">
        {section.items.map((item) => (
          <NavItemButton
            key={item.id}
            item={item}
            isActive={currentView === item.id}
            onClick={() => onNavigate(item.id)}
            collapsed={collapsed}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar footer
// ---------------------------------------------------------------------------

function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  const footerContent = (
    <div className={cn(
      'mt-auto px-4 py-3 transition-all duration-300',
      collapsed ? 'flex justify-center' : '',
    )}>
      <Separator className={cn('mb-3 bg-border/50', collapsed ? 'w-8 mx-auto' : 'w-auto')} />
      <div
        className={cn(
          'flex items-center gap-3 transition-all duration-300 ease-in-out overflow-hidden',
          collapsed ? 'justify-center' : '',
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
          <Image
            src="/puspa-logo-transparent.png"
            alt="PUSPA"
            width={18}
            height={18}
            className="object-contain"
          />
        </div>
        <div
          className={cn(
            'flex flex-col gap-0.5 overflow-hidden transition-all duration-300 ease-in-out',
            collapsed ? 'max-h-0 max-w-0 opacity-0' : 'max-h-10 max-w-[180px] opacity-100',
          )}
        >
          <span className="text-xs font-medium text-foreground whitespace-nowrap">
            PUSPA KL & Selangor
          </span>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
            v2.1.0
          </span>
        </div>
      </div>
    </div>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{footerContent}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8} className="text-xs">
          <div className="font-medium">PUSPA KL & Selangor</div>
          <div className="text-muted-foreground">v2.1.0</div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return footerContent;
}

// ---------------------------------------------------------------------------
// Sidebar content (shared between mobile sheet & desktop aside)
// ---------------------------------------------------------------------------

function SidebarContent({
  onNavigate,
  onClose,
  collapsed,
}: {
  onNavigate: (id: ViewId) => void;
  onClose?: () => void;
  collapsed?: boolean;
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
        <SidebarBrand collapsed={!!collapsed} />

        {/* Close button (mobile only) */}
        {onClose && (
          <div className="absolute right-3 top-4 md:hidden z-10">
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

        <Separator className={cn('mx-3 w-auto', collapsed ? 'mx-3' : 'mx-4')} />

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <nav
            className="flex flex-col gap-0.5 py-1"
            aria-label="Navigasi utama"
          >
            {NAV_SECTIONS.map((section) => (
              <NavSectionGroup
                key={section.title}
                section={section}
                currentView={currentView}
                onNavigate={handleNavigate}
                collapsed={!!collapsed}
              />
            ))}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <SidebarFooter collapsed={!!collapsed} />
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
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Expanded state: if pinned open, OR if hovered while collapsed
  const expanded = !isCollapsed || (isCollapsed && isHovered);

  return (
    <>
      {/* ── Mobile: Sheet overlay (always fully expanded) ── */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="left"
          className="w-[280px] p-0"
          aria-describedby={undefined}
        >
          <SheetTitle className="sr-only">Menu Navigasi PUSPA</SheetTitle>
          <SidebarContent
            onNavigate={(id) => {
              setView(id);
            }}
            onClose={() => setSidebarOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* ── Desktop: Fixed sidebar with hover expand ── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden border-r border-border bg-card lg:flex lg:flex-col lg:transition-all lg:duration-300 lg:ease-in-out',
          expanded ? 'lg:w-[260px]' : 'lg:w-[72px]',
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Sidebar navigasi"
      >
        <SidebarContent
          onNavigate={(id) => {
            setView(id);
          }}
          collapsed={!expanded}
        />

        {/* Collapse/Pin toggle button */}
        <div
          className={cn(
            'absolute -right-3 top-7 z-50 hidden lg:flex',
          )}
        >
          <Button
            variant="outline"
            size="icon"
            className={cn(
              'h-6 w-6 rounded-full border bg-background shadow-md transition-all duration-200 hover:bg-muted',
              expanded ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100 pointer-events-auto',
            )}
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Buka sidebar' : 'Tutup sidebar'}
          >
            <PanelLeftOpen className="h-3 w-3" />
          </Button>
        </div>

        {/* Close button when expanded via hover */}
        {expanded && isCollapsed && (
          <div className="absolute right-2 top-4 hidden lg:flex">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80"
              onClick={() => setIsHovered(false)}
              aria-label="Tutup sidebar"
            >
              <PanelLeftClose className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}

export default AppSidebar;
