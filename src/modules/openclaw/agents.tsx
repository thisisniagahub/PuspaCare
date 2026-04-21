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
import {
  Bot,
  Settings,
  Power,
  Zap,
  Smile,
  Brain,
  Briefcase,
  Plus,
  MessageSquare,
  ShieldCheck,
  FileText,
  Cpu,
} from 'lucide-react';

interface Skill {
  name: string;
  icon: React.ReactNode;
}

interface AIAgent {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  model: string;
  personality: string;
  personalityType: 'friendly' | 'analytical' | 'professional';
  description: string;
  skills: Skill[];
  conversations: number;
  lastActive: string;
  icon: React.ReactNode;
  iconColor: string;
}

const initialAgents: AIAgent[] = [
  {
    id: '1',
    name: 'PUSPA Assistant',
    status: 'active',
    model: 'GPT-4',
    personality: 'Mesra',
    personalityType: 'friendly',
    description:
      'Pembantu peribadi utama untuk menjawab soalan ahli dan penderma PUSPA dengan cara yang mesra dan profesional',
    skills: [
      { name: 'FAQ', icon: <MessageSquare className="h-3 w-3" /> },
      { name: 'Derma', icon: <Zap className="h-3 w-3" /> },
      { name: 'Keahlian', icon: <ShieldCheck className="h-3 w-3" /> },
    ],
    conversations: 1247,
    lastActive: '5 minit lalu',
    icon: <Bot className="h-6 w-6" />,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: '2',
    name: 'Compliance Checker',
    status: 'active',
    model: 'Claude',
    personality: 'Analitikal',
    personalityType: 'analytical',
    description:
      'Ejen yang memeriksa pematuhan peraturan NGO dan memastikan semua dokumen dan prosedur mematuhi undang-undang',
    skills: [
      { name: 'Audit', icon: <ShieldCheck className="h-3 w-3" /> },
      { name: 'Dokumen', icon: <FileText className="h-3 w-3" /> },
      { name: 'Laporan', icon: <FileText className="h-3 w-3" /> },
    ],
    conversations: 834,
    lastActive: '12 minit lalu',
    icon: <Brain className="h-6 w-6" />,
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: '3',
    name: 'Report Writer',
    status: 'inactive',
    model: 'GPT-4',
    personality: 'Profesional',
    personalityType: 'professional',
    description:
      'Ejen yang menjana laporan tahunan, laporan kewangan, dan dokumen rasmi NGO PUSPA secara automatik',
    skills: [
      { name: 'Laporan', icon: <FileText className="h-3 w-3" /> },
      { name: 'Kewangan', icon: <Briefcase className="h-3 w-3" /> },
      { name: 'Ringkasan', icon: <Zap className="h-3 w-3" /> },
    ],
    conversations: 456,
    lastActive: '3 hari lalu',
    icon: <FileText className="h-6 w-6" />,
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
];

const personalityConfig: Record<
  string,
  { color: string; icon: React.ReactNode }
> = {
  friendly: {
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
    icon: <Smile className="h-3 w-3" />,
  },
  analytical: {
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    icon: <Brain className="h-3 w-3" />,
  },
  professional: {
    color: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300',
    icon: <Briefcase className="h-3 w-3" />,
  },
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<AIAgent[]>(initialAgents);

  const toggleAgent = (id: string) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' }
          : a
      )
    );
  };

  const activeCount = agents.filter((a) => a.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bot className="h-6 w-6" />
            Ejen AI
          </h1>
          <p className="text-muted-foreground mt-1">
            Konfigurasi dan urus ejen AI untuk operasi harian PUSPA
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Ejen
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900">
                <Power className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ejen Aktif</p>
                <p className="text-2xl font-bold">{activeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
                <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Jumlah Perbualan
                </p>
                <p className="text-2xl font-bold">
                  {agents.reduce((sum, a) => sum + a.conversations, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-violet-100 p-2 dark:bg-violet-900">
                <Cpu className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Model Digunakan</p>
                <p className="text-2xl font-bold">
                  {[...new Set(agents.map((a) => a.model))].length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => {
          const personality = personalityConfig[agent.personalityType];
          return (
            <Card
              key={agent.id}
              className={`relative transition-all hover:shadow-md ${
                agent.status === 'inactive' ? 'opacity-70' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-lg p-2.5 ${
                        agent.status === 'active'
                          ? 'bg-muted'
                          : 'bg-zinc-100 dark:bg-zinc-800'
                      }`}
                    >
                      <span className={agent.iconColor}>{agent.icon}</span>
                    </div>
                    <div>
                      <CardTitle className="text-base">{agent.name}</CardTitle>
                      <CardDescription className="text-xs">
                        Terakhir aktif: {agent.lastActive}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {agent.description}
                </p>

                {/* Status & Model Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant={
                      agent.status === 'active' ? 'default' : 'outline'
                    }
                    className={
                      agent.status === 'active'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'text-muted-foreground'
                    }
                  >
                    {agent.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Cpu className="h-3 w-3" />
                    {agent.model}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={personality.color}
                  >
                    {personality.icon}
                    <span className="ml-1">{agent.personality}</span>
                  </Badge>
                </div>

                {/* Skills */}
                <div className="pt-2 border-t">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Kemahiran
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {agent.skills.map((skill) => (
                      <Badge
                        key={skill.name}
                        variant="outline"
                        className="text-xs gap-1"
                      >
                        {skill.icon}
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Conversation Count */}
                <p className="text-xs text-muted-foreground">
                  {agent.conversations.toLocaleString()} perbualan dikendalikan
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5 text-xs"
                  >
                    <Settings className="h-3 w-3" />
                    Konfigurasi
                  </Button>
                  <Button
                    variant={
                      agent.status === 'active' ? 'outline' : 'default'
                    }
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => toggleAgent(agent.id)}
                  >
                    <Power className="h-3 w-3" />
                    {agent.status === 'active' ? 'Nyahaktif' : 'Aktifkan'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
