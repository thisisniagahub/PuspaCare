'use client';

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
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
  ChevronRight,
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

// ═══════════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════════

type LucideIcon = React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number | string }>;

type NavItem = {
  id: ViewId;
  label: string;
  icon: LucideIcon;
};

type NavGroup = {
  title: string;
  items: NavItem[];
  /** If true, items are visually grouped under a sub-label (e.g. OpenClaw) */
  subGroup?: string;
};

// ═══════════════════════════════════════════════════════════════════════════════
// Navigation configuration — organized by business function
// ═══════════════════════════════════════════════════════════════════════════════

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Menu Utama',
    items: [
      { id: 'dashboard' as ViewId, label: 'Dashboard', icon: LayoutDashboard },
      { id: 'members' as ViewId, label: 'Ahli Asnaf', icon: Users },
      { id: 'cases' as ViewId, label: 'Kes Bantuan', icon: FileText },
      { id: 'programmes' as ViewId, label: 'Program', icon: Heart },
      { id: 'donations' as ViewId, label: 'Donasi', icon: HandCoins },
      { id: 'disbursements' as ViewId, label: 'Pembayaran', icon: Banknote },
    ],
  },
  {
    title: 'Keselamatan & Compliance',
    items: [
      { id: 'compliance' as ViewId, label: 'Dashboard Compliance', icon: ShieldCheck },
      { id: 'reports' as ViewId, label: 'Laporan Kewangan', icon: BarChart3 },
      { id: 'ekyc' as ViewId, label: 'eKYC Verification', icon: ScanFace },
      { id: 'tapsecure' as ViewId, label: 'TapSecure', icon: Fingerprint },
    ],
  },
  {
    title: 'Operasi',
    items: [
      { id: 'activities' as ViewId, label: 'Aktiviti', icon: Kanban },
      { id: 'volunteers' as ViewId, label: 'Sukarelawan', icon: UserCheck },
      { id: 'donors' as ViewId, label: 'Penderma', icon: Gift },
      { id: 'documents' as ViewId, label: 'Dokumen', icon: FolderOpen },
      { id: 'docs' as ViewId, label: 'Panduan', icon: BookOpen },
    ],
  },
  {
    title: 'AI & Automasi',
    subGroup: 'OpenClaw',
    items: [
      { id: 'ai' as ViewId, label: 'Alat AI', icon: Sparkles },
      { id: 'openclaw-mcp' as ViewId, label: 'Pelayan MCP', icon: Server },
      { id: 'openclaw-plugins' as ViewId, label: 'Plugins', icon: Puzzle },
      { id: 'openclaw-integrations' as ViewId, label: 'Integrations', icon: LinkIcon },
      { id: 'openclaw-terminal' as ViewId, label: 'Terminal', icon: Terminal },
      { id: 'openclaw-agents' as ViewId, label: 'Ejen AI', icon: Bot },
      { id: 'openclaw-models' as ViewId, label: 'Models', icon: Cpu },
      { id: 'openclaw-automation' as ViewId, label: 'Automasi', icon: Clock },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════════════════════════════

const BRAND_COLOR = '#4B0082';

// ═══════════════════════════════════════════════════════════════════════════════
// SidebarBrand — Logo + organization name
// ═══════════════════════════════════════════════════════════════════════════════

function SidebarBrand({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={cn(
      'flex items-center px-4 py-5 transition-all duration-300 ease-in-out',
      collapsed ? 'justify-center' : 'gap-3',
    )}>
      <div className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm transition-all duration-300',
        'bg-white ring-1 ring-purple-100 dark:bg-purple-950/50 dark:ring-purple-800/50',
      )}>
        <Image
          src="/puspa-logo-official.png"
          alt="PUSPA Logo"
          width={40}
          height={40}
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
        <span
          className="text-lg font-bold tracking-tight whitespace-nowrap"
          style={{ color: BRAND_COLOR }}
        >
          PUSPA
        </span>
        <span className="text-[11px] leading-tight text-muted-foreground whitespace-nowrap">
          Pertubuhan Urus Peduli Asnaf
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NavItemButton — Single navigation link with active indicator
// ═══════════════════════════════════════════════════════════════════════════════

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
        collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2 pl-3.5',
        'outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2',
        isActive
          ? 'text-white shadow-sm'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
      style={
        isActive
          ? { background: `linear-gradient(135deg, ${BRAND_COLOR}, #6B21A8)`, boxShadow: `0 2px 8px ${BRAND_COLOR}30` }
          : undefined
      }
    >
      {/* Active left bar indicator */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-white/80" />
      )}
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

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8} className="font-medium">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}

// ═══════════════════════════════════════════════════════════════════════════════
// NavSectionLabel — Group title (e.g. "Menu Utama")
// ═══════════════════════════════════════════════════════════════════════════════

function NavSectionLabel({ title, collapsed }: { title: string; collapsed: boolean }) {
  return (
    <h3
      className={cn(
        'mb-1 font-semibold uppercase tracking-wider text-muted-foreground/50 transition-all duration-300 ease-in-out select-none',
        collapsed
          ? 'max-h-0 overflow-hidden opacity-0 px-0 text-[0px]'
          : 'px-3 text-[10px] pt-3 pb-1',
      )}
    >
      {title}
    </h3>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NavSubGroupLabel — Sub-group label (e.g. "OpenClaw" divider)
// ═══════════════════════════════════════════════════════════════════════════════

function NavSubGroupLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-center py-1.5">
            <div className="h-5 w-5 rounded-md bg-muted/60 flex items-center justify-center">
              <span className="text-[8px] font-bold text-muted-foreground">OC</span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8} className="text-xs font-medium">
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 pt-4 pb-1 select-none">
      <div className="flex items-center gap-1.5 text-muted-foreground/70">
        <ChevronRight className="h-3 w-3" />
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex-1 h-px bg-border/60" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NavGroupRenderer — Renders a full navigation group with optional sub-group
// ═══════════════════════════════════════════════════════════════════════════════

function NavGroupRenderer({
  group,
  currentView,
  onNavigate,
  collapsed,
  isLastGroup,
}: {
  group: NavGroup;
  currentView: ViewId;
  onNavigate: (id: ViewId) => void;
  collapsed: boolean;
  isLastGroup: boolean;
}) {
  return (
    <div className={cn(collapsed ? 'px-2' : 'px-2.5')}>
      {/* Section title */}
      <NavSectionLabel title={group.title} collapsed={collapsed} />

      {/* Sub-group divider (e.g. OpenClaw) before items */}
      {group.subGroup && (
        <NavSubGroupLabel label={group.subGroup} collapsed={collapsed} />
      )}

      {/* Navigation items */}
      <div className="flex flex-col gap-0.5">
        {group.items.map((item, idx) => {
          const isSubItem = group.subGroup && idx > 0;

          return (
            <NavItemButton
              key={item.id}
              item={item}
              isActive={currentView === item.id}
              onClick={() => onNavigate(item.id)}
              collapsed={collapsed}
            />
          );
        })}
      </div>

      {/* Bottom spacer for all groups except last */}
      {!isLastGroup && (
        <div className={cn(
          'my-2 transition-all duration-300',
          collapsed ? 'mx-auto w-6' : 'w-full',
        )}>
          <Separator className="bg-border/40" />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SidebarFooter — Bottom section with org info
// ═══════════════════════════════════════════════════════════════════════════════

function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  const content = (
    <div className={cn(
      'px-4 py-3 transition-all duration-300',
      collapsed ? 'flex justify-center' : '',
    )}>
      <div
        className={cn(
          'flex items-center gap-3 transition-all duration-300 ease-in-out overflow-hidden',
          collapsed ? 'justify-center' : '',
        )}
      >
        <div className={cn(
          'flex shrink-0 items-center justify-center rounded-lg',
          'bg-purple-50 dark:bg-purple-950/40',
          collapsed ? 'h-8 w-8' : 'h-9 w-9',
        )}>
          <Image
            src="/puspa-logo-official.png"
            alt="PUSPA"
            width={collapsed ? 18 : 22}
            height={collapsed ? 18 : 22}
            className="object-contain"
          />
        </div>
        <div
          className={cn(
            'flex flex-col gap-0.5 overflow-hidden transition-all duration-300 ease-in-out',
            collapsed ? 'max-h-0 max-w-0 opacity-0' : 'max-h-10 max-w-[180px] opacity-100',
          )}
        >
          <span
            className="text-xs font-semibold whitespace-nowrap"
            style={{ color: BRAND_COLOR }}
          >
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
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8} className="text-xs">
          <div className="font-semibold" style={{ color: BRAND_COLOR }}>PUSPA KL & Selangor</div>
          <div className="text-muted-foreground">v2.1.0</div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SidebarContent — Shared inner layout (mobile Sheet + desktop aside)
// ═══════════════════════════════════════════════════════════════════════════════

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

  const isCollapsed = !!collapsed;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="relative flex h-full flex-col bg-card">
        {/* Brand header */}
        <SidebarBrand collapsed={isCollapsed} />

        {/* Mobile close button */}
        {onClose && (
          <div className="absolute right-3 top-5 z-10">
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

        <Separator className="mx-4" />

        {/* Navigation */}
        <ScrollArea className="flex-1 py-1">
          <nav className="flex flex-col gap-0" aria-label="Navigasi utama">
            {NAV_GROUPS.map((group, idx) => (
              <NavGroupRenderer
                key={group.title}
                group={group}
                currentView={currentView}
                onNavigate={handleNavigate}
                collapsed={isCollapsed}
                isLastGroup={idx === NAV_GROUPS.length - 1}
              />
            ))}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <Separator className="mx-4" />
        <SidebarFooter collapsed={isCollapsed} />
      </div>
    </TooltipProvider>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// useIsDesktop — Responsive hook via useSyncExternalStore
// ═══════════════════════════════════════════════════════════════════════════════

function useIsDesktop() {
  const desktopMq =
    typeof window !== 'undefined'
      ? window.matchMedia('(min-width: 1024px)')
      : null;

  return useSyncExternalStore(
    useCallback(
      (cb) => {
        desktopMq?.addEventListener('change', cb);
        return () => desktopMq?.removeEventListener('change', cb);
      },
      [desktopMq],
    ),
    () => desktopMq?.matches ?? false,
    () => false,
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AppSidebar — Main export (mobile Sheet + desktop hover-to-expand aside)
// ═══════════════════════════════════════════════════════════════════════════════

export function AppSidebar() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);
  const setView = useAppStore((s) => s.setView);

  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const isDesktop = useIsDesktop();

  // Auto-close mobile Sheet when resizing to desktop
  useEffect(() => {
    if (isDesktop) setSidebarOpen(false);
  }, [isDesktop, setSidebarOpen]);

  const expanded = !isCollapsed || (isCollapsed && isHovered);

  return (
    <>
      {/* ── Mobile/Tablet: Sheet overlay ── */}
      {!isDesktop && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent
            side="left"
            className="w-[280px] p-0"
            aria-describedby={undefined}
          >
            <SheetTitle className="sr-only">Menu Navigasi PUSPA</SheetTitle>
            <SidebarContent
              onNavigate={setView}
              onClose={() => setSidebarOpen(false)}
            />
          </SheetContent>
        </Sheet>
      )}

      {/* ── Desktop: Fixed sidebar with hover expand ── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden border-r border-border bg-card',
          'lg:flex lg:flex-col lg:transition-all lg:duration-300 lg:ease-in-out',
          expanded ? 'lg:w-[260px]' : 'lg:w-[72px]',
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Sidebar navigasi"
      >
        <SidebarContent onNavigate={setView} collapsed={!expanded} />

        {/* Pin/Collapse toggle (visible only when collapsed) */}
        <div className="absolute -right-3 top-7 z-50 hidden lg:flex">
          <Button
            variant="outline"
            size="icon"
            className={cn(
              'h-6 w-6 rounded-full border bg-background shadow-md transition-all duration-200 hover:bg-muted',
              expanded
                ? 'opacity-0 scale-75 pointer-events-none'
                : 'opacity-100 scale-100 pointer-events-auto',
            )}
            onClick={() => setIsCollapsed((prev) => !prev)}
            aria-label={isCollapsed ? 'Pin buka sidebar' : 'Tutup sidebar'}
          >
            <PanelLeftOpen className="h-3 w-3" />
          </Button>
        </div>

        {/* Close button when expanded via hover (not pinned) */}
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
