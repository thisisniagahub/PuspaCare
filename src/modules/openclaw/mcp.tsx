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
import {
  Server,
  Settings,
  Plug,
  Unplug,
  Plus,
  Activity,
  Wifi,
  WifiOff,
  RefreshCw,
} from 'lucide-react';

interface MCPServer {
  id: string;
  name: string;
  transport: 'STDIO' | 'SSE' | 'Streamable HTTP';
  status: 'active' | 'inactive';
  description: string;
  lastPing?: string;
}

const initialServers: MCPServer[] = [
  {
    id: '1',
    name: 'PUSPA Database',
    transport: 'STDIO',
    status: 'active',
    description: 'Pelayan pangkalan data utama untuk operasi PUSPA',
    lastPing: '2 saat lalu',
  },
  {
    id: '2',
    name: 'AI Assistant',
    transport: 'SSE',
    status: 'active',
    description: 'Pelayan pembantu AI untuk pemprosesan semula jadi',
    lastPing: '5 saat lalu',
  },
  {
    id: '3',
    name: 'Web Scraper',
    transport: 'Streamable HTTP',
    status: 'inactive',
    description: 'Pelayan pengikis web untuk pengumpulan data luaran',
    lastPing: undefined,
  },
];

const transportColors: Record<string, string> = {
  STDIO: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  SSE: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  'Streamable HTTP': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
};

export default function MCPServersPage() {
  const [servers, setServers] = useState<MCPServer[]>(initialServers);
  const [testingId, setTestingId] = useState<string | null>(null);

  const toggleServer = (id: string) => {
    setServers((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' }
          : s
      )
    );
  };

  const testConnection = (id: string) => {
    setTestingId(id);
    setTimeout(() => setTestingId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Server className="h-6 w-6" />
            Pelayan MCP
          </h1>
          <p className="text-muted-foreground mt-1">
            Urus dan konfigurasi pelayan Model Context Protocol anda
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Pelayan
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900">
                <Wifi className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aktif</p>
                <p className="text-2xl font-bold">
                  {servers.filter((s) => s.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900">
                <WifiOff className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tidak Aktif</p>
                <p className="text-2xl font-bold">
                  {servers.filter((s) => s.status === 'inactive').length}
                </p>
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
                <p className="text-sm text-muted-foreground">Jumlah Pelayan</p>
                <p className="text-2xl font-bold">{servers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Server Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {servers.map((server) => (
          <Card
            key={server.id}
            className="relative transition-all hover:shadow-md"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-lg p-2 ${
                      server.status === 'active'
                        ? 'bg-emerald-100 dark:bg-emerald-900/50'
                        : 'bg-zinc-100 dark:bg-zinc-800'
                    }`}
                  >
                    <Server
                      className={`h-5 w-5 ${
                        server.status === 'active'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-zinc-400'
                      }`}
                    />
                  </div>
                  <div>
                    <CardTitle className="text-base">{server.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {server.description}
                    </CardDescription>
                  </div>
                </div>
                <Switch
                  checked={server.status === 'active'}
                  onCheckedChange={() => toggleServer(server.id)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="secondary"
                  className={transportColors[server.transport]}
                >
                  {server.transport}
                </Badge>
                <Badge
                  variant={
                    server.status === 'active' ? 'default' : 'outline'
                  }
                  className={
                    server.status === 'active'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'text-muted-foreground'
                  }
                >
                  {server.status === 'active' ? (
                    <Plug className="h-3 w-3 mr-1" />
                  ) : (
                    <Unplug className="h-3 w-3 mr-1" />
                  )}
                  {server.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                </Badge>
              </div>

              {server.lastPing && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  Ping terakhir: {server.lastPing}
                </p>
              )}

              <div className="flex items-center gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5 text-xs"
                  onClick={() => testConnection(server.id)}
                  disabled={testingId === server.id}
                >
                  {testingId === server.id ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3" />
                  )}
                  Uji Sambungan
                </Button>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                  <Settings className="h-3 w-3" />
                  Tetapan
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
