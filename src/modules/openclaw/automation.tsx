'use client';

import { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Clock,
  Play,
  Pause,
  Webhook,
  Plus,
  Settings,
  Activity,
  Calendar,
  Monitor,
  Zap,
  Mail,
  Database,
  FileText,
  ArrowUp,
  ArrowDown,
  Trash2,
  GripVertical,
  CheckCircle2,
  XCircle,
  Link2,
  Bot,
  RefreshCw,
  Workflow,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Eye,
  Save,
} from 'lucide-react';
import { api } from '@/lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AutomationItem {
  id: string;
  name: string;
  description: string;
  schedule: string;
  status: boolean;
  lastRun?: string;
  nextRun?: string;
  icon: React.ReactNode;
  iconColor: string;
  apiEndpoint?: string;
  connected?: boolean;
}

interface WorkflowStep {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'delay' | 'notification';
  name: string;
  config: Record<string, string>;
  icon: React.ReactNode;
}

interface ApiEndpoint {
  path: string;
  method: string;
  description: string;
  module: string;
}

type TabKey = 'jadual' | 'latar' | 'perintah' | 'webhook' | 'aliran';

// ─── API Endpoints (Real Routes) ────────────────────────────────────────────

const availableEndpoints: ApiEndpoint[] = [
  { path: '/api/v1/members', method: 'GET', description: 'Senarai ahli berdaftar', module: 'Ahli' },
  { path: '/api/v1/members', method: 'POST', description: 'Daftar ahli baharu', module: 'Ahli' },
  { path: '/api/v1/members', method: 'PUT', description: 'Kemas kini maklumat ahli', module: 'Ahli' },
  { path: '/api/v1/donations', method: 'GET', description: 'Senarai derma', module: 'Derma' },
  { path: '/api/v1/donations', method: 'POST', description: 'Cipta rekod derma', module: 'Derma' },
  { path: '/api/v1/donors', method: 'GET', description: 'Senarai penderma', module: 'Penderma' },
  { path: '/api/v1/donors/communications', method: 'GET', description: 'Log komunikasi penderma', module: 'Penderma' },
  { path: '/api/v1/programmes', method: 'GET', description: 'Senarai program', module: 'Program' },
  { path: '/api/v1/programmes', method: 'POST', description: 'Cipta program baharu', module: 'Program' },
  { path: '/api/v1/disbursements', method: 'GET', description: 'Senarai pemberian', module: 'Kewangan' },
  { path: '/api/v1/disbursements', method: 'POST', description: 'Cipta pemberian baharu', module: 'Kewangan' },
  { path: '/api/v1/cases', method: 'GET', description: 'Senarai kes kebajikan', module: 'Kes' },
  { path: '/api/v1/cases', method: 'POST', description: 'Buka kes baharu', module: 'Kes' },
  { path: '/api/v1/activities', method: 'GET', description: 'Senarai aktiviti', module: 'Aktiviti' },
  { path: '/api/v1/activities', method: 'POST', description: 'Cipta aktiviti baharu', module: 'Aktiviti' },
  { path: '/api/v1/volunteers', method: 'GET', description: 'Senarai sukarelawan', module: 'Sukarelawan' },
  { path: '/api/v1/volunteers/hours', method: 'POST', description: 'Rekod jam sukarelawan', module: 'Sukarelawan' },
  { path: '/api/v1/documents', method: 'GET', description: 'Senarai dokumen', module: 'Dokumen' },
  { path: '/api/v1/notifications', method: 'POST', description: 'Hantar pemberitahuan', module: 'Notifikasi' },
  { path: '/api/v1/ai/analytics', method: 'GET', description: 'Analitik AI', module: 'AI' },
  { path: '/api/v1/ai/chat', method: 'POST', description: 'Sembang AI', module: 'AI' },
  { path: '/api/v1/integrations/whatsapp', method: 'GET', description: 'Templat WhatsApp', module: 'Integrasi' },
  { path: '/api/v1/integrations/whatsapp', method: 'POST', description: 'Hantar mesej WhatsApp', module: 'Integrasi' },
  { path: '/api/v1/dashboard', method: 'GET', description: 'Data papan pemuka', module: 'Papan Pemuka' },
  { path: '/api/v1/reports', method: 'GET', description: 'Jana laporan', module: 'Laporan' },
  { path: '/api/v1/compliance', method: 'GET', description: 'Semak pematuhan', module: 'Pematuhan' },
];

// ─── Automation Data ────────────────────────────────────────────────────────

const automationData: Record<string, AutomationItem[]> = {
  jadual: [
    {
      id: 'j1', name: 'Laporan Derma Harian',
      description: 'Jana dan hantar ringkasan derma harian kepada pengerusi',
      schedule: 'Setiap hari, 8:00 PG', status: true,
      lastRun: 'Hari ini, 8:00 PG', nextRun: 'Esok, 8:00 PG',
      icon: <Mail className="h-4 w-4" />, iconColor: 'text-emerald-600',
      apiEndpoint: '/api/v1/reports', connected: true,
    },
    {
      id: 'j2', name: 'Semakan Pematuhan',
      description: 'Semak pematuhan dokumen dan prosedur setiap minggu',
      schedule: 'Setiap Isnin, 9:00 PG', status: true,
      lastRun: 'Isnin lepas, 9:00 PG', nextRun: 'Isnin depan, 9:00 PG',
      icon: <FileText className="h-4 w-4" />, iconColor: 'text-amber-600',
      apiEndpoint: '/api/v1/compliance', connected: true,
    },
    {
      id: 'j3', name: 'Sandaran Pangkalan Data',
      description: 'Sandarkan semua data pangkalan data PUSPA secara automatik',
      schedule: 'Setiap hari, 2:00 PG', status: true,
      lastRun: 'Hari ini, 2:00 PG', nextRun: 'Esok, 2:00 PG',
      icon: <Database className="h-4 w-4" />, iconColor: 'text-blue-600',
      connected: true,
    },
    {
      id: 'j4', name: 'Kemas Kini Ahli',
      description: 'Semak dan kemas kini status keahlian ahli yang tamat tempoh',
      schedule: '1hb setiap bulan, 10:00 PG', status: false,
      lastRun: '1 April 2026', nextRun: '1 Mei 2026',
      icon: <Calendar className="h-4 w-4" />, iconColor: 'text-violet-600',
      apiEndpoint: '/api/v1/members', connected: true,
    },
    {
      id: 'j5', name: 'Analitik AI Bulanan',
      description: 'Jana laporan analitik AI secara automatik setiap bulan',
      schedule: '1hb setiap bulan, 6:00 PG', status: true,
      lastRun: '1 April 2026', nextRun: '1 Mei 2026',
      icon: <Bot className="h-4 w-4" />, iconColor: 'text-fuchsia-600',
      apiEndpoint: '/api/v1/ai/analytics', connected: true,
    },
  ],
  latar: [
    {
      id: 'l1', name: 'Pengesanan Penipuan',
      description: 'Analisis transaksi derma secara realtime untuk mengesan aktiviti mencurigakan',
      schedule: 'Berterusan', status: true, lastRun: 'Berjalan',
      icon: <Zap className="h-4 w-4" />, iconColor: 'text-red-600',
      apiEndpoint: '/api/v1/ai/analytics?type=fraud_detection', connected: true,
    },
    {
      id: 'l2', name: 'Penyegerakan Data',
      description: 'Sinkronkan data antara sistem dalaman dan perkhidmatan luaran',
      schedule: 'Setiap 15 minit', status: true, lastRun: '3 minit lalu',
      icon: <Database className="h-4 w-4" />, iconColor: 'text-blue-600',
      connected: true,
    },
    {
      id: 'l3', name: 'Pembersihan Cache',
      description: 'Bersihkan cache data yang sudah lapuk untuk mengoptimumkan prestasi',
      schedule: 'Setiap jam', status: true, lastRun: '15 minit lalu',
      icon: <Monitor className="h-4 w-4" />, iconColor: 'text-orange-600',
      connected: true,
    },
  ],
  perintah: [
    {
      id: 'p1', name: 'Proses Penerimaan Derma',
      description: 'Proses dan rakam derma baharu apabila penerimaan dikonfirmasi',
      schedule: 'Acara: Derma Diterima', status: true,
      icon: <Zap className="h-4 w-4" />, iconColor: 'text-emerald-600',
      apiEndpoint: '/api/v1/donations', connected: true,
    },
    {
      id: 'p2', name: 'Pemberitahuan Ahli Baharu',
      description: 'Hantar emel alu-aluan dan maklumat keahlian kepada ahli baharu',
      schedule: 'Acara: Ahli Didaftarkan', status: true,
      icon: <Mail className="h-4 w-4" />, iconColor: 'text-sky-600',
      apiEndpoint: '/api/v1/notifications', connected: true,
    },
    {
      id: 'p3', name: 'Penjanaan Resit',
      description: 'Jana resit derma secara automatik selepas pembayaran dikonfirmasi',
      schedule: 'Acara: Pembayaran Berjaya', status: false,
      icon: <FileText className="h-4 w-4" />, iconColor: 'text-amber-600',
      apiEndpoint: '/api/v1/donors/receipts', connected: true,
    },
    {
      id: 'p4', name: 'Maklum Pengerusi',
      description: 'Hantar pemberitahuan kepada pengerusi untuk derma melebihi RM10,000',
      schedule: 'Acara: Derma Besar', status: true,
      icon: <Zap className="h-4 w-4" />, iconColor: 'text-rose-600',
      apiEndpoint: '/api/v1/notifications', connected: true,
    },
    {
      id: 'p5', name: 'Kemas Kini Status Kes',
      description: 'Automatik kemas kini status kes berdasarkan tindakan yang diambil',
      schedule: 'Acara: Tindakan Diambil', status: true,
      icon: <Activity className="h-4 w-4" />, iconColor: 'text-violet-600',
      apiEndpoint: '/api/v1/cases', connected: true,
    },
  ],
  webhook: [
    {
      id: 'w1', name: 'Gateway Pembayaran',
      description: 'Menerima webhook dari gateway pembayaran untuk pengesahan transaksi',
      schedule: 'POST /api/payments/callback', status: true,
      lastRun: '2 minit lalu',
      icon: <Webhook className="h-4 w-4" />, iconColor: 'text-emerald-600',
      connected: true,
    },
    {
      id: 'w2', name: 'Penyegerakan CRM',
      description: 'Webhook untuk menyegerakkan data ahli dengan sistem CRM luaran',
      schedule: 'POST /api/crm/sync', status: false,
      lastRun: '3 hari lalu',
      icon: <Webhook className="h-4 w-4" />, iconColor: 'text-violet-600',
      connected: false,
    },
    {
      id: 'w3', name: 'Kemas Kini Laporan',
      description: 'Penerima webhook untuk mencetuskan kemas kini laporan automatik',
      schedule: 'POST /api/reports/update', status: true,
      lastRun: '1 jam lalu',
      icon: <Webhook className="h-4 w-4" />, iconColor: 'text-amber-600',
      apiEndpoint: '/api/v1/reports', connected: true,
    },
  ],
};

// ─── Default Workflow Steps ─────────────────────────────────────────────────

const defaultWorkflowSteps: WorkflowStep[] = [
  {
    id: 'ws-1', type: 'trigger', name: 'Derma Diterima',
    config: { source: 'Webhook Gateway Pembayaran', event: 'payment.confirmed' },
    icon: <Webhook className="h-4 w-4 text-emerald-600" />,
  },
  {
    id: 'ws-2', type: 'action', name: 'Rekod Derma dalam Pangkalan Data',
    config: { endpoint: 'POST /api/v1/donations', module: 'Derma' },
    icon: <Database className="h-4 w-4 text-blue-600" />,
  },
  {
    id: 'ws-3', type: 'condition', name: 'Semak Jumlah > RM 10,000?',
    config: { field: 'amount', operator: '>', value: '10000' },
    icon: <AlertCircle className="h-4 w-4 text-amber-600" />,
  },
  {
    id: 'ws-4', type: 'notification', name: 'Maklum Pengerusi (Jika Ya)',
    config: { channel: 'WhatsApp', template: 'maklum_pengerusi_derma_besar' },
    icon: <Mail className="h-4 w-4 text-rose-600" />,
  },
  {
    id: 'ws-5', type: 'action', name: 'Jana Resit Derma',
    config: { endpoint: 'POST /api/v1/donors/receipts', module: 'Penderma' },
    icon: <FileText className="h-4 w-4 text-violet-600" />,
  },
  {
    id: 'ws-6', type: 'notification', name: 'Hantar Resit kepada Penderma',
    config: { channel: 'Email', template: 'donation_receipt' },
    icon: <Mail className="h-4 w-4 text-sky-600" />,
  },
];

// ─── Tab Config ─────────────────────────────────────────────────────────────

const tabConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  jadual: { label: 'Tugas Berjadual', icon: <Calendar className="h-3.5 w-3.5" /> },
  latar: { label: 'Latar Belakang', icon: <Monitor className="h-3.5 w-3.5" /> },
  perintah: { label: 'Perintah', icon: <Zap className="h-3.5 w-3.5" /> },
  webhook: { label: 'Webhook', icon: <Webhook className="h-3.5 w-3.5" /> },
  aliran: { label: 'Pembina Aliran', icon: <Workflow className="h-3.5 w-3.5" /> },
};

const stepTypeConfig: Record<WorkflowStep['type'], { label: string; color: string }> = {
  trigger: { label: 'Pencetus', color: 'bg-emerald-100 border-emerald-300 text-emerald-700' },
  condition: { label: 'Syarat', color: 'bg-amber-100 border-amber-300 text-amber-700' },
  action: { label: 'Tindakan', color: 'bg-blue-100 border-blue-300 text-blue-700' },
  delay: { label: 'Kelewatan', color: 'bg-slate-100 border-slate-300 text-slate-700' },
  notification: { label: 'Pemberitahuan', color: 'bg-rose-100 border-rose-300 text-rose-700' },
};

// ─── Main Component ─────────────────────────────────────────────────────────

export default function AutomationPage() {
  const [activeTab, setActiveTab] = useState<string>('jadual');
  const [data, setData] = useState(automationData);

  // Workflow builder state
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>(defaultWorkflowSteps);
  const [addStepDialogOpen, setAddStepDialogOpen] = useState(false);
  const [newStepType, setNewStepType] = useState<WorkflowStep['type']>('action');
  const [newStepName, setNewStepName] = useState('');
  const [selectedEndpoint, setSelectedEndpoint] = useState('');
  const [draggedStepId, setDraggedStepId] = useState<string | null>(null);

  // Integration status state
  const [integrationStatus, setIntegrationStatus] = useState<Record<string, 'checking' | 'connected' | 'error'>>({});

  const toggleItem = (tab: string, id: string) => {
    setData((prev) => ({
      ...prev,
      [tab]: prev[tab].map((item: AutomationItem) =>
        item.id === id ? { ...item, status: !item.status } : item
      ),
    }));
  };

  const totalActive = Object.values(data).reduce(
    (sum, items) => sum + items.filter((i: AutomationItem) => i.status).length,
    0
  );
  const totalItems = Object.values(data).reduce(
    (sum, items) => sum + items.length,
    0
  );

  // ── Check Integration Health ──
  const checkIntegrationHealth = useCallback(async (endpoint: string, id: string) => {
    setIntegrationStatus((prev) => ({ ...prev, [id]: 'checking' }));
    try {
      await api.get(endpoint);
      setIntegrationStatus((prev) => ({ ...prev, [id]: 'connected' }));
    } catch {
      setIntegrationStatus((prev) => ({ ...prev, [id]: 'error' }));
    }
  }, []);

  // ── Workflow Builder Handlers ──
  const addWorkflowStep = useCallback(() => {
    if (!newStepName.trim()) return;
    const endpoint = availableEndpoints.find((e) => e.path === selectedEndpoint);
    const step: WorkflowStep = {
      id: `ws-${Date.now()}`,
      type: newStepType,
      name: newStepName,
      config: endpoint
        ? { endpoint: `${endpoint.method} ${endpoint.path}`, module: endpoint.module }
        : {},
      icon: getStepIcon(newStepType),
    };
    setWorkflowSteps((prev) => [...prev, step]);
    setNewStepName('');
    setSelectedEndpoint('');
    setAddStepDialogOpen(false);
  }, [newStepType, newStepName, selectedEndpoint]);

  const removeStep = useCallback((id: string) => {
    setWorkflowSteps((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const moveStep = useCallback((id: string, direction: 'up' | 'down') => {
    setWorkflowSteps((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx < 0) return prev;
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });
  }, []);

  const handleDragStart = useCallback((id: string) => {
    setDraggedStepId(id);
  }, []);

  const handleDrop = useCallback((targetId: string) => {
    if (!draggedStepId || draggedStepId === targetId) return;
    setWorkflowSteps((prev) => {
      const dragIdx = prev.findIndex((s) => s.id === draggedStepId);
      const targetIdx = prev.findIndex((s) => s.id === targetId);
      if (dragIdx < 0 || targetIdx < 0) return prev;
      const item = prev.splice(dragIdx, 1)[0];
      prev.splice(targetIdx, 0, item);
      return [...prev];
    });
    setDraggedStepId(null);
  }, [draggedStepId]);

  const currentTabItems = data[activeTab] || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Automasi & Aliran Kerja
          </h1>
          <p className="text-muted-foreground mt-1">
            Konfigurasi tugas automatik dan aliran kerja untuk menjimatkan masa
          </p>
        </div>
        <Button className="gap-2" onClick={() => setAddStepDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Tambah Automasi
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-100 p-2">
                <Play className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aktif</p>
                <p className="text-2xl font-bold">{totalActive}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-zinc-100 p-2">
                <Pause className="h-4 w-4 text-zinc-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tidak Aktif</p>
                <p className="text-2xl font-bold">{totalItems - totalActive}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <Link2 className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">API Sambungan</p>
                <p className="text-2xl font-bold">{availableEndpoints.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-violet-100 p-2">
                <Activity className="h-4 w-4 text-violet-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Berjalan 24/7</p>
                <p className="text-2xl font-bold">
                  {(data.latar || []).filter((i: AutomationItem) => i.status).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connected Integrations Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Status Sambungan Integrasi
          </CardTitle>
          <CardDescription>Semak kesihatan sambungan automasi ke API dalaman</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Ahli', endpoint: '/api/v1/members', icon: <Database className="h-3.5 w-3.5" /> },
              { label: 'Derma', endpoint: '/api/v1/donations', icon: <Zap className="h-3.5 w-3.5" /> },
              { label: 'Program', endpoint: '/api/v1/programmes', icon: <Activity className="h-3.5 w-3.5" /> },
              { label: 'AI', endpoint: '/api/v1/ai/analytics', icon: <Bot className="h-3.5 w-3.5" /> },
              { label: 'Kewangan', endpoint: '/api/v1/disbursements', icon: <FileText className="h-3.5 w-3.5" /> },
              { label: 'WhatsApp', endpoint: '/api/v1/integrations/whatsapp', icon: <Mail className="h-3.5 w-3.5" /> },
            ].map((item) => (
              <button
                key={item.endpoint}
                onClick={() => checkIntegrationHealth(item.endpoint, item.endpoint)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg border hover:bg-muted/50 transition-colors text-center"
              >
                <div className="text-muted-foreground">{item.icon}</div>
                <span className="text-xs font-medium">{item.label}</span>
                {integrationStatus[item.endpoint] === 'checking' && (
                  <RefreshCw className="h-3 w-3 text-blue-500 animate-spin" />
                )}
                {integrationStatus[item.endpoint] === 'connected' && (
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                )}
                {integrationStatus[item.endpoint] === 'error' && (
                  <XCircle className="h-3 w-3 text-red-500" />
                )}
                {!integrationStatus[item.endpoint] && (
                  <Eye className="h-3 w-3 text-muted-foreground" />
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Klik pada modul untuk menyemak status sambungan secara langsung
          </p>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          {(Object.keys(tabConfig) as string[]).map((key) => (
            <TabsTrigger
              key={key}
              value={key}
              className="gap-1.5 text-xs sm:text-sm"
            >
              {tabConfig[key].icon}
              <span className="hidden sm:inline">{tabConfig[key].label}</span>
              <span className="sm:hidden">{tabConfig[key].label.split(' ')[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Standard Automation Tabs ── */}
        {(Object.keys(tabConfig) as string[]).filter((t) => t !== 'aliran').map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {(data[tab] || []).filter((i: AutomationItem) => i.status).length} daripada{' '}
                {(data[tab] || []).length} tugas aktif
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {(data[tab] || []).map((item: AutomationItem) => (
                <Card
                  key={item.id}
                  className={`transition-all hover:shadow-md ${!item.status ? 'opacity-70' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`rounded-lg p-2 shrink-0 ${item.status ? 'bg-muted' : 'bg-zinc-100'}`}>
                          <span className={item.iconColor}>{item.icon}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium text-sm truncate">{item.name}</h3>
                            <Badge
                              variant={item.status ? 'default' : 'outline'}
                              className={`shrink-0 text-xs ${item.status ? 'bg-emerald-600 hover:bg-emerald-700' : 'text-muted-foreground'}`}
                            >
                              {item.status ? 'Aktif' : 'Berhenti'}
                            </Badge>
                            {item.connected !== false && (
                              <Badge variant="outline" className="shrink-0 text-[10px] bg-emerald-50 text-emerald-600 border-emerald-200">
                                <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />Sambung
                              </Badge>
                            )}
                            {item.connected === false && (
                              <Badge variant="outline" className="shrink-0 text-[10px] bg-red-50 text-red-600 border-red-200">
                                <XCircle className="h-2.5 w-2.5 mr-0.5" />Terputus
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />{item.schedule}
                            </span>
                          </div>
                          {item.lastRun && (
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <span>Terakhir: {item.lastRun}</span>
                              {item.nextRun && <span>Seterusnya: {item.nextRun}</span>}
                            </div>
                          )}
                          {item.apiEndpoint && (
                            <div className="mt-2 flex items-center gap-1.5">
                              <Badge variant="outline" className="text-[10px] font-mono bg-slate-50">
                                {item.apiEndpoint}
                              </Badge>
                              <button
                                onClick={() => checkIntegrationHealth(item.apiEndpoint!, item.id)}
                                className="text-muted-foreground hover:text-blue-600 transition-colors"
                                title="Semak sambungan"
                              >
                                {integrationStatus[item.id] === 'checking' ? (
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                ) : integrationStatus[item.id] === 'connected' ? (
                                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                ) : integrationStatus[item.id] === 'error' ? (
                                  <XCircle className="h-3 w-3 text-red-500" />
                                ) : (
                                  <ExternalLink className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Switch
                          checked={item.status}
                          onCheckedChange={() => toggleItem(tab, item.id)}
                        />
                        <Button variant="ghost" size="sm">
                          <Settings className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* TAB: PEMBINA ALIRAN KERJA                                           */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="aliran" className="mt-4 space-y-6">
          {/* Workflow Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Workflow Builder */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Workflow className="h-5 w-5" />
                      Pembina Aliran Kerja
                    </CardTitle>
                    <CardDescription>Susun langkah automasi dengan seret dan lepas</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setAddStepDialogOpen(true)}>
                      <Plus className="h-3.5 w-3.5" />Tambah Langkah
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Save className="h-3.5 w-3.5" />Simpan
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[500px]">
                  <div className="space-y-2">
                    {workflowSteps.map((step, idx) => (
                      <div
                        key={step.id}
                        draggable
                        onDragStart={() => handleDragStart(step.id)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop(step.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg border bg-white transition-all ${
                          draggedStepId === step.id ? 'opacity-50 border-dashed' : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-0.5 text-muted-foreground shrink-0">
                          <button onClick={() => moveStep(step.id, 'up')} disabled={idx === 0} className="hover:text-slate-700 disabled:opacity-30">
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <GripVertical className="h-4 w-4 cursor-grab" />
                          <button onClick={() => moveStep(step.id, 'down')} disabled={idx === workflowSteps.length - 1} className="hover:text-slate-700 disabled:opacity-30">
                            <ArrowDown className="h-3 w-3" />
                          </button>
                        </div>

                        <div className={`shrink-0 h-8 w-8 rounded-lg flex items-center justify-center ${stepTypeConfig[step.type].color}`}>
                          {step.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground font-mono">#{idx + 1}</span>
                            <span className="text-sm font-medium truncate">{step.name}</span>
                            <Badge variant="outline" className="text-[10px] shrink-0">{stepTypeConfig[step.type].label}</Badge>
                          </div>
                          {Object.keys(step.config).length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {Object.entries(step.config).map(([k, v]) => (
                                <span key={k} className="text-[10px] text-muted-foreground bg-slate-50 rounded px-1.5 py-0.5">
                                  {k}: {v}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-red-600"
                          onClick={() => removeStep(step.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {workflowSteps.length} langkah dalam aliran kerja
                  </p>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setWorkflowSteps(defaultWorkflowSteps)}>
                    <RefreshCw className="h-3.5 w-3.5" />Tetapkan Semula
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* API Endpoints Reference */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Link2 className="h-5 w-5" />
                  API yang Tersedia
                </CardTitle>
                <CardDescription>Sumber data untuk langkah automasi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-3">
                  <Input placeholder="Cari endpoint..." className="h-8 text-xs" />
                </div>
                <ScrollArea className="max-h-[420px]">
                  <div className="space-y-2">
                    {availableEndpoints.map((ep) => (
                      <button
                        key={`${ep.method}-${ep.path}`}
                        onClick={() => {
                          setSelectedEndpoint(ep.path)
                          setNewStepType('action')
                        }}
                        className={`w-full flex items-start gap-2 p-2 rounded-lg text-left hover:bg-muted/50 transition-colors ${
                          selectedEndpoint === ep.path ? 'bg-muted ring-1 ring-primary' : ''
                        }`}
                      >
                        <Badge
                          variant="outline"
                          className={`shrink-0 text-[10px] font-mono ${
                            ep.method === 'GET' ? 'text-emerald-600 border-emerald-200' :
                            ep.method === 'POST' ? 'text-blue-600 border-blue-200' :
                            ep.method === 'PUT' ? 'text-amber-600 border-amber-200' :
                            'text-red-600 border-red-200'
                          }`}
                        >
                          {ep.method}
                        </Badge>
                        <div className="min-w-0">
                          <p className="text-[10px] font-mono text-muted-foreground truncate">{ep.path}</p>
                          <p className="text-xs">{ep.description}</p>
                        </div>
                        <Badge variant="secondary" className="shrink-0 text-[10px] ml-auto">{ep.module}</Badge>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Step Dialog */}
      <Dialog open={addStepDialogOpen} onOpenChange={setAddStepDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Langkah Automasi</DialogTitle>
            <DialogDescription>Pilih jenis langkah dan konfigurasi sambungan API</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Jenis Langkah</Label>
              <Select value={newStepType} onValueChange={(v) => setNewStepType(v as WorkflowStep['type'])}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(stepTypeConfig).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Nama Langkah</Label>
              <Input
                placeholder="Contoh: Hantar emel kepada penderma"
                value={newStepName}
                onChange={(e) => setNewStepName(e.target.value)}
                className="mt-1.5"
              />
            </div>
            {(newStepType === 'action' || newStepType === 'trigger') && (
              <div>
                <Label className="text-sm font-medium">Titik Akhir API (pilihan)</Label>
                <Select value={selectedEndpoint} onValueChange={setSelectedEndpoint}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Pilih API..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableEndpoints.map((ep) => (
                      <SelectItem key={ep.path} value={ep.path}>
                        {ep.method} {ep.path} — {ep.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button onClick={addWorkflowStep} disabled={!newStepName.trim()} className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Tambah Langkah
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Helper ─────────────────────────────────────────────────────────────────

function getStepIcon(type: WorkflowStep['type']): React.ReactNode {
  switch (type) {
    case 'trigger': return <Webhook className="h-4 w-4 text-emerald-600" />;
    case 'condition': return <AlertCircle className="h-4 w-4 text-amber-600" />;
    case 'action': return <Database className="h-4 w-4 text-blue-600" />;
    case 'delay': return <Clock className="h-4 w-4 text-slate-600" />;
    case 'notification': return <Mail className="h-4 w-4 text-rose-600" />;
  }
}
