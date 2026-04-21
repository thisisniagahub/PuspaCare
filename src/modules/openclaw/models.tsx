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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Brain,
  ChevronDown,
  Settings,
  Activity,
  Zap,
  ArrowUpDown,
  Cpu,
} from 'lucide-react';

interface ModelInfo {
  name: string;
  description: string;
  inputCost: string;
  outputCost: string;
  contextWindow: string;
}

interface ModelProvider {
  id: string;
  name: string;
  type: string;
  status: boolean;
  failoverOrder: number;
  modelsCount: number;
  latency: string;
  models: ModelInfo[];
  icon: React.ReactNode;
  iconColor: string;
}

const initialProviders: ModelProvider[] = [
  {
    id: '1',
    name: 'OpenAI',
    type: 'Awan',
    status: true,
    failoverOrder: 1,
    modelsCount: 5,
    latency: '~1.2s',
    models: [
      {
        name: 'GPT-4 Turbo',
        description: 'Model terbaharu dengan konteks 128K',
        inputCost: '$0.01/1K token',
        outputCost: '$0.03/1K token',
        contextWindow: '128K',
      },
      {
        name: 'GPT-4',
        description: 'Model unggul untuk tugas kompleks',
        inputCost: '$0.03/1K token',
        outputCost: '$0.06/1K token',
        contextWindow: '8K',
      },
      {
        name: 'GPT-3.5 Turbo',
        description: 'Model pantas dan kos rendah',
        inputCost: '$0.001/1K token',
        outputCost: '$0.002/1K token',
        contextWindow: '16K',
      },
    ],
    icon: <Brain className="h-5 w-5" />,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: '2',
    name: 'Anthropic',
    type: 'Awan',
    status: true,
    failoverOrder: 2,
    modelsCount: 3,
    latency: '~1.5s',
    models: [
      {
        name: 'Claude 3.5 Sonnet',
        description: 'Keseimbangan optimum antara kecerdasan dan kelajuan',
        inputCost: '$0.003/1K token',
        outputCost: '$0.015/1K token',
        contextWindow: '200K',
      },
      {
        name: 'Claude 3 Opus',
        description: 'Model terkuat untuk analisis mendalam',
        inputCost: '$0.015/1K token',
        outputCost: '$0.075/1K token',
        contextWindow: '200K',
      },
    ],
    icon: <Brain className="h-5 w-5" />,
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: '3',
    name: 'Google AI',
    type: 'Awan',
    status: false,
    failoverOrder: 4,
    modelsCount: 2,
    latency: '~1.8s',
    models: [
      {
        name: 'Gemini 1.5 Pro',
        description: 'Model multimodal dengan konteks 1M',
        inputCost: '$0.00125/1K token',
        outputCost: '$0.005/1K token',
        contextWindow: '1M',
      },
      {
        name: 'Gemini 1.5 Flash',
        description: 'Model pantas untuk tugas ringkas',
        inputCost: '$0.000075/1K token',
        outputCost: '$0.0003/1K token',
        contextWindow: '1M',
      },
    ],
    icon: <Brain className="h-5 w-5" />,
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: '4',
    name: 'Mistral',
    type: 'Awan',
    status: true,
    failoverOrder: 3,
    modelsCount: 3,
    latency: '~1.0s',
    models: [
      {
        name: 'Mistral Large',
        description: 'Model unggul Mistral AI',
        inputCost: '$0.008/1K token',
        outputCost: '$0.024/1K token',
        contextWindow: '32K',
      },
      {
        name: 'Mistral Medium',
        description: 'Model seimbang untuk kebanyakan tugas',
        inputCost: '$0.0027/1K token',
        outputCost: '$0.0081/1K token',
        contextWindow: '32K',
      },
    ],
    icon: <Brain className="h-5 w-5" />,
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
  {
    id: '5',
    name: 'Local (Ollama)',
    type: 'Tempatan',
    status: true,
    failoverOrder: 5,
    modelsCount: 4,
    latency: '~0.3s',
    models: [
      {
        name: 'Llama 3 70B',
        description: 'Model sumber terbuka oleh Meta',
        inputCost: 'Percuma',
        outputCost: 'Percuma',
        contextWindow: '8K',
      },
      {
        name: 'Mistral 7B',
        description: 'Model ringan untuk tugas pantas',
        inputCost: 'Percuma',
        outputCost: 'Percuma',
        contextWindow: '8K',
      },
    ],
    icon: <Cpu className="h-5 w-5" />,
    iconColor: 'text-zinc-600 dark:text-zinc-400',
  },
  {
    id: '6',
    name: 'Groq',
    type: 'Awan',
    status: false,
    failoverOrder: 6,
    modelsCount: 2,
    latency: '~0.2s',
    models: [
      {
        name: 'Llama 3 70B (Groq)',
        description: 'Llama 3 dijana oleh Groq LPU',
        inputCost: '$0.00059/1K token',
        outputCost: '$0.00079/1K token',
        contextWindow: '8K',
      },
      {
        name: 'Mixtral 8x7B (Groq)',
        description: 'Mixtral dijana oleh Groq LPU',
        inputCost: '$0.00024/1K token',
        outputCost: '$0.00024/1K token',
        contextWindow: '32K',
      },
    ],
    icon: <Zap className="h-5 w-5" />,
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
];

export default function ModelsPage() {
  const [providers, setProviders] = useState<ModelProvider[]>(initialProviders);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleProvider = (id: string) => {
    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: !p.status } : p))
    );
  };

  const activeProviders = providers.filter((p) => p.status).length;
  const totalModels = providers.reduce((sum, p) => sum + p.modelsCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Penyedia Model
          </h1>
          <p className="text-muted-foreground mt-1">
            Urus penyedia model AI dan konfigurasi failover untuk platform PUSPA
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm px-3 py-1">
            {activeProviders}/{providers.length} aktif
          </Badge>
          <Button variant="outline" className="gap-1.5 text-xs">
            <Settings className="h-3.5 w-3.5" />
            Konfigurasi Lanjutan
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900">
                <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Penyedia Aktif</p>
                <p className="text-2xl font-bold">{activeProviders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
                <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Jumlah Model</p>
                <p className="text-2xl font-bold">{totalModels}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900">
                <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Latensi Purata</p>
                <p className="text-2xl font-bold">~1.0s</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Providers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Senarai Penyedia</CardTitle>
          <CardDescription>
            Klik pada baris untuk melihat maklumat model terperinci
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Nama</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead className="text-center">Model</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Latensi</TableHead>
                  <TableHead className="text-center">Tertib Failover</TableHead>
                  <TableHead className="text-center">Tindakan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((provider) => (
                  <Collapsible
                    key={provider.id}
                    open={expandedId === provider.id}
                    onOpenChange={(open) =>
                      setExpandedId(open ? provider.id : null)
                    }
                  >
                    <TableRow
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() =>
                        setExpandedId(
                          expandedId === provider.id ? null : provider.id
                        )
                      }
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-muted p-2">
                            <span className={provider.iconColor}>
                              {provider.icon}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{provider.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {provider.modelsCount} model tersedia
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            provider.type === 'Tempatan'
                              ? 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                              : 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300'
                          }
                        >
                          {provider.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{provider.modelsCount}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            provider.status ? 'default' : 'outline'
                          }
                          className={
                            provider.status
                              ? 'bg-emerald-600 hover:bg-emerald-700'
                              : 'text-muted-foreground'
                          }
                        >
                          {provider.status ? 'Aktif' : 'Tidak Aktif'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {provider.status ? provider.latency : '—'}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            #{provider.failoverOrder}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Switch
                            checked={provider.status}
                            onCheckedChange={() => toggleProvider(provider.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ChevronDown
                                className={`h-4 w-4 transition-transform ${
                                  expandedId === provider.id
                                    ? 'rotate-180'
                                    : ''
                                }`}
                              />
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                      </TableCell>
                    </TableRow>
                    <CollapsibleContent>
                      <TableRow>
                        <TableCell colSpan={7} className="p-0">
                          <div className="bg-muted/30 p-4 border-b">
                            <p className="text-sm font-medium mb-3">
                              Model Tersedia untuk {provider.name}
                            </p>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                              {provider.models.map((model) => (
                                <Card
                                  key={model.name}
                                  className="bg-background"
                                >
                                  <CardContent className="p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <p className="font-medium text-sm">
                                        {model.name}
                                      </p>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      {model.description}
                                    </p>
                                    <div className="flex flex-wrap gap-1.5 text-xs">
                                      <Badge variant="outline" className="text-xs">
                                        Masuk: {model.inputCost}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        Keluar: {model.outputCost}
                                      </Badge>
                                      <Badge variant="secondary" className="text-xs">
                                        Konteks: {model.contextWindow}
                                      </Badge>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
