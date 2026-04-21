'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Shield,
  Users,
  Wallet,
  Target,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  ChevronRight,
  Clock,
  ListChecks,
  BarChart3,
  ArrowDownToLine,
} from 'lucide-react';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

type CategoryKey =
  | 'pendaftaran'
  | 'tadbirUr'
  | 'kewangan'
  | 'program'
  | 'transparensi';

interface ChecklistItem {
  id: string;
  category: CategoryKey;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: string;
}

interface CategoryDef {
  key: CategoryKey;
  name: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  priority: number;
  priorityLabel: string;
}

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

const CATEGORIES: CategoryDef[] = [
  {
    key: 'pendaftaran',
    name: 'Pendaftaran & Undang-Undang',
    icon: Shield,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    priority: 1,
    priorityLabel: 'Tinggi',
  },
  {
    key: 'tadbirUr',
    name: 'Tadbir Urus',
    icon: Users,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    priority: 3,
    priorityLabel: 'Sederhana',
  },
  {
    key: 'kewangan',
    name: 'Kewangan',
    icon: Wallet,
    color: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    priority: 2,
    priorityLabel: 'Tinggi',
  },
  {
    key: 'program',
    name: 'Program',
    icon: Target,
    color: 'text-sky-700',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
    priority: 4,
    priorityLabel: 'Sederhana',
  },
  {
    key: 'transparensi',
    name: 'Transparensi',
    icon: Eye,
    color: 'text-violet-700',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    priority: 5,
    priorityLabel: 'Rendah',
  },
];

const INITIAL_ITEMS: ChecklistItem[] = [
  // Pendaftaran & Undang-Undang (3 items, all completed)
  {
    id: 'pendaftaran-1',
    category: 'pendaftaran',
    title: 'Sijil ROS dimuat naik',
    description:
      'Salinan sijil pendaftaran sah dari Jabatan Pendaftaran Pertubuhan Malaysia (ROS) mesti dimuat naik ke sistem.',
    completed: true,
    completedAt: '15 Mac 2026, 10:30 PG',
  },
  {
    id: 'pendaftaran-2',
    category: 'pendaftaran',
    title: 'Nombor pendaftaran ROS direkodkan',
    description:
      'Nombor pendaftaran ROS yang sah dan terkini perlu direkodkan dalam profil organisasi.',
    completed: true,
    completedAt: '15 Mac 2026, 10:35 PG',
  },
  {
    id: 'pendaftaran-3',
    category: 'pendaftaran',
    title: 'Perlembagaan dimuat naik',
    description:
      'Dokumen perlembagaan terkini yang telah diluluskan oleh AGM dan disahkan oleh ROS.',
    completed: true,
    completedAt: '18 Mac 2026, 02:15 PG',
  },

  // Tadbir Urus (3 items, 2 completed)
  {
    id: 'tadbir-1',
    category: 'tadbirUr',
    title: 'Ahli lembaga semasa disenaraikan',
    description:
      'Senarai lengkap ahli lembaga pengarah termasuk nama, jawatan, dan tempoh perkhidmatan.',
    completed: true,
    completedAt: '20 Mac 2026, 09:00 PG',
  },
  {
    id: 'tadbir-2',
    category: 'tadbirUr',
    title: 'Minit AGM terkini dimuat naik',
    description:
      'Minit Mesyuarat Agung Tahunan yang terkini termasuk keputusan dan resolusi yang diluluskan.',
    completed: true,
    completedAt: '22 Mac 2026, 04:45 PG',
  },
  {
    id: 'tadbir-3',
    category: 'tadbirUr',
    title: 'Penyata tahunan dihantar ke ROS',
    description:
      'Bukti penghantaran penyata tahunan kepada ROS dalam tempoh yang ditetapkan oleh undang-undang.',
    completed: false,
  },

  // Kewangan (4 items, 1 completed)
  {
    id: 'kewangan-1',
    category: 'kewangan',
    title: 'Pemilikan akaun bank disahkan',
    description:
      'Surat pengesahan dari bank mengenai pemilikan akaun organisasi beserta nama penandatangan yang sah.',
    completed: false,
  },
  {
    id: 'kewangan-2',
    category: 'kewangan',
    title: 'Penyata kewangan tersedia',
    description:
      'Penyata kewangan organisasi untuk tahun kewangan terkini yang telah disediakan mengikut piawaian.',
    completed: true,
    completedAt: '25 Mac 2026, 11:20 PG',
  },
  {
    id: 'kewangan-3',
    category: 'kewangan',
    title: 'Audit luaran diselesaikan',
    description:
      'Laporan audit luaran yang disediakan oleh firma audit bebas yang berdaftar dengan Lembaga Juruaukara.',
    completed: false,
  },
  {
    id: 'kewangan-4',
    category: 'kewangan',
    title: 'Status pengecualian cukai LHDN didokumenkan',
    description:
      'Surat rasmi dari Lembaga Hasil Dalam Negeri (LHDN) mengenai status pengecualian cukai organisasi.',
    completed: false,
  },

  // Program (3 items, all completed)
  {
    id: 'program-1',
    category: 'program',
    title: 'Rekod penerima manfaat dikekalkan',
    description:
      'Senarai penerima manfaat program lengkap dengan maklumat pengenalan, jumlah bantuan, dan tarikh.',
    completed: true,
    completedAt: '28 Mac 2026, 03:10 PG',
  },
  {
    id: 'program-2',
    category: 'program',
    title: 'Metodologi impak didokumenkan',
    description:
      'Dokumen yang menerangkan secara terperinci kaedah pengukuran dan penilaian impak program.',
    completed: true,
    completedAt: '01 Apr 2026, 09:45 PG',
  },
  {
    id: 'program-3',
    category: 'program',
    title: 'Pengesahan rakan kongsi dalam fail',
    description:
      'Memorandum Persefahaman (MOU) dan dokumen pengesahan dengan rakan kongsi strategik.',
    completed: true,
    completedAt: '01 Apr 2026, 10:00 PG',
  },

  // Transparensi (3 items, none completed)
  {
    id: 'transparensi-1',
    category: 'transparensi',
    title: 'Laporan tahunan diterbitkan',
    description:
      'Laporan tahunan organisasi yang merangkumi aktiviti, kewangan, dan pencapaian untuk tatapan awam.',
    completed: false,
  },
  {
    id: 'transparensi-2',
    category: 'transparensi',
    title: 'Kategori penderma didedahkan',
    description:
      'Pendedahan kategori dan sumber penderma mengikut keperluan peraturan dan prinsip etika.',
    completed: false,
  },
  {
    id: 'transparensi-3',
    category: 'transparensi',
    title: 'Metrik impak disahkan secara bebas',
    description:
      'Pengesahan metrik dan penunjuk impak program oleh pihak penilai bebas yang berkelayakan.',
    completed: false,
  },
];

// ──────────────────────────────────────────────
// Helper: Score Color
// ──────────────────────────────────────────────

function getScoreColor(pct: number) {
  if (pct >= 80) return { text: 'text-green-600', stroke: 'stroke-green-500', track: 'bg-green-100', bar: '[&>div]:bg-green-500', ring: 'ring-green-200' };
  if (pct >= 50) return { text: 'text-yellow-600', stroke: 'stroke-yellow-500', track: 'bg-yellow-100', bar: '[&>div]:bg-yellow-500', ring: 'ring-yellow-200' };
  return { text: 'text-red-600', stroke: 'stroke-red-500', track: 'bg-red-100', bar: '[&>div]:bg-red-500', ring: 'ring-red-200' };
}

function getScoreLabel(pct: number): string {
  if (pct >= 80) return 'Sangat Baik';
  if (pct >= 50) return 'Sederhana';
  return 'Perlu Perhatian';
}

// ──────────────────────────────────────────────
// Sub-Components
// ──────────────────────────────────────────────

function CircularProgress({
  percentage,
  size = 200,
  strokeWidth = 14,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  const colors = getScoreColor(percentage);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={colors.track}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${colors.stroke} transition-all duration-1000 ease-out`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-5xl font-extrabold tracking-tight ${colors.text}`}>
          {percentage}%
        </span>
        <span className="text-sm text-muted-foreground mt-1">
          {getScoreLabel(percentage)}
        </span>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Main Page Component
// ──────────────────────────────────────────────

export default function CompliancePage() {
  const [items, setItems] = useState<ChecklistItem[]>(INITIAL_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | 'semua'>('semua');
  const checklistRef = useRef<HTMLDivElement>(null);

  // ── Computed Values ─────────────────────────

  const completedCount = useMemo(
    () => items.filter((i) => i.completed).length,
    [items],
  );
  const totalCount = items.length;
  const overallPct = Math.round((completedCount / totalCount) * 100);
  const overallColors = getScoreColor(overallPct);

  const categoryScores = useMemo(() => {
    const map: Record<CategoryKey, { completed: number; total: number; pct: number }> = {
      pendaftaran: { completed: 0, total: 0, pct: 0 },
      tadbirUr: { completed: 0, total: 0, pct: 0 },
      kewangan: { completed: 0, total: 0, pct: 0 },
      program: { completed: 0, total: 0, pct: 0 },
      transparensi: { completed: 0, total: 0, pct: 0 },
    };
    items.forEach((item) => {
      map[item.category].total += 1;
      if (item.completed) map[item.category].completed += 1;
    });
    (Object.keys(map) as CategoryKey[]).forEach((k) => {
      map[k].pct = map[k].total > 0 ? Math.round((map[k].completed / map[k].total) * 100) : 0;
    });
    return map;
  }, [items]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'semua') return items;
    return items.filter((i) => i.category === selectedCategory);
  }, [items, selectedCategory]);

  const actionItems = useMemo(() => {
    const incomplete = items.filter((i) => !i.completed);
    return incomplete.sort((a, b) => {
      const catA = CATEGORIES.find((c) => c.key === a.category)!;
      const catB = CATEGORIES.find((c) => c.key === b.category)!;
      return catA.priority - catB.priority;
    });
  }, [items]);

  // ── Handlers ────────────────────────────────

  const toggleItem = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nowCompleted = !item.completed;
        return {
          ...item,
          completed: nowCompleted,
          completedAt: nowCompleted
            ? new Date().toLocaleDateString('ms-MY', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              }).replace('PG', 'PG').replace('PTG', 'PTG')
            : undefined,
        };
      }),
    );
  }, []);

  const scrollToChecklist = useCallback(() => {
    checklistRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const focusCategory = useCallback((key: CategoryKey) => {
    setSelectedCategory(key);
    scrollToChecklist();
  }, [scrollToChecklist]);

  // ── Render ──────────────────────────────────

  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100/80">
        {/* ── Header ─────────────────────── */}
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700">
                <ListChecks className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                  Dashboard Compliance
                </h1>
                <p className="text-sm text-muted-foreground">
                  Kesediaan pematuhan dan transparansi
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* ── Overall Compliance Score ── */}
          <Card className="overflow-hidden">
            <CardContent className="py-10">
              <div className="flex flex-col items-center gap-4">
                <CircularProgress percentage={overallPct} />
                <div className="text-center space-y-1 mt-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Skor Keseluruhan: {overallPct}%
                  </h2>
                  <p className="text-muted-foreground">
                    {completedCount} daripada {totalCount} item telah dilengkapkan
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className={`px-3 py-1 text-sm font-medium ${overallColors.ring} ring-1`}
                    >
                      <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
                      Tahap: {getScoreLabel(overallPct)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Category Score Cards ──── */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-gray-900">
                Skor Mengikut Kategori
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {CATEGORIES.map((cat) => {
                const score = categoryScores[cat.key];
                const colors = getScoreColor(score.pct);
                const isActive = selectedCategory === cat.key;
                const Icon = cat.icon;

                return (
                  <button
                    key={cat.key}
                    onClick={() =>
                      setSelectedCategory((prev) =>
                        prev === cat.key ? 'semua' : cat.key,
                      )
                    }
                    className={`text-left transition-all duration-200 rounded-xl border-2 p-4 hover:shadow-md cursor-pointer ${
                      isActive
                        ? `${cat.borderColor} ${cat.bgColor} shadow-sm`
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-lg ${cat.bgColor} ${cat.color}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground leading-tight line-clamp-2">
                        {cat.name}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-end justify-between">
                        <span className={`text-xl font-bold ${colors.text}`}>
                          {score.pct}%
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {score.completed}/{score.total}
                        </span>
                      </div>
                      <Progress
                        value={score.pct}
                        className={`h-2 ${colors.bar}`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedCategory !== 'semua' && (
              <div className="mt-3 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory('semua')}
                  className="text-xs"
                >
                  ✕ Padam penapis — tunjukkan semua
                </Button>
              </div>
            )}
          </section>

          <Separator />

          {/* ── Compliance Checklist ───── */}
          <section ref={checklistRef}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Senarai Semak Pematuhan
                </h2>
              </div>
              <Badge variant="secondary" className="text-xs">
                {filteredItems.filter((i) => i.completed).length}/{filteredItems.length} selesai
              </Badge>
            </div>

            <div className="space-y-6">
              {CATEGORIES.map((cat) => {
                const catItems = filteredItems.filter((i) => i.category === cat.key);
                if (catItems.length === 0) return null;

                const catCompleted = catItems.filter((i) => i.completed).length;
                const Icon = cat.icon;
                const colors = getScoreColor(
                  catItems.length > 0
                    ? Math.round((catCompleted / catItems.length) * 100)
                    : 0,
                );

                return (
                  <Card key={cat.key} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-lg ${cat.bgColor} ${cat.color}`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <CardTitle className="text-base">{cat.name}</CardTitle>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs font-medium ${colors.text} ${colors.ring} ring-1`}
                        >
                          {catCompleted}/{catItems.length}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 pb-3">
                      <div className="divide-y divide-gray-100">
                        {catItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start gap-3 py-3 first:pt-0 last:pb-0 group"
                          >
                            <div className="pt-0.5">
                              <Checkbox
                                checked={item.completed}
                                onCheckedChange={() => toggleItem(item.id)}
                                className="mt-0.5"
                                aria-label={item.title}
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`text-sm font-medium transition-colors ${
                                    item.completed
                                      ? 'text-gray-500 line-through'
                                      : 'text-gray-900'
                                  }`}
                                >
                                  {item.title}
                                </span>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      className="inline-flex text-muted-foreground hover:text-foreground transition-colors"
                                      aria-label={`Maklumat: ${item.title}`}
                                    >
                                      <Info className="w-3.5 h-3.5" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="right"
                                    className="max-w-xs text-sm"
                                  >
                                    {item.description}
                                  </TooltipContent>
                                </Tooltip>

                                {item.completed ? (
                                  <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100 text-[11px] px-2 py-0">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Selesai
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive" className="text-[11px] px-2 py-0 bg-red-50 text-red-600 border-red-200 hover:bg-red-50">
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Belum Selesai
                                  </Badge>
                                )}
                              </div>

                              {!item.completed && (
                                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  Tindakan Diperlukan
                                </p>
                              )}

                              {item.completed && item.completedAt && (
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Disiapkan: {item.completedAt}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          <Separator />

          {/* ── Action Items Section ──── */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <ArrowDownToLine className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-gray-900">
                Item Tindakan
              </h2>
              <Badge variant="destructive" className="text-xs bg-red-50 text-red-600 border-red-200 hover:bg-red-50">
                {actionItems.length} perlu tindakan
              </Badge>
            </div>

            {actionItems.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-lg font-semibold text-gray-900">
                    Semua item telah dilengkapkan!
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tiada tindakan diperlukan. Tahniah atas pematuhan penuh.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {actionItems.map((item, idx) => {
                  const cat = CATEGORIES.find((c) => c.key === item.category)!;
                  const Icon = cat.icon;

                  return (
                    <Card key={item.id} className="overflow-hidden hover:shadow-sm transition-shadow">
                      <CardContent className="py-4">
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div
                            className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${cat.bgColor} ${cat.color}`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>

                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-medium text-muted-foreground">
                                {cat.name}
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0 ${
                                  cat.priority <= 2
                                    ? 'border-red-200 text-red-600'
                                    : cat.priority <= 4
                                      ? 'border-amber-200 text-amber-600'
                                      : 'border-gray-200 text-gray-500'
                                }`}
                              >
                                {cat.priorityLabel}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                              {item.title}
                            </p>
                            <p className="text-xs text-red-500 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              Tindakan Diperlukan — Sila lengkapkan item ini untuk
                              mematuhi keperluan audit
                            </p>
                          </div>

                          <div className="shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => focusCategory(item.category)}
                              className="text-xs gap-1"
                            >
                              Lihat
                              <ChevronRight className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          {/* ── Footer Summary ──── */}
          <Separator />
          <footer className="pb-8">
            <Card className="bg-gradient-to-r from-slate-50 to-gray-50 border-gray-200">
              <CardContent className="py-5">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-700">
                      Ringkasan Pematuhan PUSPA
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {completedCount}/{totalCount} item dilengkapkan •{' '}
                      {overallPct >= 80
                        ? 'Pematuhan cemerlang'
                        : overallPct >= 50
                          ? 'Pematuhan sederhana — tindakan segera diperlukan'
                          : 'Pematuhan kritikal — perhatian pengurusan diperlukan'}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`px-4 py-1.5 text-sm font-semibold ${overallColors.text} ${overallColors.ring} ring-1`}
                  >
                    {overallPct}% Keseluruhan
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </footer>
        </main>
      </div>
    </TooltipProvider>
  );
}
