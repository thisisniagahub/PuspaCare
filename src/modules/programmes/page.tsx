'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Eye,
  Pencil,
  Trash2,
  Plus,
  Search,
  CalendarDays,
  Users,
  MapPin,
  Banknote,
  Handshake,
  FileText,
  BarChart3,
  X,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type CategoryKey =
  | 'food_aid'
  | 'education'
  | 'skills_training'
  | 'healthcare'
  | 'financial_assistance'
  | 'community'
  | 'emergency_relief'
  | 'dawah';

type StatusKey = 'Aktif' | 'Siap' | 'Ditangguh' | 'Dirancang';

interface Programme {
  id: string;
  name: string;
  description: string;
  category: CategoryKey;
  status: StatusKey;
  startDate: string;
  endDate: string;
  location: string;
  targetBeneficiaries: number;
  budget: number;
  spent: number;
  currentBeneficiaries: number;
  partners: string;
  notes: string;
  relatedCases: number;
  relatedDonations: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<
  CategoryKey,
  { label: string; color: string; badgeClass: string }
> = {
  food_aid: {
    label: 'Bantuan Makanan',
    color: 'orange',
    badgeClass:
      'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200',
  },
  education: {
    label: 'Pendidikan',
    color: 'blue',
    badgeClass:
      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200',
  },
  skills_training: {
    label: 'Latihan Kemahiran',
    color: 'purple',
    badgeClass:
      'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200',
  },
  healthcare: {
    label: 'Kesihatan',
    color: 'rose',
    badgeClass:
      'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200',
  },
  financial_assistance: {
    label: 'Bantuan Kewangan',
    color: 'emerald',
    badgeClass:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200',
  },
  community: {
    label: 'Komuniti',
    color: 'cyan',
    badgeClass:
      'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-200',
  },
  emergency_relief: {
    label: 'Bantuan Kecemasan',
    color: 'red',
    badgeClass:
      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200',
  },
  dawah: {
    label: 'Dakwah',
    color: 'amber',
    badgeClass:
      'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200',
  },
};

const STATUS_CONFIG: Record<
  StatusKey,
  { label: string; badgeClass: string }
> = {
  Aktif: {
    label: 'Aktif',
    badgeClass:
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200',
  },
  Siap: {
    label: 'Siap',
    badgeClass:
      'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400 border-slate-200',
  },
  Ditangguh: {
    label: 'Ditangguh',
    badgeClass:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200',
  },
  Dirancang: {
    label: 'Dirancang',
    badgeClass:
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200',
  },
};

const CATEGORY_OPTIONS: { value: CategoryKey; label: string }[] = [
  { value: 'food_aid', label: 'Bantuan Makanan' },
  { value: 'education', label: 'Pendidikan' },
  { value: 'skills_training', label: 'Latihan Kemahiran' },
  { value: 'healthcare', label: 'Kesihatan' },
  { value: 'financial_assistance', label: 'Bantuan Kewangan' },
  { value: 'community', label: 'Komuniti' },
  { value: 'emergency_relief', label: 'Bantuan Kecemasan' },
  { value: 'dawah', label: 'Dakwah' },
];

const STATUS_OPTIONS: { value: StatusKey; label: string }[] = [
  { value: 'Aktif', label: 'Aktif' },
  { value: 'Siap', label: 'Siap' },
  { value: 'Ditangguh', label: 'Ditangguh' },
  { value: 'Dirancang', label: 'Dirancang' },
];

const FILTER_TABS = [
  { value: 'Semua', label: 'Semua' },
  ...CATEGORY_OPTIONS.map((c) => ({ value: c.value, label: c.label })),
];

// ─── Mock Data ───────────────────────────────────────────────────────────────

const INITIAL_PROGRAMMES: Programme[] = [
  {
    id: 'P001',
    name: 'Program Bantuan Makanan Raya',
    description:
      'Pengagihan daging dan bahan makanan asas kepada keluarga asnaf dan miskin sempena musim perayaan. Program ini melibatkan pengumpulan derma dan pengagihan secara langsung kepada penerima yang layak di seluruh negeri.',
    category: 'food_aid',
    status: 'Aktif',
    startDate: '2025-03-01',
    endDate: '2025-04-15',
    location: 'Selangor, Kuala Lumpur',
    targetBeneficiaries: 500,
    budget: 25000,
    spent: 18200,
    currentBeneficiaries: 340,
    partners: 'Masjid Jamek Shah Alam, Persatuan Penduduk Taman Sri Muda',
    notes: 'Memerlukan sukarelawan untuk pengagihan di kawasan luar bandar. Koordinasi dengan ketua kampung diperlukan.',
    relatedCases: 45,
    relatedDonations: 23,
  },
  {
    id: 'P002',
    name: 'Tabung Pendidikan Anak Asnaf',
    description:
      'Tabung pendidikan untuk membantu yatim dan anak asnaf meneruskan pendidikan di peringkat sekolah rendah dan menengah. Bantuan merangkumi yuran sekolah, buku teks, pakaian seragam dan keperluan pembelajaran.',
    category: 'education',
    status: 'Aktif',
    startDate: '2025-01-15',
    endDate: '2025-12-31',
    location: 'Seluruh Malaysia',
    targetBeneficiaries: 200,
    budget: 50000,
    spent: 22400,
    currentBeneficiaries: 98,
    partners: 'Kementerian Pendidikan, Yayasan Pendidikan Bumiputera',
    notes: 'Sesi pendaftaran dibuka setiap suku tahun. Keutamaan kepada pelajar dari keluarga B40.',
    relatedCases: 120,
    relatedDonations: 67,
  },
  {
    id: 'P003',
    name: 'Latihan Kemahiran ICT',
    description:
      'Program latihan kemahiran teknologi maklumat dan komunikasi untuk belia dan orang dewasa yang memerlukan kemahiran digital untuk pekerjaan. Modul termasuk penggunaan komputer, internet, dan asas pengaturcaraan.',
    category: 'skills_training',
    status: 'Dirancang',
    startDate: '2025-06-01',
    endDate: '2025-09-30',
    location: 'Pusat Komuniti Cyberjaya',
    targetBeneficiaries: 80,
    budget: 30000,
    spent: 0,
    currentBeneficiaries: 0,
    partners: 'MIMOS, Universiti Teknologi Malaysia',
    notes: 'Menunggu kelulusan geran daripada agensi kerajaan. Kursus akan dijalankan pada hujung minggu.',
    relatedCases: 12,
    relatedDonations: 5,
  },
  {
    id: 'P004',
    name: 'Klinik Kesihatan Komuniti',
    description:
      'Perkhidmatan klinik kesihatan percuma untuk komuniti kurang bernasib baik termasuk pemeriksaan kesihatan asas, kaunseling pemakanan, dan rujukan ke hospital kerajaan. Dikendalikan bersama profesional kesihatan sukarela.',
    category: 'healthcare',
    status: 'Aktif',
    startDate: '2025-02-01',
    endDate: '2025-11-30',
    location: 'Klinik Bergerak Selangor',
    targetBeneficiaries: 300,
    budget: 15000,
    spent: 8700,
    currentBeneficiaries: 175,
    partners: 'Kementerian Kesihatan, Persatuan Perubatan Malaysia',
    notes: 'Klinik beroperasi setiap Sabtu dari jam 9 pagi hingga 1 petang. Memerlukan doktor dan jururawat sukarela.',
    relatedCases: 78,
    relatedDonations: 34,
  },
  {
    id: 'P005',
    name: 'Bantuan Kewangan Bulanan',
    description:
      'Skim bantuan kewangan bulanan untuk keluarga asnaf yang memerlukan sokongan kewangan berterusan. Bantuan meliputi sewa rumah, bil utiliti, dan keperluan asas kehidupan harian.',
    category: 'financial_assistance',
    status: 'Aktif',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    location: 'Seluruh Malaysia',
    targetBeneficiaries: 150,
    budget: 100000,
    spent: 56000,
    currentBeneficiaries: 112,
    partners: 'Bank Islam Malaysia, Agensi Kaunseling dan Pengurusan Kredit',
    notes: 'Penerima perlu dikemas kini setiap 6 bulan. Keutamaan kepada keluarga tunggal dan warga emas.',
    relatedCases: 200,
    relatedDonations: 150,
  },
  {
    id: 'P006',
    name: 'Gotong-Royong Komuniti',
    description:
      'Program gotong-royong membersihkan kawasan komuniti, membaiki infrastruktur asas dan mengindahkan persekitaran. Melibatkan penduduk tempatan dan pihak berkuasa tempatan dalam aktiviti kebersihan.',
    category: 'community',
    status: 'Siap',
    startDate: '2025-01-10',
    endDate: '2025-02-28',
    location: 'Taman Seri Indah, Ampang',
    targetBeneficiaries: 100,
    budget: 5000,
    spent: 4200,
    currentBeneficiaries: 85,
    partners: 'Majlis Perbandaran Ampang Jaya',
    notes: 'Program berjaya dilaksanakan. Kawasan yang dibersihkan termasuk taman permainan dan laluan pejalan kaki.',
    relatedCases: 8,
    relatedDonations: 12,
  },
  {
    id: 'P007',
    name: 'Bantuan Mangsa Banjir',
    description:
      'Bantuan kecemasan kepada mangsa banjir termasuk pembekalan makanan, air bersih, pakaian dan keperluan harian. Pasukan respons kecemasan akan dihantar ke kawasan terjejas segera.',
    category: 'emergency_relief',
    status: 'Ditangguh',
    startDate: '2025-04-01',
    endDate: '2025-06-30',
    location: 'Kelantan, Terengganu',
    targetBeneficiaries: 1000,
    budget: 20000,
    spent: 12500,
    currentBeneficiaries: 420,
    partners: 'APM, Merdekamemuat, Persatuan Bulan Sabit Merah',
    notes: 'Program ditangguhkan sementara menunggu musim tengkujuh. Stok bantuan kecemasan perlu dikemas kini.',
    relatedCases: 350,
    relatedDonations: 89,
  },
  {
    id: 'P008',
    name: 'Kelas Dakwah Bulanan',
    description:
      'Kelas pengajian dan dakwah bulanan yang dikendalikan untuk semua lapisan masyarakat. Topik merangkumi fekah, akhlak, sirah dan isu semasa dari perspektif Islam. Ceramah oleh ulama dan pendakwah terkemuka.',
    category: 'dawah',
    status: 'Aktif',
    startDate: '2025-01-05',
    endDate: '2025-12-20',
    location: 'Masjid Al-Mukarramah, Bangi',
    targetBeneficiaries: 60,
    budget: 8000,
    spent: 2600,
    currentBeneficiaries: 45,
    partners: 'JAKIM, Yayasan Dakwah Islamiah',
    notes: 'Kelas diadakan pada setiap minggu keempat Sabtu. Sesi soal jawab dibuka kepada semua peserta.',
    relatedCases: 15,
    relatedDonations: 22,
  },
];

// ─── Zod Schema ──────────────────────────────────────────────────────────────

const programmeSchema = z.object({
  name: z.string().min(1, 'Nama program diperlukan'),
  description: z.string().optional().default(''),
  category: z.enum([
    'food_aid',
    'education',
    'skills_training',
    'healthcare',
    'financial_assistance',
    'community',
    'emergency_relief',
    'dawah',
  ]),
  status: z.enum(['Aktif', 'Siap', 'Ditangguh', 'Dirancang']),
  startDate: z.string().min(1, 'Tarikh mula diperlukan'),
  endDate: z.string().min(1, 'Tarikh tamat diperlukan'),
  location: z.string().optional().default(''),
  targetBeneficiaries: z
    .number({ message: 'Sila masukkan nombor' })
    .min(0, 'Sasaran peserta tidak boleh negatif'),
  budget: z
    .number({ message: 'Sila masukkan nombor' })
    .min(0, 'Bajet tidak boleh negatif'),
  partners: z.string().optional().default(''),
  notes: z.string().optional().default(''),
});

type ProgrammeFormData = z.infer<typeof programmeSchema>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatCurrency(amount: number): string {
  return `RM ${amount.toLocaleString('ms-MY')}`;
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

function generateId(): string {
  return 'P' + String(Math.floor(Math.random() * 9000) + 1000);
}

function getProgressColor(spent: number, budget: number): string {
  if (budget === 0) return '[&>div]:bg-slate-400';
  if (spent > budget) return '[&>div]:bg-red-500';
  const pct = (spent / budget) * 100;
  if (pct >= 80) return '[&>div]:bg-yellow-500';
  return '[&>div]:bg-green-500';
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProgrammesPage() {
  const [programmes, setProgrammes] = useState<Programme[]>(INITIAL_PROGRAMMES);
  const [activeTab, setActiveTab] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProgramme, setEditingProgramme] = useState<Programme | null>(
    null
  );
  const [viewingProgramme, setViewingProgramme] = useState<Programme | null>(
    null
  );
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // ─── Form ─────────────────────────────────────────────────────────────────

  const form = useForm<ProgrammeFormData>({
    resolver: zodResolver(programmeSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      category: 'food_aid',
      status: 'Dirancang',
      startDate: '',
      endDate: '',
      location: '',
      targetBeneficiaries: 0,
      budget: 0,
      partners: '',
      notes: '',
    },
  });

  // ─── Filtered Programmes ──────────────────────────────────────────────────

  const filteredProgrammes = useMemo(() => {
    return programmes.filter((p) => {
      const matchesCategory =
        activeTab === 'Semua' || p.category === activeTab;
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [programmes, activeTab, searchQuery]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  function openCreateDialog() {
    setEditingProgramme(null);
    form.reset({
      name: '',
      description: '',
      category: 'food_aid',
      status: 'Dirancang',
      startDate: '',
      endDate: '',
      location: '',
      targetBeneficiaries: 0,
      budget: 0,
      partners: '',
      notes: '',
    });
    setIsDialogOpen(true);
  }

  function openEditDialog(programme: Programme) {
    setEditingProgramme(programme);
    form.reset({
      name: programme.name,
      description: programme.description,
      category: programme.category,
      status: programme.status,
      startDate: programme.startDate,
      endDate: programme.endDate,
      location: programme.location,
      targetBeneficiaries: programme.targetBeneficiaries,
      budget: programme.budget,
      partners: programme.partners,
      notes: programme.notes,
    });
    setIsDialogOpen(true);
  }

  function onSubmit(data: ProgrammeFormData) {
    if (editingProgramme) {
      setProgrammes((prev) =>
        prev.map((p) =>
          p.id === editingProgramme.id
            ? { ...p, ...data }
            : p
        )
      );
    } else {
      const newProgramme: Programme = {
        id: generateId(),
        ...data,
        spent: 0,
        currentBeneficiaries: 0,
        relatedCases: 0,
        relatedDonations: 0,
      };
      setProgrammes((prev) => [newProgramme, ...prev]);
    }
    setIsDialogOpen(false);
    setEditingProgramme(null);
    form.reset();
  }

  function handleDelete(id: string) {
    setProgrammes((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirmId(null);
    if (viewingProgramme?.id === id) {
      setViewingProgramme(null);
    }
  }

  // ─── Stats ────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const totalBudget = programmes.reduce((sum, p) => sum + p.budget, 0);
    const totalSpent = programmes.reduce((sum, p) => sum + p.spent, 0);
    const totalBeneficiaries = programmes.reduce(
      (sum, p) => sum + p.currentBeneficiaries,
      0
    );
    const activeCount = programmes.filter((p) => p.status === 'Aktif').length;
    return { totalBudget, totalSpent, totalBeneficiaries, activeCount };
  }, [programmes]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Pengurusan Program
              </h1>
              <p className="text-sm text-gray-500">
                Urus dan pantau semua program PUSPA NGO
              </p>
            </div>
            <Button onClick={openCreateDialog} className="shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Program
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-gray-500">
                Jumlah Program
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {programmes.length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-gray-500">Program Aktif</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.activeCount}
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-gray-500">
                Jumlah Bajet
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalBudget)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-gray-500">
                Jumlah Peserta
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalBeneficiaries.toLocaleString('ms-MY')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Cari program, lokasi, atau keterangan..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Filter Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="w-full overflow-x-auto">
              <TabsList className="inline-flex w-max min-w-full gap-1">
                {FILTER_TABS.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">
                    {tab.label}
                    {tab.value !== 'Semua' && (
                      <span className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gray-200/60 px-1.5 text-[10px] font-medium text-gray-600">
                        {
                          programmes.filter(
                            (p) =>
                              tab.value === 'Semua' || p.category === tab.value
                          ).length
                        }
                      </span>
                    )}
                    {tab.value === 'Semua' && (
                      <span className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gray-200/60 px-1.5 text-[10px] font-medium text-gray-600">
                        {programmes.length}
                      </span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>
        </div>

        {/* Programme Cards Grid */}
        {filteredProgrammes.length === 0 ? (
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Tiada Program Dijumpai
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Cuba ubah penapis carian atau tambah program baru.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProgrammes.map((programme) => {
              const catConfig = CATEGORY_CONFIG[programme.category];
              const statusConfig = STATUS_CONFIG[programme.status];
              const budgetPercent =
                programme.budget > 0
                  ? Math.min((programme.spent / programme.budget) * 100, 100)
                  : 0;
              const isOverBudget = programme.spent > programme.budget;

              return (
                <Card
                  key={programme.id}
                  className="group flex h-full flex-col border-0 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="line-clamp-2 text-base font-semibold leading-snug">
                        {programme.name}
                      </CardTitle>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Badge
                        variant="outline"
                        className={catConfig.badgeClass}
                      >
                        {catConfig.label}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={statusConfig.badgeClass}
                      >
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-4 pb-4">
                    {/* Description */}
                    <p className="text-sm leading-relaxed text-gray-600">
                      {truncateText(programme.description, 100)}
                    </p>

                    {/* Budget Progress */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-gray-700">
                          <Banknote className="mr-1 inline h-3.5 w-3.5" />
                          {formatCurrency(programme.spent)} /{' '}
                          {formatCurrency(programme.budget)}
                        </span>
                        <span
                          className={`font-semibold ${
                            isOverBudget ? 'text-red-600' : 'text-gray-500'
                          }`}
                        >
                          {programme.budget > 0
                            ? `${Math.round((programme.spent / programme.budget) * 100)}%`
                            : '0%'}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isOverBudget
                              ? 'bg-red-500'
                              : budgetPercent >= 80
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Beneficiaries */}
                    <div className="flex items-center text-xs text-gray-600">
                      <Users className="mr-1.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                      Peserta:{' '}
                      <span className="mx-1 font-semibold text-gray-900">
                        {programme.currentBeneficiaries}
                      </span>{' '}
                      / {programme.targetBeneficiaries} sasaran
                    </div>

                    {/* Date Range */}
                    <div className="flex items-center text-xs text-gray-600">
                      <CalendarDays className="mr-1.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                      Tarikh: {formatDate(programme.startDate)} -{' '}
                      {formatDate(programme.endDate)}
                    </div>

                    {/* Location */}
                    {programme.location && (
                      <div className="flex items-center text-xs text-gray-600">
                        <MapPin className="mr-1.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                        {programme.location}
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="border-t bg-gray-50/50 px-4 py-3">
                    <div className="flex w-full items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => setViewingProgramme(programme)}
                      >
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        Lihat
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => openEditDialog(programme)}
                      >
                        <Pencil className="mr-1.5 h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => setDeleteConfirmId(programme.id)}
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                        Padam
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* ─── Create / Edit Dialog ────────────────────────────────────────── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProgramme ? 'Edit Program' : 'Tambah Program Baru'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Nama Program <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Masukkan nama program"
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Keterangan
              </label>
              <Textarea
                placeholder="Keterangan ringkas tentang program"
                rows={3}
                {...form.register('description')}
              />
            </div>

            {/* Category & Status */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <Select
                  value={form.watch('category')}
                  onValueChange={(val) =>
                    form.setValue('category', val as CategoryKey)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Status
                </label>
                <Select
                  value={form.watch('status')}
                  onValueChange={(val) =>
                    form.setValue('status', val as StatusKey)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Tarikh Mula <span className="text-red-500">*</span>
                </label>
                <Input type="date" {...form.register('startDate')} />
                {form.formState.errors.startDate && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.startDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Tarikh Tamat <span className="text-red-500">*</span>
                </label>
                <Input type="date" {...form.register('endDate')} />
                {form.formState.errors.endDate && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Lokasi
              </label>
              <Input
                placeholder="Lokasi program"
                {...form.register('location')}
              />
            </div>

            {/* Target & Budget */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Sasaran Peserta
                </label>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  {...form.register('targetBeneficiaries', {
                    valueAsNumber: true,
                  })}
                />
                {form.formState.errors.targetBeneficiaries && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.targetBeneficiaries.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Bajet (RM)
                </label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  {...form.register('budget', { valueAsNumber: true })}
                />
                {form.formState.errors.budget && (
                  <p className="text-xs text-red-500">
                    {form.formState.errors.budget.message}
                  </p>
                )}
              </div>
            </div>

            {/* Partners */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Rakan Kongsi
              </label>
              <Textarea
                placeholder="Senarai rakan kongsi program"
                rows={2}
                {...form.register('partners')}
              />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Nota
              </label>
              <Textarea
                placeholder="Nota tambahan"
                rows={2}
                {...form.register('notes')}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit">
                {editingProgramme ? 'Simpan Perubahan' : 'Tambah Program'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── View Programme Sheet ─────────────────────────────────────────── */}
      <Sheet
        open={!!viewingProgramme}
        onOpenChange={(open) => !open && setViewingProgramme(null)}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {viewingProgramme && (
            <>
              <SheetHeader>
                <div className="flex flex-wrap items-center gap-2 pb-2">
                  <Badge
                    variant="outline"
                    className={
                      CATEGORY_CONFIG[viewingProgramme.category].badgeClass
                    }
                  >
                    {CATEGORY_CONFIG[viewingProgramme.category].label}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      STATUS_CONFIG[viewingProgramme.status].badgeClass
                    }
                  >
                    {STATUS_CONFIG[viewingProgramme.status].label}
                  </Badge>
                </div>
                <SheetTitle className="text-xl">
                  {viewingProgramme.name}
                </SheetTitle>
                <p className="text-xs text-gray-500">
                  ID: {viewingProgramme.id}
                </p>
              </SheetHeader>

              <div className="mt-6 space-y-6 pb-6">
                {/* Description */}
                <section>
                  <h4 className="mb-2 text-sm font-semibold text-gray-900">
                    Keterangan
                  </h4>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {viewingProgramme.description || 'Tiada keterangan.'}
                  </p>
                </section>

                {/* Date & Location */}
                <section className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900">
                    Butiran Program
                  </h4>
                  <div className="space-y-2 rounded-lg border bg-gray-50/50 p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarDays className="h-4 w-4 shrink-0 text-gray-400" />
                      <span className="text-gray-500">Tarikh:</span>
                      <span className="font-medium text-gray-900">
                        {formatDate(viewingProgramme.startDate)} —{' '}
                        {formatDate(viewingProgramme.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                      <span className="text-gray-500">Lokasi:</span>
                      <span className="font-medium text-gray-900">
                        {viewingProgramme.location || '-'}
                      </span>
                    </div>
                  </div>
                </section>

                {/* Budget Section */}
                <section>
                  <h4 className="mb-2 text-sm font-semibold text-gray-900">
                    Bajet & Perbelanjaan
                  </h4>
                  <div className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Perbelanjaan</p>
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(viewingProgramme.spent)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Jumlah Bajet</p>
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(viewingProgramme.budget)}
                        </p>
                      </div>
                    </div>
                    <Progress
                      value={
                        viewingProgramme.budget > 0
                          ? Math.min(
                              (viewingProgramme.spent /
                                viewingProgramme.budget) *
                                100,
                              100
                            )
                          : 0
                      }
                      className={`h-3 ${getProgressColor(viewingProgramme.spent, viewingProgramme.budget)}`}
                    />
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span
                        className={
                          viewingProgramme.spent > viewingProgramme.budget
                            ? 'font-semibold text-red-600'
                            : 'text-gray-500'
                        }
                      >
                        {viewingProgramme.budget > 0
                          ? `${Math.round((viewingProgramme.spent / viewingProgramme.budget) * 100)}% digunakan`
                          : 'Tiada bajet'}
                      </span>
                      {viewingProgramme.spent > viewingProgramme.budget && (
                        <span className="font-semibold text-red-600">
                          ⚠ Bajet melebihi!
                        </span>
                      )}
                      {viewingProgramme.budget > 0 &&
                        viewingProgramme.spent <=
                          viewingProgramme.budget && (
                          <span className="text-gray-500">
                            Baki:{' '}
                            {formatCurrency(
                              viewingProgramme.budget -
                                viewingProgramme.spent
                            )}
                          </span>
                        )}
                    </div>
                  </div>
                </section>

                {/* Beneficiaries */}
                <section>
                  <h4 className="mb-2 text-sm font-semibold text-gray-900">
                    Peserta & Sasaran
                  </h4>
                  <div className="rounded-lg border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Peserta Semasa</p>
                        <p className="text-lg font-bold text-gray-900">
                          {viewingProgramme.currentBeneficiaries.toLocaleString(
                            'ms-MY'
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Sasaran</p>
                        <p className="text-lg font-bold text-gray-900">
                          {viewingProgramme.targetBeneficiaries.toLocaleString(
                            'ms-MY'
                          )}
                        </p>
                      </div>
                    </div>
                    <Progress
                      value={
                        viewingProgramme.targetBeneficiaries > 0
                          ? Math.min(
                              (viewingProgramme.currentBeneficiaries /
                                viewingProgramme.targetBeneficiaries) *
                                100,
                              100
                            )
                          : 0
                      }
                      className="h-3 [&>div]:bg-blue-500"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      {viewingProgramme.targetBeneficiaries > 0
                        ? `${Math.round((viewingProgramme.currentBeneficiaries / viewingProgramme.targetBeneficiaries) * 100)}% sasaran dicapai`
                        : 'Tiada sasaran ditetapkan'}
                    </p>
                  </div>
                </section>

                {/* Related Data */}
                <section>
                  <h4 className="mb-2 text-sm font-semibold text-gray-900">
                    Data Berkaitan
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border bg-gray-50/50 p-3 text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {viewingProgramme.relatedCases}
                      </p>
                      <p className="text-xs text-gray-500">Kes Berkaitan</p>
                    </div>
                    <div className="rounded-lg border bg-gray-50/50 p-3 text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {viewingProgramme.relatedDonations}
                      </p>
                      <p className="text-xs text-gray-500">
                        Derma Berkaitan
                      </p>
                    </div>
                  </div>
                </section>

                {/* Impact Metrics (Placeholder) */}
                <section>
                  <h4 className="mb-2 text-sm font-semibold text-gray-900">
                    Metrik Impak
                  </h4>
                  <div className="rounded-lg border border-dashed bg-gray-50/30 p-6">
                    <div className="flex flex-col items-center text-center">
                      <BarChart3 className="mb-2 h-8 w-8 text-gray-300" />
                      <p className="text-sm font-medium text-gray-500">
                        Metrik impak akan tersedia selepas
                      </p>
                      <p className="text-sm text-gray-500">
                        pelaksanaan program lengkap.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Partners */}
                {viewingProgramme.partners && (
                  <section>
                    <h4 className="mb-2 text-sm font-semibold text-gray-900">
                      Rakan Kongsi
                    </h4>
                    <div className="flex items-start gap-2 rounded-lg border bg-gray-50/50 p-3">
                      <Handshake className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                      <p className="text-sm text-gray-700">
                        {viewingProgramme.partners}
                      </p>
                    </div>
                  </section>
                )}

                {/* Notes */}
                {viewingProgramme.notes && (
                  <section>
                    <h4 className="mb-2 text-sm font-semibold text-gray-900">
                      Nota
                    </h4>
                    <div className="flex items-start gap-2 rounded-lg border bg-gray-50/50 p-3">
                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                      <p className="text-sm text-gray-700">
                        {viewingProgramme.notes}
                      </p>
                    </div>
                  </section>
                )}
              </div>

              <SheetFooter className="flex-row gap-2 border-t pt-4 sm:flex-row">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    openEditDialog(viewingProgramme);
                    setViewingProgramme(null);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => {
                    setDeleteConfirmId(viewingProgramme.id);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Padam
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ─── Delete Confirmation Dialog ───────────────────────────────────── */}
      <Dialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Sahkan Padam
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-gray-600">
              Adakah anda pasti ingin memadam program ini? Tindakan ini tidak
              boleh dibatalkan.
            </p>
            {deleteConfirmId && (
              <p className="mt-2 rounded-md bg-red-50 p-2 text-sm font-medium text-red-700">
                {programmes.find((p) => p.id === deleteConfirmId)?.name}
              </p>
            )}
          </div>
          <DialogFooter className="flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDeleteConfirmId(null)}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              Padam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
