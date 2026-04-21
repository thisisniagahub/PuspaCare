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
import { Progress } from '@/components/ui/progress';
import {
  Puzzle,
  Download,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Shield,
  Search,
  Star,
} from 'lucide-react';

interface Plugin {
  id: string;
  name: string;
  description: string;
  source: 'Native' | 'Codex' | 'Claude';
  status: 'installed' | 'available';
  version?: string;
  author: string;
  downloads: string;
  rating: number;
}

const initialPlugins: Plugin[] = [
  {
    id: '1',
    name: 'WhatsApp Notifier',
    description:
      'Hantar pemberitahuan automatik melalui WhatsApp kepada ahli dan penderma PUSPA',
    source: 'Native',
    status: 'installed',
    version: '2.1.0',
    author: 'PUSPA Dev',
    downloads: '1.2k',
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Email Sender',
    description:
      'Plugin penghantar emel bersepadu untuk surat berita, resit derma, dan komunikasi rasmi',
    source: 'Native',
    status: 'installed',
    version: '1.5.3',
    author: 'PUSPA Dev',
    downloads: '980',
    rating: 4.6,
  },
  {
    id: '3',
    name: 'Data Analyzer',
    description:
      'Analisis data lanjutan menggunakan model Codex untuk mendapatkan cerapan daripada data NGO',
    source: 'Codex',
    status: 'available',
    version: '3.0.0-beta',
    author: 'OpenAI Community',
    downloads: '5.4k',
    rating: 4.9,
  },
  {
    id: '4',
    name: 'Report Generator',
    description:
      'Jana laporan tahunan, kewangan, dan aktiviti secara automatik menggunakan Claude AI',
    source: 'Claude',
    status: 'available',
    version: '1.2.0',
    author: 'Anthropic Partners',
    downloads: '3.1k',
    rating: 4.7,
  },
];

const sourceColors: Record<string, string> = {
  Native: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
  Codex: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  Claude: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300',
};

const sourceIcons: Record<string, React.ReactNode> = {
  Native: <Shield className="h-3 w-3" />,
  Codex: <Search className="h-3 w-3" />,
  Claude: <ExternalLink className="h-3 w-3" />,
};

export default function PluginsPage() {
  const [plugins, setPlugins] = useState<Plugin[]>(initialPlugins);
  const [installingId, setInstallingId] = useState<string | null>(null);

  const handleInstall = (id: string) => {
    setInstallingId(id);
    setTimeout(() => {
      setPlugins((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status: 'installed' as const } : p
        )
      );
      setInstallingId(null);
    }, 1500);
  };

  const handleRemove = (id: string) => {
    setPlugins((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: 'available' as const } : p
      )
    );
  };

  const installedCount = plugins.filter((p) => p.status === 'installed').length;
  const totalCount = plugins.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Puzzle className="h-6 w-6" />
            Plugin
          </h1>
          <p className="text-muted-foreground mt-1">
            Pasang dan urus plugin untuk memperluaskan fungsi platform PUSPA
          </p>
        </div>
        <Badge variant="outline" className="text-sm px-3 py-1">
          {installedCount}/{totalCount} dipasang
        </Badge>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Kemajuan Pemasangan</span>
            <span className="text-sm text-muted-foreground">
              {installedCount} daripada {totalCount} plugin
            </span>
          </div>
          <Progress value={(installedCount / totalCount) * 100} className="h-2" />
        </CardContent>
      </Card>

      {/* Plugin Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {plugins.map((plugin) => (
          <Card
            key={plugin.id}
            className="transition-all hover:shadow-md"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-lg p-2 ${
                      plugin.status === 'installed'
                        ? 'bg-emerald-100 dark:bg-emerald-900/50'
                        : 'bg-violet-100 dark:bg-violet-900/50'
                    }`}
                  >
                    <Puzzle
                      className={`h-5 w-5 ${
                        plugin.status === 'installed'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-violet-600 dark:text-violet-400'
                      }`}
                    />
                  </div>
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {plugin.name}
                      {plugin.status === 'installed' && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      oleh {plugin.author}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {plugin.description}
              </p>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="secondary"
                  className={sourceColors[plugin.source]}
                >
                  {sourceIcons[plugin.source]}
                  <span className="ml-1">{plugin.source}</span>
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {plugin.version}
                </Badge>
                <Badge
                  variant={
                    plugin.status === 'installed' ? 'default' : 'secondary'
                  }
                  className={
                    plugin.status === 'installed'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : ''
                  }
                >
                  {plugin.status === 'installed' ? 'Dipasang' : 'Boleh Dipasang'}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                <span className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  {plugin.downloads} muat turun
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                  {plugin.rating}
                </span>
              </div>

              <div className="pt-1">
                {plugin.status === 'installed' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5 text-destructive hover:text-destructive"
                    onClick={() => handleRemove(plugin.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Nyahpasang
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="w-full gap-1.5"
                    onClick={() => handleInstall(plugin.id)}
                    disabled={installingId === plugin.id}
                  >
                    {installingId === plugin.id ? (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    Pasang Plugin
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
