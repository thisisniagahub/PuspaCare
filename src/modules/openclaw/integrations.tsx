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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Link2,
  Settings,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Brain,
  Webhook,
  Database,
  Hash,
  Mail,
} from 'lucide-react';

type Category = 'saluran' | 'model' | 'webhook' | 'penyimpanan';

interface Integration {
  id: string;
  name: string;
  category: Category;
  description: string;
  status: 'bersambung' | 'terputus';
  icon: React.ReactNode;
  details?: string;
}

const integrations: Integration[] = [
  // Saluran (Channels)
  {
    id: '1',
    name: 'Discord',
    category: 'saluran',
    description: 'Bot Discord untuk komunikasi ahli dan pemberitahuan aktiviti',
    status: 'bersambung',
    icon: <MessageSquare className="h-5 w-5 text-indigo-500" />,
    details: 'PUSPA Bot v2.1',
  },
  {
    id: '2',
    name: 'Telegram',
    category: 'saluran',
    description: 'Saluran Telegram untuk kemas kini dan interaksi komuniti',
    status: 'bersambung',
    icon: <MessageSquare className="h-5 w-5 text-sky-500" />,
    details: '@puspa_ngo_bot',
  },
  {
    id: '3',
    name: 'WhatsApp',
    category: 'saluran',
    description: 'WhatsApp Business API untuk komunikasi langsung dengan penderma',
    status: 'terputus',
    icon: <MessageSquare className="h-5 w-5 text-green-500" />,
    details: 'Perlu konfigurasi semula',
  },
  {
    id: '4',
    name: 'Slack',
    category: 'saluran',
    description: 'Workspace Slack untuk koordinasi dalaman pasukan sukarelawan',
    status: 'bersambung',
    icon: <Hash className="h-5 w-5 text-purple-500" />,
    details: 'workspace-puspa',
  },
  {
    id: '5',
    name: 'Email',
    category: 'saluran',
    description: 'Perkhidmatan emel untuk komunikasi rasmi dan surat berita',
    status: 'bersambung',
    icon: <Mail className="h-5 w-5 text-rose-500" />,
    details: 'info@puspa.org.my',
  },
  // Model
  {
    id: '6',
    name: 'OpenAI',
    category: 'model',
    description: 'Model GPT-4 dan GPT-3.5 untuk pemprosesan bahasa semula jadi',
    status: 'bersambung',
    icon: <Brain className="h-5 w-5 text-emerald-500" />,
    details: 'GPT-4, GPT-3.5-turbo',
  },
  {
    id: '7',
    name: 'Anthropic',
    category: 'model',
    description: 'Model Claude untuk analisis dan penulisan laporan',
    status: 'bersambung',
    icon: <Brain className="h-5 w-5 text-amber-600" />,
    details: 'Claude 3.5 Sonnet',
  },
  {
    id: '8',
    name: 'Google AI',
    category: 'model',
    description: 'Gemini dan model Google AI untuk analisis multimodal',
    status: 'terputus',
    icon: <Brain className="h-5 w-5 text-blue-500" />,
    details: 'Kunci API tamat tempoh',
  },
  {
    id: '9',
    name: 'Local',
    category: 'model',
    description: 'Model tempatan melalui Ollama untuk pemprosesan data sensitif',
    status: 'bersambung',
    icon: <Brain className="h-5 w-5 text-zinc-500" />,
    details: 'Llama 3, Mistral 7B',
  },
];

const categoryLabels: Record<Category, string> = {
  saluran: 'Saluran',
  model: 'Model',
  webhook: 'Webhook',
  penyimpanan: 'Penyimpanan',
};

const categoryIcons: Record<Category, React.ReactNode> = {
  saluran: <MessageSquare className="h-4 w-4" />,
  model: <Brain className="h-4 w-4" />,
  webhook: <Webhook className="h-4 w-4" />,
  penyimpanan: <Database className="h-4 w-4" />,
};

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState<Category>('saluran');

  const filteredIntegrations = integrations.filter(
    (i) => i.category === activeTab
  );

  const connectedCount = filteredIntegrations.filter(
    (i) => i.status === 'bersambung'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Link2 className="h-6 w-6" />
          Integrasi
        </h1>
        <p className="text-muted-foreground mt-1">
          Sambungkan dan urus perkhidmatan luaran dengan platform PUSPA
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        {(['saluran', 'model', 'webhook', 'penyimpanan'] as Category[]).map(
          (cat) => {
            const catItems = integrations.filter((i) => i.category === cat);
            const catConnected = catItems.filter(
              (i) => i.status === 'bersambung'
            ).length;
            return (
              <Card
                key={cat}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  activeTab === cat
                    ? 'ring-2 ring-primary'
                    : 'hover:ring-1 hover:ring-muted-foreground'
                }`}
                onClick={() => setActiveTab(cat)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {categoryIcons[cat]}
                      <span className="text-sm font-medium">
                        {categoryLabels[cat]}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {catConnected}/{catItems.length}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          }
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Category)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="saluran" className="gap-1.5 text-xs sm:text-sm">
            <MessageSquare className="h-3.5 w-3.5 hidden sm:block" />
            Saluran
          </TabsTrigger>
          <TabsTrigger value="model" className="gap-1.5 text-xs sm:text-sm">
            <Brain className="h-3.5 w-3.5 hidden sm:block" />
            Model
          </TabsTrigger>
          <TabsTrigger value="webhook" className="gap-1.5 text-xs sm:text-sm">
            <Webhook className="h-3.5 w-3.5 hidden sm:block" />
            Webhook
          </TabsTrigger>
          <TabsTrigger value="penyimpanan" className="gap-1.5 text-xs sm:text-sm">
            <Database className="h-3.5 w-3.5 hidden sm:block" />
            Penyimpanan
          </TabsTrigger>
        </TabsList>

        {(['saluran', 'model', 'webhook', 'penyimpanan'] as Category[]).map(
          (cat) => (
            <TabsContent key={cat} value={cat} className="mt-4">
              <div className="flex items-center gap-2 mb-4">
                <p className="text-sm text-muted-foreground">
                  {connectedCount} daripada {filteredIntegrations.length}{' '}
                  perkhidmatan bersambung
                </p>
              </div>

              {filteredIntegrations.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredIntegrations.map((integration) => (
                    <Card
                      key={integration.id}
                      className="transition-all hover:shadow-md"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-muted p-2.5">
                              {integration.icon}
                            </div>
                            <div>
                              <CardTitle className="text-base">
                                {integration.name}
                              </CardTitle>
                              {integration.details && (
                                <CardDescription className="text-xs">
                                  {integration.details}
                                </CardDescription>
                              )}
                            </div>
                          </div>
                          <Badge
                            variant={
                              integration.status === 'bersambung'
                                ? 'default'
                                : 'outline'
                            }
                            className={
                              integration.status === 'bersambung'
                                ? 'bg-emerald-600 hover:bg-emerald-700'
                                : 'text-muted-foreground'
                            }
                          >
                            {integration.status === 'bersambung' ? (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {integration.status === 'bersambung'
                              ? 'Bersambung'
                              : 'Terputus'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {integration.description}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-1.5"
                        >
                          <Settings className="h-3.5 w-3.5" />
                          Konfigurasi
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">
                      Tiada integrasi dalam kategori ini buat masa ini.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )
        )}
      </Tabs>
    </div>
  );
}
