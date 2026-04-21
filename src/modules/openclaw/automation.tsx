'use client';

import { useState } from 'react';
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
import {
  Clock,
  Play,
  Pause,
  Terminal,
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
} from 'lucide-react';

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
}

type TabKey = 'jadual' | 'latar' | 'perintah' | 'webhook';

const automationData: Record<TabKey, AutomationItem[]> = {
  jadual: [
    {
      id: 'j1',
      name: 'Laporan Derma Harian',
      description: 'Jana dan hantar ringkasan derma harian kepada pengerusi',
      schedule: 'Setiap hari, 8:00 PG',
      status: true,
      lastRun: 'Hari ini, 8:00 PG',
      nextRun: 'Esok, 8:00 PG',
      icon: <Mail className="h-4 w-4" />,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'j2',
      name: 'Semakan Pematuhan',
      description: 'Semak pematuhan dokumen dan prosedur setiap minggu',
      schedule: 'Setiap Isnin, 9:00 PG',
      status: true,
      lastRun: 'Isnin lepas, 9:00 PG',
      nextRun: 'Isnin depan, 9:00 PG',
      icon: <FileText className="h-4 w-4" />,
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      id: 'j3',
      name: 'Sandaran Pangkalan Data',
      description: 'Sandarkan semua data pangkalan data PUSPA secara automatik',
      schedule: 'Setiap hari, 2:00 PG',
      status: true,
      lastRun: 'Hari ini, 2:00 PG',
      nextRun: 'Esok, 2:00 PG',
      icon: <Database className="h-4 w-4" />,
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      id: 'j4',
      name: 'Kemas Kini Ahli',
      description: 'Semak dan kemas kini status keahlian ahli yang tamat tempoh',
      schedule: '1hb setiap bulan, 10:00 PG',
      status: false,
      lastRun: '1 Ogos 2024',
      nextRun: '1 September 2024',
      icon: <Calendar className="h-4 w-4" />,
      iconColor: 'text-violet-600 dark:text-violet-400',
    },
  ],
  latar: [
    {
      id: 'l1',
      name: 'Pengesanan Penipuan',
      description: 'Analisis transaksi derma secara realtime untuk mengesan aktiviti mencurigakan',
      schedule: 'Berterusan',
      status: true,
      lastRun: 'Berjalan',
      icon: <Zap className="h-4 w-4" />,
      iconColor: 'text-red-600 dark:text-red-400',
    },
    {
      id: 'l2',
      name: 'Penyegerakan Data',
      description: 'Sinkronkan data antara sistem dalaman dan perkhidmatan luaran',
      schedule: 'Setiap 15 minit',
      status: true,
      lastRun: '3 minit lalu',
      icon: <Database className="h-4 w-4" />,
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      id: 'l3',
      name: 'Pembersihan Cache',
      description: 'Bersihkan cache data yang sudah lapuk untuk mengoptimumkan prestasi',
      schedule: 'Setiap jam',
      status: true,
      lastRun: '15 minit lalu',
      icon: <Monitor className="h-4 w-4" />,
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
  ],
  perintah: [
    {
      id: 'p1',
      name: 'Proses Penerimaan Derma',
      description: 'Proses dan rakam derma baharu apabila penerimaan dikonfirmasi',
      schedule: 'Acara: Derma Diterima',
      status: true,
      icon: <Zap className="h-4 w-4" />,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'p2',
      name: 'Pemberitahuan Ahli Baharu',
      description: 'Hantar emel alu-aluan dan maklumat keahlian kepada ahli baharu',
      schedule: 'Acara: Ahli Didaftarkan',
      status: true,
      icon: <Mail className="h-4 w-4" />,
      iconColor: 'text-sky-600 dark:text-sky-400',
    },
    {
      id: 'p3',
      name: 'Penjanaan Resit',
      description: 'Jana resit derma secara automatik selepas pembayaran dikonfirmasi',
      schedule: 'Acara: Pembayaran Berjaya',
      status: false,
      icon: <FileText className="h-4 w-4" />,
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      id: 'p4',
      name: 'Maklum Pengerusi',
      description: 'Hantar pemberitahuan kepada pengerusi untuk derma melebihi RM10,000',
      schedule: 'Acara: Derma Besar',
      status: true,
      icon: <Zap className="h-4 w-4" />,
      iconColor: 'text-rose-600 dark:text-rose-400',
    },
  ],
  webhook: [
    {
      id: 'w1',
      name: 'Gateway Pembayaran',
      description: 'Menerima webhook dari gateway pembayaran untuk pengesahan transaksi',
      schedule: 'POST /api/payments/callback',
      status: true,
      lastRun: '2 minit lalu',
      icon: <Webhook className="h-4 w-4" />,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'w2',
      name: 'Penyegerakan CRM',
      description: 'Webhook untuk menyegerakkan data ahli dengan sistem CRM luaran',
      schedule: 'POST /api/crm/sync',
      status: false,
      lastRun: '3 hari lalu',
      icon: <Webhook className="h-4 w-4" />,
      iconColor: 'text-violet-600 dark:text-violet-400',
    },
    {
      id: 'w3',
      name: 'Kemas Kini Laporan',
      description: 'Penerima webhook untuk mencetuskan kemas kini laporan automatik',
      schedule: 'POST /api/reports/update',
      status: true,
      lastRun: '1 jam lalu',
      icon: <Webhook className="h-4 w-4" />,
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
  ],
};

const tabConfig: Record<
  TabKey,
  { label: string; icon: React.ReactNode }
> = {
  jadual: { label: 'Tugas Berjadual', icon: <Calendar className="h-3.5 w-3.5" /> },
  latar: { label: 'Tugas Latar Belakang', icon: <Monitor className="h-3.5 w-3.5" /> },
  perintah: { label: 'Perintah Berdiri', icon: <Zap className="h-3.5 w-3.5" /> },
  webhook: { label: 'Webhook', icon: <Webhook className="h-3.5 w-3.5" /> },
};

export default function AutomationPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('jadual');
  const [data, setData] = useState(automationData);

  const toggleItem = (tab: TabKey, id: string) => {
    setData((prev) => ({
      ...prev,
      [tab]: prev[tab].map((item) =>
        item.id === id ? { ...item, status: !item.status } : item
      ),
    }));
  };

  const totalActive = Object.values(data).reduce(
    (sum, items) => sum + items.filter((i) => i.status).length,
    0
  );
  const totalItems = Object.values(data).reduce(
    (sum, items) => sum + items.length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Automasi
          </h1>
          <p className="text-muted-foreground mt-1">
            Konfigurasi tugas automatik untuk menjimatkan masa dan meningkatkan kecekapan
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Automasi
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900">
                <Play className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
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
              <div className="rounded-lg bg-zinc-100 p-2 dark:bg-zinc-800">
                <Pause className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tidak Aktif</p>
                <p className="text-2xl font-bold">
                  {totalItems - totalActive}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Jumlah Tugas</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-violet-100 p-2 dark:bg-violet-900">
                <Activity className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Berjalan 24/7</p>
                <p className="text-2xl font-bold">
                  {data.latar.filter((i) => i.status).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabKey)}
      >
        <TabsList className="grid w-full grid-cols-4">
          {(Object.keys(tabConfig) as TabKey[]).map((key) => (
            <TabsTrigger
              key={key}
              value={key}
              className="gap-1.5 text-xs sm:text-sm"
            >
              {tabConfig[key].icon}
              <span className="hidden sm:inline">{tabConfig[key].label}</span>
              <span className="sm:hidden">
                {tabConfig[key].label.split(' ')[0]}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {(Object.keys(tabConfig) as TabKey[]).map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {data[tab].filter((i) => i.status).length} daripada{' '}
                {data[tab].length} tugas aktif
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {data[tab].map((item) => (
                <Card
                  key={item.id}
                  className={`transition-all hover:shadow-md ${
                    item.status ? '' : 'opacity-70'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                          className={`rounded-lg p-2 shrink-0 ${
                            item.status ? 'bg-muted' : 'bg-zinc-100 dark:bg-zinc-800'
                          }`}
                        >
                          <span className={item.iconColor}>{item.icon}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-sm truncate">
                              {item.name}
                            </h3>
                            <Badge
                              variant={
                                item.status ? 'default' : 'outline'
                              }
                              className={`shrink-0 text-xs ${
                                item.status
                                  ? 'bg-emerald-600 hover:bg-emerald-700'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {item.status ? 'Aktif' : 'Berhenti'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {item.schedule}
                            </span>
                          </div>
                          {item.lastRun && (
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <span>Terakhir: {item.lastRun}</span>
                              {item.nextRun && (
                                <span>Seterusnya: {item.nextRun}</span>
                              )}
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
      </Tabs>
    </div>
  );
}
