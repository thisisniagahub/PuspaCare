'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Search,
  Eye,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  MessageSquare,
  PhoneCall,
  UserCheck,
  ClipboardCheck,
  FileText,
  DollarSign,
  Users,
  Building2,
  StickyNote,
  AlertTriangle,
  Filter,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// ============================================================
// Types
// ============================================================

type Status =
  | 'draft'
  | 'submitted'
  | 'verifying'
  | 'verified'
  | 'scoring'
  | 'scored'
  | 'approved'
  | 'disbursing'
  | 'disbursed'
  | 'follow_up'
  | 'closed'
  | 'rejected';

type Priority = 'urgent' | 'high' | 'normal' | 'low';

type Category = 'zakat' | 'sedekah' | 'wakaf' | 'infak' | 'bantuan_kerajaan';

type NoteType = 'note' | 'call' | 'visit' | 'assessment';

interface CaseNote {
  id: string;
  type: NoteType;
  content: string;
  createdAt: string;
  createdBy: string;
}

interface Disbursement {
  id: string;
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  reference: string;
}

interface CaseData {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: Status;
  applicantName: string;
  applicantIC: string;
  applicantPhone: string;
  applicantAddress: string;
  programmeId: string | null;
  memberId: string | null;
  amountRequested: number | null;
  notes: CaseNote[];
  createdAt: string;
  updatedAt: string;
  disbursements: Disbursement[];
  statusHistory: { status: Status; date: string }[];
}

// ============================================================
// Constants
// ============================================================

const ALL_STATUSES: { value: Status; label: string }[] = [
  { value: 'draft', label: 'Draf' },
  { value: 'submitted', label: 'Dihantar' },
  { value: 'verifying', label: 'Semakan' },
  { value: 'verified', label: 'Disahkan' },
  { value: 'scoring', label: 'Penilaian' },
  { value: 'scored', label: 'Dinilai' },
  { value: 'approved', label: 'Diluluskan' },
  { value: 'disbursing', label: 'Pembayaran' },
  { value: 'disbursed', label: 'Dibayar' },
  { value: 'follow_up', label: 'Tindakan Susulan' },
  { value: 'closed', label: 'Ditutup' },
  { value: 'rejected', label: 'Ditolak' },
];

const STATUSES_MAP = Object.fromEntries(ALL_STATUSES.map((s) => [s.value, s.label]));

const STATUSES_MAP_REVERSE = Object.fromEntries(
  ALL_STATUSES.map((s) => [s.label, s.value])
);

const STATUS_WORKFLOW: Status[] = [
  'draft',
  'submitted',
  'verifying',
  'verified',
  'scoring',
  'scored',
  'approved',
  'disbursing',
  'disbursed',
  'follow_up',
  'closed',
];

const NEXT_STATUS: Partial<Record<Status, Status[]>> = {
  draft: ['submitted', 'rejected'],
  submitted: ['verifying', 'rejected'],
  verifying: ['verified', 'rejected'],
  verified: ['scoring', 'rejected'],
  scoring: ['scored', 'rejected'],
  scored: ['approved', 'rejected'],
  approved: ['disbursing', 'rejected'],
  disbursing: ['disbursed'],
  disbursed: ['follow_up', 'closed'],
  follow_up: ['closed'],
  closed: [],
  rejected: [],
};

const STATUS_COLORS: Record<Status, string> = {
  draft: 'bg-gray-100 text-gray-700 border-gray-300',
  submitted: 'bg-blue-100 text-blue-700 border-blue-300',
  verifying: 'bg-amber-100 text-amber-700 border-amber-300',
  verified: 'bg-teal-100 text-teal-700 border-teal-300',
  scoring: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  scored: 'bg-purple-100 text-purple-700 border-purple-300',
  approved: 'bg-green-100 text-green-700 border-green-300',
  disbursing: 'bg-cyan-100 text-cyan-700 border-cyan-300',
  disbursed: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  follow_up: 'bg-orange-100 text-orange-700 border-orange-300',
  closed: 'bg-slate-100 text-slate-700 border-slate-300',
  rejected: 'bg-red-100 text-red-700 border-red-300',
};

const STATUS_DOT_COLORS: Record<Status, string> = {
  draft: 'bg-gray-400',
  submitted: 'bg-blue-500',
  verifying: 'bg-amber-500',
  verified: 'bg-teal-500',
  scoring: 'bg-indigo-500',
  scored: 'bg-purple-500',
  approved: 'bg-green-500',
  disbursing: 'bg-cyan-500',
  disbursed: 'bg-emerald-500',
  follow_up: 'bg-orange-500',
  closed: 'bg-slate-500',
  rejected: 'bg-red-500',
};

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700 border-red-300' },
  high: { label: 'Tinggi', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  normal: { label: 'Normal', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  low: { label: 'Rendah', color: 'bg-gray-100 text-gray-600 border-gray-300' },
};

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'zakat', label: 'Zakat' },
  { value: 'sedekah', label: 'Sedekah' },
  { value: 'wakaf', label: 'Wakaf' },
  { value: 'infak', label: 'Infak' },
  { value: 'bantuan_kerajaan', label: 'Bantuan Kerajaan' },
];

const CATEGORIES_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label]));

const STAT_CATEGORIES = [
  {
    key: 'draft',
    label: 'Draf',
    icon: FileText,
    color: 'text-gray-600',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    statuses: ['draft' as Status],
  },
  {
    key: 'semakan',
    label: 'Semakan',
    icon: ClipboardCheck,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    statuses: ['submitted', 'verifying', 'verified', 'scoring', 'scored'] as Status[],
  },
  {
    key: 'diluluskan',
    label: 'Dilulusk',
    icon: CheckCircle2,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    statuses: ['approved'] as Status[],
  },
  {
    key: 'pembayaran',
    label: 'Pembayaran',
    icon: DollarSign,
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    statuses: ['disbursing', 'disbursed'] as Status[],
  },
  {
    key: 'selesai',
    label: 'Selesai',
    icon: UserCheck,
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    statuses: ['closed', 'follow_up'] as Status[],
  },
  {
    key: 'ditolak',
    label: 'Ditolak',
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    statuses: ['rejected'] as Status[],
  },
];

const PROGRAMMES = [
  { id: 'prog-001', name: 'Program Zakat Pendapatan 2025' },
  { id: 'prog-002', name: 'Tabung Kecemasan Keluarga' },
  { id: 'prog-003', name: 'Skim Bantuan Pendidikan' },
  { id: 'prog-004', name: 'Program Wakaf Produktif' },
  { id: 'prog-005', name: 'Bantuan Perubatan PUSPA' },
];

const MEMBERS = [
  { id: 'mem-001', name: 'Ahmad bin Hassan' },
  { id: 'mem-002', name: 'Siti Aminah binti Omar' },
  { id: 'mem-003', name: 'Muhammad Ridzuan' },
  { id: 'mem-004', name: 'Nurul Izzah binti Ismail' },
  { id: 'mem-005', name: 'Ibrahim bin Mahmood' },
];

const ITEMS_PER_PAGE = 8;

// ============================================================
// Mock Data
// ============================================================

const MOCK_CASES: CaseData[] = [
  {
    id: '1',
    caseNumber: 'CS-0001',
    title: 'Bantuan Sara Hidup Bulanan',
    description:
      'Permohonan bantuan sara hidup bulanan untuk keluarga yang terjejas akibat kehilangan pekerjaan.',
    category: 'zakat',
    priority: 'urgent',
    status: 'draft',
    applicantName: 'Ahmad bin Ismail',
    applicantIC: '850101012345',
    applicantPhone: '012-3456789',
    applicantAddress: 'No. 12, Jalan Mawar 3, Taman Seri Indah, 43000 Kajang',
    programmeId: 'prog-001',
    memberId: 'mem-001',
    amountRequested: 1500,
    notes: [
      {
        id: 'n1',
        type: 'note',
        content: 'Pemohon perlu melengkapkan dokumen sokongan.',
        createdAt: '2025-01-15T10:30:00Z',
        createdBy: 'Admin',
      },
    ],
    createdAt: '2025-01-15T09:00:00Z',
    updatedAt: '2025-01-15T10:30:00Z',
    disbursements: [],
    statusHistory: [{ status: 'draft', date: '2025-01-15T09:00:00Z' }],
  },
  {
    id: '2',
    caseNumber: 'CS-0002',
    title: 'Bantuan Pendidikan IPT',
    description: 'Permohonan bantuan yuran pengajian tinggi semester 2.',
    category: 'bantuan_kerajaan',
    priority: 'high',
    status: 'submitted',
    applicantName: 'Nurul Aisyah binti Abdullah',
    applicantIC: '000301145678',
    applicantPhone: '017-2345678',
    applicantAddress: 'No. 45, Jalan Kenanga, Seksyen 7, 40000 Shah Alam',
    programmeId: 'prog-003',
    memberId: 'mem-002',
    amountRequested: 3500,
    notes: [],
    createdAt: '2025-01-14T14:00:00Z',
    updatedAt: '2025-01-14T14:00:00Z',
    disbursements: [],
    statusHistory: [
      { status: 'draft', date: '2025-01-14T13:00:00Z' },
      { status: 'submitted', date: '2025-01-14T14:00:00Z' },
    ],
  },
  {
    id: '3',
    caseNumber: 'CS-0003',
    title: 'Bantuan Perubatan Kronik',
    description:
      'Permohonan bantuan kos rawatan penyakit kronik (diabetes & hipertensi).',
    category: 'sedekah',
    priority: 'urgent',
    status: 'verifying',
    applicantName: 'Osman bin Md Noor',
    applicantIC: '670515103456',
    applicantPhone: '013-5678901',
    applicantAddress: 'No. 88, Jalan Melati 1, Ampang, 68000 Selangor',
    programmeId: 'prog-005',
    memberId: 'mem-003',
    amountRequested: 2000,
    notes: [
      {
        id: 'n2',
        type: 'call',
        content: 'Telah menghubungi pemohon untuk pengesahan dokumen perubatan.',
        createdAt: '2025-01-13T11:00:00Z',
        createdBy: 'Pegawai Siasatan',
      },
    ],
    createdAt: '2025-01-12T09:00:00Z',
    updatedAt: '2025-01-13T11:00:00Z',
    disbursements: [],
    statusHistory: [
      { status: 'draft', date: '2025-01-12T09:00:00Z' },
      { status: 'submitted', date: '2025-01-12T10:00:00Z' },
      { status: 'verifying', date: '2025-01-13T09:00:00Z' },
    ],
  },
  {
    id: '4',
    caseNumber: 'CS-0004',
    title: 'Pembaikan Rumah Rosak',
    description:
      'Permohonan bantuan pembaikan rumah yang rosak teruk akibat banjir.',
    category: 'wakaf',
    priority: 'high',
    status: 'verified',
    applicantName: 'Fatimah binti Kasim',
    applicantIC: '750820085678',
    applicantPhone: '019-8765432',
    applicantAddress: 'Kampung Baru, Mukim 5, 45200 Kuala Selangor',
    programmeId: 'prog-002',
    memberId: null,
    amountRequested: 8000,
    notes: [
      {
        id: 'n3',
        type: 'visit',
        content: 'Lawatan tapak telah dijalankan. Kerja pembaikan dianggarkan RM8,000.',
        createdAt: '2025-01-10T15:00:00Z',
        createdBy: 'Pegawai Siasatan',
      },
      {
        id: 'n4',
        type: 'assessment',
        content: 'Penilaian kelayakan selesai. Pemohon layak menerima bantuan.',
        createdAt: '2025-01-11T10:00:00Z',
        createdBy: 'Lembaga Penilai',
      },
    ],
    createdAt: '2025-01-08T08:00:00Z',
    updatedAt: '2025-01-11T10:00:00Z',
    disbursements: [],
    statusHistory: [
      { status: 'draft', date: '2025-01-08T08:00:00Z' },
      { status: 'submitted', date: '2025-01-09T09:00:00Z' },
      { status: 'verifying', date: '2025-01-09T14:00:00Z' },
      { status: 'verified', date: '2025-01-11T10:00:00Z' },
    ],
  },
  {
    id: '5',
    caseNumber: 'CS-0005',
    title: 'Bantuan Kecemasan Kebakaran',
    description:
      'Keluarga mangsa kebakaran memerlukan bantuan segera untuk keperluan asas.',
    category: 'infak',
    priority: 'urgent',
    status: 'scoring',
    applicantName: 'Razak bin Ali',
    applicantIC: '900210145678',
    applicantPhone: '011-1234567',
    applicantAddress: 'No. 22, Lorong 5, Kampung Nelayan, 42000 Port Klang',
    programmeId: 'prog-002',
    memberId: 'mem-004',
    amountRequested: 5000,
    notes: [
      {
        id: 'n5',
        type: 'note',
        content: 'Kes ditandakan sebagai keutamaan tinggi.',
        createdAt: '2025-01-07T16:00:00Z',
        createdBy: 'Admin',
      },
    ],
    createdAt: '2025-01-07T08:00:00Z',
    updatedAt: '2025-01-09T08:00:00Z',
    disbursements: [],
    statusHistory: [
      { status: 'draft', date: '2025-01-07T08:00:00Z' },
      { status: 'submitted', date: '2025-01-07T09:00:00Z' },
      { status: 'verifying', date: '2025-01-07T14:00:00Z' },
      { status: 'verified', date: '2025-01-08T10:00:00Z' },
      { status: 'scoring', date: '2025-01-09T08:00:00Z' },
    ],
  },
  {
    id: '6',
    caseNumber: 'CS-0006',
    title: 'Tabung Sekolah Anak Yatim',
    description: 'Permohonan bantuan persekolahan untuk 3 orang anak yatim.',
    category: 'zakat',
    priority: 'normal',
    status: 'scored',
    applicantName: 'Zaiton binti Hj Salleh',
    applicantIC: '800912056789',
    applicantPhone: '016-9876543',
    applicantAddress: 'No. 56, Jalan Cempaka, Bandar Baru Bangi, 43650',
    programmeId: 'prog-003',
    memberId: null,
    amountRequested: 2000,
    notes: [],
    createdAt: '2025-01-06T10:00:00Z',
    updatedAt: '2025-01-10T09:00:00Z',
    disbursements: [],
    statusHistory: [
      { status: 'draft', date: '2025-01-06T10:00:00Z' },
      { status: 'submitted', date: '2025-01-06T11:00:00Z' },
      { status: 'verifying', date: '2025-01-07T09:00:00Z' },
      { status: 'verified', date: '2025-01-08T09:00:00Z' },
      { status: 'scoring', date: '2025-01-09T09:00:00Z' },
      { status: 'scored', date: '2025-01-10T09:00:00Z' },
    ],
  },
  {
    id: '7',
    caseNumber: 'CS-0007',
    title: 'Modal Perniagaan Kecil',
    description:
      'Permohonan modal permulaan perniagaan kecil makanan untuk ibu tunggal.',
    category: 'wakaf',
    priority: 'normal',
    status: 'approved',
    applicantName: 'Salmah binti Md Yusof',
    applicantIC: '880725016789',
    applicantPhone: '014-3456789',
    applicantAddress: 'No. 33, Jalan Raya, Taman Puteri, 25000 Kuantan',
    programmeId: 'prog-004',
    memberId: 'mem-005',
    amountRequested: 10000,
    notes: [
      {
        id: 'n6',
        type: 'assessment',
        content: 'Pelan perniagaan dinilai dan sesuai. Markah: 82/100.',
        createdAt: '2025-01-05T14:00:00Z',
        createdBy: 'Lembaga Penilai',
      },
    ],
    createdAt: '2025-01-03T09:00:00Z',
    updatedAt: '2025-01-10T14:00:00Z',
    disbursements: [],
    statusHistory: [
      { status: 'draft', date: '2025-01-03T09:00:00Z' },
      { status: 'submitted', date: '2025-01-03T10:00:00Z' },
      { status: 'verifying', date: '2025-01-04T09:00:00Z' },
      { status: 'verified', date: '2025-01-04T15:00:00Z' },
      { status: 'scoring', date: '2025-01-05T09:00:00Z' },
      { status: 'scored', date: '2025-01-05T14:00:00Z' },
      { status: 'approved', date: '2025-01-10T14:00:00Z' },
    ],
  },
  {
    id: '8',
    caseNumber: 'CS-0008',
    title: 'Bantuan Sewa Rumah',
    description: 'Permohonan bantuan sewa rumah selama 3 bulan.',
    category: 'zakat',
    priority: 'high',
    status: 'disbursing',
    applicantName: 'Kamal bin Zainal',
    applicantIC: '900501123456',
    applicantPhone: '012-8765432',
    applicantAddress: 'No. 7, Blok C, Flat Seri Setia, 54200 Kuala Lumpur',
    programmeId: 'prog-001',
    memberId: null,
    amountRequested: 3600,
    notes: [],
    createdAt: '2025-01-02T08:00:00Z',
    updatedAt: '2025-01-12T09:00:00Z',
    disbursements: [
      {
        id: 'd1',
        amount: 1200,
        date: '2025-01-12T09:00:00Z',
        status: 'pending',
        reference: 'PAY-2025-001',
      },
    ],
    statusHistory: [
      { status: 'draft', date: '2025-01-02T08:00:00Z' },
      { status: 'submitted', date: '2025-01-02T09:00:00Z' },
      { status: 'verifying', date: '2025-01-03T09:00:00Z' },
      { status: 'verified', date: '2025-01-04T09:00:00Z' },
      { status: 'scoring', date: '2025-01-05T09:00:00Z' },
      { status: 'scored', date: '2025-01-06T09:00:00Z' },
      { status: 'approved', date: '2025-01-08T10:00:00Z' },
      { status: 'disbursing', date: '2025-01-12T09:00:00Z' },
    ],
  },
  {
    id: '9',
    caseNumber: 'CS-0009',
    title: 'Pembelian Kerusi Roda',
    description:
      'Permohonan bantuan pembelian kerusi roda untuk warga emas kurang upaya.',
    category: 'sedekah',
    priority: 'normal',
    status: 'disbursed',
    applicantName: 'Hashim bin Hj Omar',
    applicantIC: '550315098765',
    applicantPhone: '013-4567890',
    applicantAddress: 'No. 101, Jalan Dato, Kampung Baru, 50300 KL',
    programmeId: 'prog-005',
    memberId: 'mem-001',
    amountRequested: 2500,
    notes: [
      {
        id: 'n7',
        type: 'call',
        content: 'Penerima mengesahkan penerimaan kerusi roda.',
        createdAt: '2025-01-09T14:00:00Z',
        createdBy: 'Pegawai Siasatan',
      },
    ],
    createdAt: '2024-12-20T08:00:00Z',
    updatedAt: '2025-01-09T14:00:00Z',
    disbursements: [
      {
        id: 'd2',
        amount: 2500,
        date: '2025-01-08T10:00:00Z',
        status: 'completed',
        reference: 'PAY-2024-088',
      },
    ],
    statusHistory: [
      { status: 'draft', date: '2024-12-20T08:00:00Z' },
      { status: 'submitted', date: '2024-12-20T09:00:00Z' },
      { status: 'verifying', date: '2024-12-21T09:00:00Z' },
      { status: 'verified', date: '2024-12-22T10:00:00Z' },
      { status: 'scoring', date: '2024-12-23T09:00:00Z' },
      { status: 'scored', date: '2024-12-24T09:00:00Z' },
      { status: 'approved', date: '2024-12-28T10:00:00Z' },
      { status: 'disbursing', date: '2025-01-02T09:00:00Z' },
      { status: 'disbursed', date: '2025-01-08T10:00:00Z' },
    ],
  },
  {
    id: '10',
    caseNumber: 'CS-0010',
    title: 'Susulan Bantuan Makanan',
    description:
      'Penilaian susulan penerimaan bantuan makanan bulanan.',
    category: 'infak',
    priority: 'low',
    status: 'follow_up',
    applicantName: 'Aminah binti Md Daud',
    applicantIC: '700820145678',
    applicantPhone: '019-2345678',
    applicantAddress: 'No. 5, Lorong Bunga Raya, 41000 Klang',
    programmeId: 'prog-002',
    memberId: 'mem-002',
    amountRequested: 600,
    notes: [
      {
        id: 'n8',
        type: 'visit',
        content:
          'Lawatan susulan - keadaan pemohon telah bertambah baik. Bantuan perlu diteruskan.',
        createdAt: '2025-01-08T10:00:00Z',
        createdBy: 'Pegawai Siasatan',
      },
    ],
    createdAt: '2024-12-15T09:00:00Z',
    updatedAt: '2025-01-08T10:00:00Z',
    disbursements: [
      {
        id: 'd3',
        amount: 600,
        date: '2024-12-20T10:00:00Z',
        status: 'completed',
        reference: 'PAY-2024-075',
      },
    ],
    statusHistory: [
      { status: 'draft', date: '2024-12-15T09:00:00Z' },
      { status: 'submitted', date: '2024-12-15T10:00:00Z' },
      { status: 'verifying', date: '2024-12-16T09:00:00Z' },
      { status: 'verified', date: '2024-12-17T10:00:00Z' },
      { status: 'scoring', date: '2024-12-18T09:00:00Z' },
      { status: 'scored', date: '2024-12-19T09:00:00Z' },
      { status: 'approved', date: '2024-12-19T15:00:00Z' },
      { status: 'disbursing', date: '2024-12-20T09:00:00Z' },
      { status: 'disbursed', date: '2024-12-20T10:00:00Z' },
      { status: 'follow_up', date: '2025-01-08T10:00:00Z' },
    ],
  },
  {
    id: '11',
    caseNumber: 'CS-0011',
    title: 'Bantuan Perlindungan Mangsa Banjir',
    description:
      'Bantuan barangan keperluan asas untuk mangsa banjir di Kelantan.',
    category: 'infak',
    priority: 'urgent',
    status: 'closed',
    applicantName: 'Abdul Rahman bin Che Mat',
    applicantIC: '650101018888',
    applicantPhone: '013-1112233',
    applicantAddress: 'Kampung Lubuk Peringgi, 18000 Kuala Krai, Kelantan',
    programmeId: 'prog-002',
    memberId: 'mem-003',
    amountRequested: 3000,
    notes: [
      {
        id: 'n9',
        type: 'note',
        content: 'Kes ditutup setelah semua bantuan disalurkan.',
        createdAt: '2025-01-05T09:00:00Z',
        createdBy: 'Admin',
      },
    ],
    createdAt: '2024-11-20T08:00:00Z',
    updatedAt: '2025-01-05T09:00:00Z',
    disbursements: [
      {
        id: 'd4',
        amount: 1500,
        date: '2024-12-01T10:00:00Z',
        status: 'completed',
        reference: 'PAY-2024-060',
      },
      {
        id: 'd5',
        amount: 1500,
        date: '2024-12-15T10:00:00Z',
        status: 'completed',
        reference: 'PAY-2024-068',
      },
    ],
    statusHistory: [
      { status: 'draft', date: '2024-11-20T08:00:00Z' },
      { status: 'submitted', date: '2024-11-20T09:00:00Z' },
      { status: 'verifying', date: '2024-11-21T09:00:00Z' },
      { status: 'verified', date: '2024-11-22T10:00:00Z' },
      { status: 'scoring', date: '2024-11-25T09:00:00Z' },
      { status: 'scored', date: '2024-11-26T09:00:00Z' },
      { status: 'approved', date: '2024-11-28T10:00:00Z' },
      { status: 'disbursing', date: '2024-12-01T09:00:00Z' },
      { status: 'disbursed', date: '2024-12-15T10:00:00Z' },
      { status: 'follow_up', date: '2024-12-28T09:00:00Z' },
      { status: 'closed', date: '2025-01-05T09:00:00Z' },
    ],
  },
  {
    id: '12',
    caseNumber: 'CS-0012',
    title: 'Permohonan Zakat Fitrah',
    description:
      'Permohonan ditolak - maklumat pemohon tidak lengkap dan tidak dapat disahkan.',
    category: 'zakat',
    priority: 'normal',
    status: 'rejected',
    applicantName: 'Lee Ah Kow',
    applicantIC: '600101088888',
    applicantPhone: '012-9998877',
    applicantAddress: 'No. 99, Jalan Pasar, 50000 Kuala Lumpur',
    programmeId: null,
    memberId: null,
    amountRequested: 500,
    notes: [
      {
        id: 'n10',
        type: 'note',
        content: 'Dokumen sokongan tidak lengkap. Permohonan ditolak.',
        createdAt: '2025-01-02T11:00:00Z',
        createdBy: 'Pegawai Siasatan',
      },
    ],
    createdAt: '2024-12-28T09:00:00Z',
    updatedAt: '2025-01-02T11:00:00Z',
    disbursements: [],
    statusHistory: [
      { status: 'draft', date: '2024-12-28T09:00:00Z' },
      { status: 'submitted', date: '2024-12-28T10:00:00Z' },
      { status: 'rejected', date: '2025-01-02T11:00:00Z' },
    ],
  },
  {
    id: '13',
    caseNumber: 'CS-0013',
    title: 'Bantuan Kecemasan Kemalangan',
    description:
      'Bantuan kecemasan untuk kos rawatan hospital akibat kemalangan jalan raya.',
    category: 'sedekah',
    priority: 'urgent',
    status: 'draft',
    applicantName: 'Syafiq bin Mohd Nor',
    applicantIC: '950815081234',
    applicantPhone: '011-6789012',
    applicantAddress: 'No. 18, Taman Pelangi, 83000 Batu Pahat, Johor',
    programmeId: 'prog-005',
    memberId: null,
    amountRequested: 4500,
    notes: [],
    createdAt: '2025-01-16T08:00:00Z',
    updatedAt: '2025-01-16T08:00:00Z',
    disbursements: [],
    statusHistory: [{ status: 'draft', date: '2025-01-16T08:00:00Z' }],
  },
  {
    id: '14',
    caseNumber: 'CS-0014',
    title: 'Program Wakaf Tanah Pertanian',
    description: 'Permohonan pembangunan tanah wakaf untuk projek pertanian komuniti.',
    category: 'wakaf',
    priority: 'high',
    status: 'submitted',
    applicantName: 'Pertubuhan Tani Sejahtera',
    applicantIC: 'SSM-2024-1234',
    applicantPhone: '03-88887777',
    applicantAddress: 'No. 55, Jalan Pertanian, 43500 Semenyih',
    programmeId: 'prog-004',
    memberId: 'mem-004',
    amountRequested: 25000,
    notes: [],
    createdAt: '2025-01-15T13:00:00Z',
    updatedAt: '2025-01-15T13:00:00Z',
    disbursements: [],
    statusHistory: [
      { status: 'draft', date: '2025-01-15T12:00:00Z' },
      { status: 'submitted', date: '2025-01-15T13:00:00Z' },
    ],
  },
  {
    id: '15',
    caseNumber: 'CS-0015',
    title: 'Bantuan Asas Ibu Tunggal',
    description:
      'Permohonan bantuan bulanan untuk ibu tunggal dengan 4 orang anak.',
    category: 'zakat',
    priority: 'high',
    status: 'verifying',
    applicantName: 'Hafizah binti Sulaiman',
    applicantIC: '900718056789',
    applicantPhone: '016-2345678',
    applicantAddress: 'No. 12, Blok A, PPR Sri Rampai, 53300 KL',
    programmeId: 'prog-001',
    memberId: 'mem-005',
    amountRequested: 2000,
    notes: [
      {
        id: 'n11',
        type: 'call',
        content: 'Telah menghubungi pemohon untuk mengesahkan status pekerjaan.',
        createdAt: '2025-01-14T10:00:00Z',
        createdBy: 'Pegawai Siasatan',
      },
    ],
    createdAt: '2025-01-13T09:00:00Z',
    updatedAt: '2025-01-14T10:00:00Z',
    disbursements: [],
    statusHistory: [
      { status: 'draft', date: '2025-01-13T09:00:00Z' },
      { status: 'submitted', date: '2025-01-13T10:00:00Z' },
      { status: 'verifying', date: '2025-01-14T09:00:00Z' },
    ],
  },
];

// ============================================================
// Form Schema
// ============================================================

const caseFormSchema = z.object({
  title: z.string().min(1, 'Tajuk kes diperlukan'),
  description: z.string().optional().default(''),
  category: z.enum(['zakat', 'sedekah', 'wakaf', 'infak', 'bantuan_kerajaan'], {
    required_error: 'Kategori diperlukan',
  }),
  priority: z.enum(['urgent', 'high', 'normal', 'low'], {
    required_error: 'Prioriti diperlukan',
  }),
  applicantName: z.string().min(1, 'Nama pemohon diperlukan'),
  applicantIC: z.string().min(8, 'No. KP / SSM diperlukan'),
  applicantPhone: z.string().min(8, 'No. telefon diperlukan'),
  applicantAddress: z.string().min(1, 'Alamat diperlukan'),
  programmeId: z.string().optional().default(''),
  memberId: z.string().optional().default(''),
  amountRequested: z.coerce.number().optional().default(0),
  notes: z.string().optional().default(''),
});

type CaseFormData = z.infer<typeof caseFormSchema>;

// ============================================================
// Helper functions
// ============================================================

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ms-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ms-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 0,
  }).format(amount);
}

const NOTE_TYPE_CONFIG: Record<
  NoteType,
  { label: string; icon: React.ElementType; color: string }
> = {
  note: {
    label: 'Catatan',
    icon: StickyNote,
    color: 'bg-blue-100 text-blue-700',
  },
  call: {
    label: 'Panggilan',
    icon: PhoneCall,
    color: 'bg-green-100 text-green-700',
  },
  visit: {
    label: 'Lawatan',
    icon: UserCheck,
    color: 'bg-purple-100 text-purple-700',
  },
  assessment: {
    label: 'Penilaian',
    icon: ClipboardCheck,
    color: 'bg-amber-100 text-amber-700',
  },
};

// ============================================================
// Sub-components
// ============================================================

function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT_COLORS[status]}`} />
      {STATUSES_MAP[status]}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const config = PRIORITY_CONFIG[priority];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.color}`}
    >
      {config.label}
    </span>
  );
}

function StatsCards({
  cases,
  onFilterByCategory,
}: {
  cases: CaseData[];
  onFilterByCategory: (statuses: Status[]) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {STAT_CATEGORIES.map((cat) => {
        const count = cases.filter((c) => cat.statuses.includes(c.status)).length;
        const Icon = cat.icon;
        return (
          <Card
            key={cat.key}
            className={`cursor-pointer border ${cat.border} transition-all hover:shadow-md ${cat.bg}`}
            onClick={() => onFilterByCategory(cat.statuses)}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <Icon className={`h-4 w-4 ${cat.color}`} />
                <span className={`text-2xl font-bold ${cat.color}`}>{count}</span>
              </div>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                {cat.label}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function FilterBar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  categoryFilter,
  onCategoryChange,
}: {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusChange: (val: string) => void;
  priorityFilter: string;
  onPriorityChange: (val: string) => void;
  categoryFilter: string;
  onCategoryChange: (val: string) => void;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari no. kes atau nama pemohon..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={onStatusChange}>
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  {ALL_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Select value={priorityFilter} onValueChange={onPriorityChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Semua Prioriti" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Prioriti</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">Tinggi</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Rendah</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={onCategoryChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CaseTableDesktop({
  cases,
  onViewCase,
  onEditCase,
}: {
  cases: CaseData[];
  onViewCase: (c: CaseData) => void;
  onEditCase: (c: CaseData) => void;
}) {
  return (
    <div className="hidden md:block">
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[110px]">No. Kes</TableHead>
                  <TableHead className="min-w-[180px]">Tajuk</TableHead>
                  <TableHead className="min-w-[150px]">Pemohon</TableHead>
                  <TableHead className="w-[100px]">Kategori</TableHead>
                  <TableHead className="w-[90px]">Prioriti</TableHead>
                  <TableHead className="w-[130px]">Status</TableHead>
                  <TableHead className="w-[100px]">Tarikh</TableHead>
                  <TableHead className="w-[110px] text-right">Tindakan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                      Tiada rekod kes dijumpai.
                    </TableCell>
                  </TableRow>
                ) : (
                  cases.map((c) => (
                    <TableRow key={c.id} className="group hover:bg-muted/30">
                      <TableCell className="font-mono text-sm font-semibold">
                        {c.caseNumber}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[250px] truncate font-medium">
                          {c.title}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{c.applicantName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {CATEGORIES_MAP[c.category]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <PriorityBadge priority={c.priority} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={c.status} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(c.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onViewCase(c)}
                            title="Lihat Kes"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onEditCase(c)}
                            title="Sunting Kes"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CaseCardsMobile({
  cases,
  onViewCase,
  onEditCase,
}: {
  cases: CaseData[];
  onViewCase: (c: CaseData) => void;
  onEditCase: (c: CaseData) => void;
}) {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {cases.length === 0 ? (
        <Card>
          <CardContent className="flex h-32 items-center justify-center p-4 text-muted-foreground">
            Tiada rekod kes dijumpai.
          </CardContent>
        </Card>
      ) : (
        cases.map((c) => (
          <Card key={c.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-muted-foreground">
                      {c.caseNumber}
                    </span>
                    <StatusBadge status={c.status} />
                  </div>
                  <h3 className="mt-1 text-sm font-semibold">{c.title}</h3>
                </div>
                <PriorityBadge priority={c.priority} />
              </div>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5">
                  <Users className="h-3 w-3" />
                  {c.applicantName}
                </p>
                <p className="flex items-center gap-1.5">
                  <Building2 className="h-3 w-3" />
                  {CATEGORIES_MAP[c.category]}
                  {c.amountRequested ? ` · ${formatCurrency(c.amountRequested)}` : ''}
                </p>
                <p className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  {formatDate(c.createdAt)}
                </p>
              </div>
              <div className="mt-3 flex gap-2 border-t pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 flex-1 text-xs"
                  onClick={() => onViewCase(c)}
                >
                  <Eye className="mr-1 h-3 w-3" />
                  Lihat
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 flex-1 text-xs"
                  onClick={() => onEditCase(c)}
                >
                  <Edit3 className="mr-1 h-3 w-3" />
                  Sunting
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-1">
      <p className="text-sm text-muted-foreground">
        Halaman {currentPage} daripada {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? 'default' : 'outline'}
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// Create / Edit Case Dialog
// ============================================================

function CaseFormDialog({
  open,
  onOpenChange,
  editingCase,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCase: CaseData | null;
}) {
  const isEditing = !!editingCase;

  const form = useForm<CaseFormData>({
    resolver: zodResolver(caseFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'zakat',
      priority: 'normal',
      applicantName: '',
      applicantIC: '',
      applicantPhone: '',
      applicantAddress: '',
      programmeId: '',
      memberId: '',
      amountRequested: 0,
      notes: '',
    },
  });

  React.useEffect(() => {
    if (editingCase) {
      form.reset({
        title: editingCase.title,
        description: editingCase.description,
        category: editingCase.category,
        priority: editingCase.priority,
        applicantName: editingCase.applicantName,
        applicantIC: editingCase.applicantIC,
        applicantPhone: editingCase.applicantPhone,
        applicantAddress: editingCase.applicantAddress,
        programmeId: editingCase.programmeId || '',
        memberId: editingCase.memberId || '',
        amountRequested: editingCase.amountRequested || 0,
        notes: '',
      });
    } else {
      form.reset({
        title: '',
        description: '',
        category: 'zakat',
        priority: 'normal',
        applicantName: '',
        applicantIC: '',
        applicantPhone: '',
        applicantAddress: '',
        programmeId: '',
        memberId: '',
        amountRequested: 0,
        notes: '',
      });
    }
  }, [editingCase, form, open]);

  const onSubmit = (data: CaseFormData) => {
    // In a real app, this would call an API
    console.log('Form submitted:', data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Sunting Kes' : 'Daftar Kes Baru'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Kemas kini maklumat kes di bawah.'
              : 'Isi maklumat untuk mendaftarkan kes baharu.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Case Info */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground">
                Maklumat Kes
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>
                        Tajuk Kes <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan tajuk kes" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Penerangan</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Penerangan ringkas tentang kes"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategori</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kategori" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORIES.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioriti</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih prioriti" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="high">Tinggi</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="low">Rendah</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Applicant Info */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground">
                Maklumat Pemohon
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="applicantName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Nama Pemohon <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Nama penuh pemohon" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="applicantIC"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        No. KP / SSM <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Cth: 850101012345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="applicantPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        No. Telefon <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Cth: 012-3456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="applicantAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Alamat <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Alamat penuh pemohon" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Links & Amount */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground">
                Pautan & Amaun
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="programmeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pautan Program</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih program" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PROGRAMMES.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="memberId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pautan Ahli</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih ahli" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MEMBERS.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amountRequested"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amaun Diminta (RM)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Notes */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catatan</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tambah catatan (jika ada)"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit">
                {isEditing ? 'Kemas Kini' : 'Daftar Kes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Case Detail Sheet
// ============================================================

function CaseDetailSheet({
  open,
  onOpenChange,
  caseData,
  onStatusChange,
  onAddNote,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseData: CaseData | null;
  onStatusChange: (caseId: string, newStatus: Status) => void;
  onAddNote: (
    caseId: string,
    type: NoteType,
    content: string
  ) => void;
}) {
  const [newNoteType, setNewNoteType] = useState<NoteType>('note');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedNextStatus, setSelectedNextStatus] = useState<Status | null>(null);

  if (!caseData) return null;

  const currentStatusIndex = STATUS_WORKFLOW.indexOf(caseData.status);
  const passedStatuses = new Set(caseData.statusHistory.map((s) => s.status));
  const nextStatuses = NEXT_STATUS[caseData.status] || [];

  const handleSubmitNote = () => {
    if (!newNoteContent.trim()) return;
    onAddNote(caseData.id, newNoteType, newNoteContent.trim());
    setNewNoteContent('');
  };

  const handleConfirmStatusChange = () => {
    if (selectedNextStatus) {
      onStatusChange(caseData.id, selectedNextStatus);
      setShowStatusDialog(false);
      setSelectedNextStatus(null);
    }
  };

  const programme = PROGRAMMES.find((p) => p.id === caseData.programmeId);
  const member = MEMBERS.find((m) => m.id === caseData.memberId);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-3">
              <span className="font-mono text-sm text-muted-foreground">
                {caseData.caseNumber}
              </span>
              <StatusBadge status={caseData.status} />
            </SheetTitle>
            <SheetDescription>{caseData.title}</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Butiran</TabsTrigger>
                <TabsTrigger value="timeline">Status</TabsTrigger>
                <TabsTrigger value="notes">Catatan</TabsTrigger>
              </TabsList>

              {/* ============ Details Tab ============ */}
              <TabsContent value="details" className="mt-4 space-y-6">
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {nextStatuses.length > 0 && (
                    <Button
                      size="sm"
                      onClick={() => setShowStatusDialog(true)}
                    >
                      <ArrowRight className="mr-1.5 h-4 w-4" />
                      Kemaskini Status
                    </Button>
                  )}
                  <Button size="sm" variant="outline" asChild>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <Edit3 className="mr-1.5 h-4 w-4" />
                      Sunting
                    </a>
                  </Button>
                </div>

                {/* Case Info */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Maklumat Kes</h4>
                  <div className="grid gap-3 rounded-lg border p-4">
                    <div className="grid gap-1.5 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Kategori</p>
                        <Badge variant="outline">{CATEGORIES_MAP[caseData.category]}</Badge>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Prioriti</p>
                        <PriorityBadge priority={caseData.priority} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Amaun Diminta</p>
                        <p className="text-sm font-semibold">
                          {caseData.amountRequested
                            ? formatCurrency(caseData.amountRequested)
                            : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Tarikh Didaftar</p>
                        <p className="text-sm">{formatDate(caseData.createdAt)}</p>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground">Penerangan</p>
                      <p className="text-sm">{caseData.description || '-'}</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {programme && (
                        <div>
                          <p className="text-xs text-muted-foreground">Program</p>
                          <p className="text-sm">{programme.name}</p>
                        </div>
                      )}
                      {member && (
                        <div>
                          <p className="text-xs text-muted-foreground">Ahli</p>
                          <p className="text-sm">{member.name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Applicant Info */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Maklumat Pemohon</h4>
                  <div className="grid gap-3 rounded-lg border p-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Nama</p>
                      <p className="text-sm font-medium">{caseData.applicantName}</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-muted-foreground">No. KP / SSM</p>
                        <p className="font-mono text-sm">{caseData.applicantIC}</p>
                      </div>
                      <div>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" /> Telefon
                        </p>
                        <p className="text-sm">{caseData.applicantPhone}</p>
                      </div>
                    </div>
                    <div>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> Alamat
                      </p>
                      <p className="text-sm">{caseData.applicantAddress}</p>
                    </div>
                  </div>
                </div>

                {/* Disbursements */}
                {caseData.disbursements.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold">Pembayaran</h4>
                    <div className="rounded-lg border">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead>Rujukan</TableHead>
                              <TableHead>Amaun</TableHead>
                              <TableHead>Tarikh</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {caseData.disbursements.map((d) => (
                              <TableRow key={d.id}>
                                <TableCell className="font-mono text-xs">
                                  {d.reference}
                                </TableCell>
                                <TableCell className="font-semibold">
                                  {formatCurrency(d.amount)}
                                </TableCell>
                                <TableCell className="text-xs">
                                  {formatDate(d.date)}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      d.status === 'completed'
                                        ? 'default'
                                        : d.status === 'pending'
                                          ? 'secondary'
                                          : 'destructive'
                                    }
                                    className="text-xs"
                                  >
                                    {d.status === 'completed'
                                      ? 'Siap'
                                      : d.status === 'pending'
                                        ? 'Menunggu'
                                        : 'Gagal'}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* ============ Status Timeline Tab ============ */}
              <TabsContent value="timeline" className="mt-4 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {nextStatuses.length > 0 && (
                    <Button
                      size="sm"
                      onClick={() => setShowStatusDialog(true)}
                    >
                      <ArrowRight className="mr-1.5 h-4 w-4" />
                      Kemaskini Status
                    </Button>
                  )}
                </div>

                <div className="space-y-0">
                  {STATUS_WORKFLOW.filter(
                    (s) => s !== 'rejected'
                  ).map((status, index) => {
                    const isCurrent = status === caseData.status;
                    const isPassed = passedStatuses.has(status);
                    const isReachable =
                      STATUS_WORKFLOW.indexOf(status) <= currentStatusIndex;
                    const isRejected = caseData.status === 'rejected';
                    const historyEntry = caseData.statusHistory.find(
                      (h) => h.status === status
                    );

                    return (
                      <div
                        key={status}
                        className="relative flex gap-3 pb-6 last:pb-0"
                      >
                        {/* Timeline line */}
                        {index < STATUS_WORKFLOW.filter((s) => s !== 'rejected').length - 1 && (
                          <div
                            className={`absolute left-[11px] top-6 h-full w-0.5 ${
                              isReachable && !isRejected
                                ? 'bg-primary/40'
                                : 'bg-muted'
                            }`}
                          />
                        )}
                        {/* Dot */}
                        <div
                          className={`relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                            isCurrent && !isRejected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : isReachable && !isRejected
                                ? 'border-primary bg-primary/20'
                                : 'border-muted-foreground/30 bg-background'
                          }`}
                        >
                          {(isReachable || isPassed) && !isRejected ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                          )}
                        </div>
                        {/* Content */}
                        <div className="min-w-0 flex-1 pt-0">
                          <p
                            className={`text-sm font-medium ${
                              isCurrent && !isRejected
                                ? 'text-primary'
                                : isReachable && !isRejected
                                  ? 'text-foreground'
                                  : 'text-muted-foreground'
                            }`}
                          >
                            {STATUSES_MAP[status]}
                            {isCurrent && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                (Semasa)
                              </span>
                            )}
                          </p>
                          {historyEntry && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {formatDateTime(historyEntry.date)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Rejected branch */}
                  {passedStatuses.has('rejected') && (
                    <div className="relative flex gap-3 pb-2">
                      <div
                        className={`relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-red-500 bg-red-500 text-white`}
                      >
                        <XCircle className="h-3 w-3" />
                      </div>
                      <div className="min-w-0 flex-1 pt-0">
                        <p className="text-sm font-medium text-red-600">
                          Ditolak
                          {caseData.status === 'rejected' && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              (Semasa)
                            </span>
                          )}
                        </p>
                        {caseData.statusHistory.find((h) => h.status === 'rejected') && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {formatDateTime(
                              caseData.statusHistory.find(
                                (h) => h.status === 'rejected'
                              )!.date
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* ============ Notes Tab ============ */}
              <TabsContent value="notes" className="mt-4 space-y-4">
                {/* Add Note Form */}
                <div className="rounded-lg border p-4 space-y-3">
                  <h4 className="text-sm font-semibold">Tambah Catatan</h4>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(NOTE_TYPE_CONFIG) as NoteType[]).map((type) => {
                      const config = NOTE_TYPE_CONFIG[type];
                      const Icon = config.icon;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setNewNoteType(type)}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                            newNoteType === type
                              ? config.color + ' border-current'
                              : 'border-muted-foreground/30 text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          <Icon className="h-3 w-3" />
                          {config.label}
                        </button>
                      );
                    })}
                  </div>
                  <Textarea
                    placeholder="Tulis catatan di sini..."
                    rows={3}
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                  />
                  <Button
                    size="sm"
                    onClick={handleSubmitNote}
                    disabled={!newNoteContent.trim()}
                  >
                    <MessageSquare className="mr-1.5 h-4 w-4" />
                    Hantar Catatan
                  </Button>
                </div>

                <Separator />

                {/* Notes Timeline */}
                <div className="space-y-3">
                  {caseData.notes.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      Tiada catatan untuk kes ini.
                    </p>
                  ) : (
                    caseData.notes
                      .slice()
                      .sort(
                        (a, b) =>
                          new Date(b.createdAt).getTime() -
                          new Date(a.createdAt).getTime()
                      )
                      .map((note) => {
                        const config = NOTE_TYPE_CONFIG[note.type];
                        const Icon = config.icon;
                        return (
                          <div
                            key={note.id}
                            className="rounded-lg border p-3"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.color}`}
                                >
                                  <Icon className="h-3 w-3" />
                                  {config.label}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {note.createdBy}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatDateTime(note.createdAt)}
                              </span>
                            </div>
                            <p className="mt-2 text-sm">{note.content}</p>
                          </div>
                        );
                      })
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>

      {/* Status Change AlertDialog */}
      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kemaskini Status Kes</AlertDialogTitle>
            <AlertDialogDescription>
              Tukar status untuk kes{' '}
              <span className="font-semibold">{caseData.caseNumber}</span> dari{' '}
              <span className="font-semibold">{STATUSES_MAP[caseData.status]}</span> ke:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-wrap gap-2 py-2">
            {nextStatuses.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedNextStatus(s)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                  selectedNextStatus === s
                    ? STATUS_COLORS[s] + ' border-current ring-2 ring-primary/20'
                    : 'border-muted hover:bg-muted'
                }`}
              >
                {STATUSES_MAP[s]}
              </button>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedNextStatus(null)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmStatusChange}
              disabled={!selectedNextStatus}
            >
              Sahkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ============================================================
// Main Page Component
// ============================================================

export default function CasesPage() {
  const [cases, setCases] = useState<CaseData[]>(MOCK_CASES);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<CaseData | null>(null);
  const [detailCase, setDetailCase] = useState<CaseData | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Filter cases
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchSearch =
        !searchTerm ||
        c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.title.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === 'all' || c.status === (statusFilter as Status);

      const matchPriority =
        priorityFilter === 'all' || c.priority === (priorityFilter as Priority);

      const matchCategory =
        categoryFilter === 'all' ||
        c.category === (categoryFilter as Category);

      return matchSearch && matchStatus && matchPriority && matchCategory;
    });
  }, [cases, searchTerm, statusFilter, priorityFilter, categoryFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredCases.length / ITEMS_PER_PAGE));
  const paginatedCases = filteredCases.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearchChange = useCallback((val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback((val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  }, []);

  const handlePriorityChange = useCallback((val: string) => {
    setPriorityFilter(val);
    setCurrentPage(1);
  }, []);

  const handleCategoryChange = useCallback((val: string) => {
    setCategoryFilter(val);
    setCurrentPage(1);
  }, []);

  const handleFilterByCategory = useCallback(
    (statuses: Status[]) => {
      if (statuses.length === 1) {
        setStatusFilter(statuses[0]);
      } else {
        // For multi-status categories, we reset status filter and show all
        setStatusFilter('all');
      }
      setCurrentPage(1);
    },
    []
  );

  const handleViewCase = useCallback((c: CaseData) => {
    // Find the latest version from state
    setDetailCase(c);
    setDetailOpen(true);
  }, []);

  const handleEditCase = useCallback((c: CaseData) => {
    setEditingCase(c);
    setDialogOpen(true);
  }, []);

  const handleOpenNewCase = useCallback(() => {
    setEditingCase(null);
    setDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback((open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingCase(null);
    }
  }, []);

  const handleStatusUpdate = useCallback(
    (caseId: string, newStatus: Status) => {
      setCases((prev) =>
        prev.map((c) => {
          if (c.id !== caseId) return c;
          const now = new Date().toISOString();
          return {
            ...c,
            status: newStatus,
            updatedAt: now,
            statusHistory: [...c.statusHistory, { status: newStatus, date: now }],
          };
        })
      );
      // Update detail view if the changed case is currently open
      setDetailCase((prev) => {
        if (!prev || prev.id !== caseId) return prev;
        const updated = cases.find((c) => c.id === caseId);
        if (!updated) return prev;
        const now = new Date().toISOString();
        return {
          ...updated,
          status: newStatus,
          updatedAt: now,
          statusHistory: [...updated.statusHistory, { status: newStatus, date: now }],
        };
      });
    },
    [cases]
  );

  const handleAddNote = useCallback(
    (caseId: string, type: NoteType, content: string) => {
      const now = new Date().toISOString();
      const newNote: CaseNote = {
        id: `n-${Date.now()}`,
        type,
        content,
        createdAt: now,
        createdBy: 'Pengguna Semasa',
      };
      setCases((prev) =>
        prev.map((c) => {
          if (c.id !== caseId) return c;
          return { ...c, notes: [...c.notes, newNote], updatedAt: now };
        })
      );
      // Update detail view
      setDetailCase((prev) => {
        if (!prev || prev.id !== caseId) return prev;
        return { ...prev, notes: [...prev.notes, newNote], updatedAt: now };
      });
    },
    []
  );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Pengurusan Kes
          </h1>
          <p className="text-sm text-muted-foreground">
            Urus dan jejak kes bantuan PUSPA dengan sistematik
          </p>
        </div>
        <Button onClick={handleOpenNewCase} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Daftar Kes Baru
        </Button>
      </div>

      {/* Stats Cards */}
      <StatsCards cases={cases} onFilterByCategory={handleFilterByCategory} />

      {/* Filter Bar */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        priorityFilter={priorityFilter}
        onPriorityChange={handlePriorityChange}
        categoryFilter={categoryFilter}
        onCategoryChange={handleCategoryChange}
      />

      {/* Case List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Menunjukkan {paginatedCases.length} daripada {filteredCases.length} kes
          </p>
          {(statusFilter !== 'all' ||
            priorityFilter !== 'all' ||
            categoryFilter !== 'all' ||
            searchTerm) && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPriorityFilter('all');
                setCategoryFilter('all');
                setCurrentPage(1);
              }}
            >
              <XCircle className="mr-1 h-3 w-3" />
              Set Semula Tapisan
            </Button>
          )}
        </div>

        <CaseTableDesktop
          cases={paginatedCases}
          onViewCase={handleViewCase}
          onEditCase={handleEditCase}
        />
        <CaseCardsMobile
          cases={paginatedCases}
          onViewCase={handleViewCase}
          onEditCase={handleEditCase}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Create/Edit Dialog */}
      <CaseFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        editingCase={editingCase}
      />

      {/* Detail Sheet */}
      <CaseDetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        caseData={detailCase}
        onStatusChange={handleStatusUpdate}
        onAddNote={handleAddNote}
      />
    </div>
  );
}
