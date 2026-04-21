'use client';

import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Users,
  UserCheck,
  UserX,
  ShieldAlert,
  ChevronDown,
  Home,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Banknote,
  FileText,
  CalendarDays,
  Filter,
  ArrowUpDown,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

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

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// ===================== Types =====================

type MemberStatus = 'Aktif' | 'Tidak Aktif' | 'Senarai Hitam';
type MaritalStatus = 'Bujang' | 'Berkahwin' | 'Bercerai' | 'Janda/Duda';

interface Member {
  id: string;
  memberNo: string;
  name: string;
  icNumber: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  householdSize: number;
  monthlyIncome: number;
  maritalStatus: MaritalStatus;
  occupation: string;
  bankAccount: string;
  bankName: string;
  status: MemberStatus;
  notes: string;
  joinDate: string;
}

interface HouseholdMember {
  id: string;
  name: string;
  relationship: string;
  icNumber: string;
  age: number;
  occupation: string;
  income: number;
}

interface RelatedCase {
  id: string;
  caseNo: string;
  type: string;
  status: string;
  date: string;
  amount: number;
}

// ===================== Zod Schema =====================

const memberSchema = z.object({
  name: z.string().min(1, 'Nama ahli diperlukan'),
  icNumber: z
    .string()
    .min(1, 'No. Kad Pengenalan diperlukan')
    .regex(/^\d{6}-\d{2}-\d{4}$/, 'Format IC tidak sah (XXXXXX-XX-XXXX)'),
  phone: z
    .string()
    .min(1, 'No. telefon diperlukan')
    .regex(/^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/, 'Format telefon tidak sah'),
  email: z.string().email('Alamat emel tidak sah').optional().or(z.literal('')),
  address: z.string().min(1, 'Alamat diperlukan'),
  city: z.string().min(1, 'Bandar diperlukan'),
  state: z.string().min(1, 'Negeri diperlukan'),
  postalCode: z.string().optional().or(z.literal('')),
  householdSize: z.coerce.number().min(0, 'Saiz isi rumah tidak boleh negatif'),
  monthlyIncome: z.coerce.number().min(0, 'Pendapatan tidak boleh negatif'),
  maritalStatus: z.enum(['Bujang', 'Berkahwin', 'Bercerai', 'Janda/Duda']),
  occupation: z.string().optional().or(z.literal('')),
  bankAccount: z.string().optional().or(z.literal('')),
  bankName: z.string().optional().or(z.literal('')),
  status: z.enum(['Aktif', 'Tidak Aktif', 'Senarai Hitam']),
  notes: z.string().optional().or(z.literal('')),
});

type MemberFormValues = z.infer<typeof memberSchema>;

// ===================== Mock Data =====================

const MALAYSIAN_STATES = [
  'Selangor',
  'Kuala Lumpur',
  'Johor',
  'Pulau Pinang',
  'Perak',
  'Negeri Sembilan',
  'Melaka',
  'Pahang',
  'Terengganu',
  'Kelantan',
  'Kedah',
  'Perlis',
  'Sabah',
  'Sarawak',
];

const BANKS = ['Maybank', 'CIMB', 'Bank Islam', 'Bank Rakyat', 'RHB Bank', 'Public Bank', 'AmBank'];

const initialMembers: Member[] = [
  {
    id: '1',
    memberNo: 'ASN-2024-001',
    name: 'Ahmad bin Abdullah',
    icNumber: '850315-01-5123',
    phone: '013-7892341',
    email: 'ahmad.abdullah@email.com',
    address: 'No. 12, Jalan Hulu Klang 4',
    city: 'Hulu Klang',
    state: 'Selangor',
    postalCode: '53100',
    householdSize: 5,
    monthlyIncome: 1800,
    maritalStatus: 'Berkahwin',
    occupation: 'Pemandu Teksi',
    bankAccount: '1234 5678 9012',
    bankName: 'Maybank',
    status: 'Aktif',
    notes: 'Ahli aktif sejak 2022. Keluarga memerlukan bantuan pendidikan anak-anak.',
    joinDate: '2022-03-15',
  },
  {
    id: '2',
    memberNo: 'ASN-2024-002',
    name: 'Siti binti Hassan',
    icNumber: '901231-14-5234',
    phone: '019-3456782',
    email: 'siti.hassan@email.com',
    address: 'No. 8, Jalan Gombak 7/2',
    city: 'Gombak',
    state: 'Selangor',
    postalCode: '53100',
    householdSize: 4,
    monthlyIncome: 1200,
    maritalStatus: 'Janda/Duda',
    occupation: 'Penjual Kuih',
    bankAccount: '2345 6789 0123',
    bankName: 'Bank Islam',
    status: 'Aktif',
    notes: 'Janda dengan 3 orang anak. Memerlukan bantuan sara hidup.',
    joinDate: '2023-01-10',
  },
  {
    id: '3',
    memberNo: 'ASN-2024-003',
    name: 'Muhammad Amin bin Ismail',
    icNumber: '780422-01-5456',
    phone: '012-9876543',
    email: 'amin.ismail@email.com',
    address: 'No. 25, Jalan Ampang Hilir',
    city: 'Ampang',
    state: 'Selangor',
    postalCode: '55000',
    householdSize: 7,
    monthlyIncome: 2200,
    maritalStatus: 'Berkahwin',
    occupation: 'Buruh Binaan',
    bankAccount: '3456 7890 1234',
    bankName: 'CIMB',
    status: 'Aktif',
    notes: 'Pendapatan tidak mencukupi untuk keluarga besar.',
    joinDate: '2023-06-20',
  },
  {
    id: '4',
    memberNo: 'ASN-2024-004',
    name: 'Nur Aisyah binti Muhammad',
    icNumber: '950817-02-5789',
    phone: '017-2345678',
    email: 'nur.aisyah@email.com',
    address: 'Blok C, Pangsapuri Sri Gombak',
    city: 'Gombak',
    state: 'Selangor',
    postalCode: '53100',
    householdSize: 2,
    monthlyIncome: 900,
    maritalStatus: 'Bujang',
    occupation: 'Pekerja Kedai Runcit',
    bankAccount: '4567 8901 2345',
    bankName: 'Bank Rakyat',
    status: 'Aktif',
    notes: 'Pelajar universiti yang bekerja sambilan.',
    joinDate: '2024-01-05',
  },
  {
    id: '5',
    memberNo: 'ASN-2024-005',
    name: 'Ismail bin Osman',
    icNumber: '700510-01-5123',
    phone: '011-5678901',
    email: '',
    address: 'No. 45, Kampung Melayu Hulu Klang',
    city: 'Hulu Klang',
    state: 'Selangor',
    postalCode: '53100',
    householdSize: 3,
    monthlyIncome: 1500,
    maritalStatus: 'Bercerai',
    occupation: 'Penjaga Keselamatan',
    bankAccount: '5678 9012 3456',
    bankName: 'RHB Bank',
    status: 'Tidak Aktif',
    notes: 'Tidak aktif kerana berpindah ke negeri lain.',
    joinDate: '2021-09-12',
  },
  {
    id: '6',
    memberNo: 'ASN-2024-006',
    name: 'Fatimah binti Zahari',
    icNumber: '820725-03-5345',
    phone: '016-8901234',
    email: 'fatimah.z@email.com',
    address: 'No. 3, Jalan Ampang Utama',
    city: 'Ampang',
    state: 'Selangor',
    postalCode: '55000',
    householdSize: 6,
    monthlyIncome: 2000,
    maritalStatus: 'Berkahwin',
    occupation: 'Surirumah',
    bankAccount: '6789 0123 4567',
    bankName: 'Maybank',
    status: 'Aktif',
    notes: 'Suami mengalami masalah kesihatan kronik.',
    joinDate: '2022-11-08',
  },
  {
    id: '7',
    memberNo: 'ASN-2024-007',
    name: 'Abdul Rahman bin Haji Yusof',
    icNumber: '650101-01-5567',
    phone: '013-4567890',
    email: 'arahman@email.com',
    address: 'No. 18, Jalan Setapak 5',
    city: 'Setapak',
    state: 'Kuala Lumpur',
    postalCode: '53200',
    householdSize: 2,
    monthlyIncome: 800,
    maritalStatus: 'Janda/Duda',
    occupation: 'Pencen',
    bankAccount: '7890 1234 5678',
    bankName: 'Public Bank',
    status: 'Aktif',
    notes: 'Warga emas yang tinggal seorang diri.',
    joinDate: '2020-04-22',
  },
  {
    id: '8',
    memberNo: 'ASN-2024-008',
    name: 'Zulkifli bin Mat',
    icNumber: '880319-01-5890',
    phone: '019-5678901',
    email: '',
    address: 'No. 7, Lorong Gombak 3',
    city: 'Gombak',
    state: 'Selangor',
    postalCode: '53100',
    householdSize: 4,
    monthlyIncome: 3500,
    maritalStatus: 'Berkahwin',
    occupation: 'Kerani',
    bankAccount: '8901 2345 6789',
    bankName: 'AmBank',
    status: 'Senarai Hitam',
    notes: 'Didapati memberi maklumat palsu mengenai pendapatan. Dihapuskan dari senarai bantuan.',
    joinDate: '2023-02-14',
  },
  {
    id: '9',
    memberNo: 'ASN-2024-009',
    name: 'Rohani binti Ali',
    icNumber: '920605-02-5234',
    phone: '014-3456789',
    email: 'rohani.ali@email.com',
    address: 'No. 33, Jalan Keramat AU3',
    city: 'Keramat',
    state: 'Kuala Lumpur',
    postalCode: '54200',
    householdSize: 3,
    monthlyIncome: 1100,
    maritalStatus: 'Bujang',
    occupation: 'Penjaga Kanak-kanak',
    bankAccount: '9012 3456 7890',
    bankName: 'Bank Islam',
    status: 'Aktif',
    notes: 'Ibu tunggal dengan seorang anak. Memerlukan bantuan susu dan pampers.',
    joinDate: '2023-08-30',
  },
  {
    id: '10',
    memberNo: 'ASN-2024-010',
    name: 'Hassan bin Ahmad',
    icNumber: '751112-01-5456',
    phone: '018-2345678',
    email: 'hassan.ahmad@email.com',
    address: 'No. 56, Jalan Ampang Point',
    city: 'Ampang',
    state: 'Selangor',
    postalCode: '55000',
    householdSize: 8,
    monthlyIncome: 2500,
    maritalStatus: 'Berkahwin',
    occupation: 'Pemandu Lori',
    bankAccount: '0123 4567 8901',
    bankName: 'CIMB',
    status: 'Aktif',
    notes: 'Keluarga besar dengan ramai anak yang masih bersekolah.',
    joinDate: '2022-05-18',
  },
  {
    id: '11',
    memberNo: 'ASN-2024-011',
    name: 'Aminah binti Salleh',
    icNumber: '870928-06-5678',
    phone: '012-6789012',
    email: 'aminah.s@email.com',
    address: 'Blok A, Flat Hulu Kelang',
    city: 'Hulu Klang',
    state: 'Selangor',
    postalCode: '53100',
    householdSize: 1,
    monthlyIncome: 650,
    maritalStatus: 'Bujang',
    occupation: 'Pekerja Sambilan',
    bankAccount: '1234 5678 9023',
    bankName: 'Bank Rakyat',
    status: 'Tidak Aktif',
    notes: 'Telah berpindah dan tidak dapat dihubungi.',
    joinDate: '2021-12-01',
  },
  {
    id: '12',
    memberNo: 'ASN-2024-012',
    name: 'Mohd Faiz bin Kamal',
    icNumber: '930414-01-5891',
    phone: '017-8901234',
    email: 'faiz.kamal@email.com',
    address: 'No. 22, Jalan Sri Gombak 8',
    city: 'Gombak',
    state: 'Selangor',
    postalCode: '53100',
    householdSize: 3,
    monthlyIncome: 2800,
    maritalStatus: 'Berkahwin',
    occupation: 'Teknisyan',
    bankAccount: '2345 6789 0134',
    bankName: 'Maybank',
    status: 'Aktif',
    notes: 'Bantuan untuk yuran sekolah anak.',
    joinDate: '2024-02-10',
  },
  {
    id: '13',
    memberNo: 'ASN-2024-013',
    name: 'Khadijah binti Ibrahim',
    icNumber: '801201-04-5123',
    phone: '013-5678912',
    email: 'khadijah.ib@email.com',
    address: 'No. 9, Jalan Ampang Saujana',
    city: 'Ampang',
    state: 'Selangor',
    postalCode: '55000',
    householdSize: 5,
    monthlyIncome: 1600,
    maritalStatus: 'Berkahwin',
    occupation: 'Peniaga Kecil',
    bankAccount: '3456 7890 1245',
    bankName: 'Bank Islam',
    status: 'Senarai Hitam',
    notes: 'Mengugut pekerja NGO. Diharamkan dari program.',
    joinDate: '2022-07-25',
  },
];

const mockHouseholdMembers: Record<string, HouseholdMember[]> = {
  '1': [
    { id: 'h1', name: 'Aminah binti Omar', relationship: 'Isteri', icNumber: '870915-14-5234', age: 37, occupation: 'Surirumah', income: 0 },
    { id: 'h2', name: 'Muhammad Haziq', relationship: 'Anak', icNumber: '100315-01-5789', age: 14, occupation: 'Pelajar', income: 0 },
    { id: 'h3', name: 'Nurul Izzah', relationship: 'Anak', icNumber: '120822-02-5345', age: 12, occupation: 'Pelajar', income: 0 },
    { id: 'h4', name: 'Ahmad Faris', relationship: 'Anak', icNumber: '150101-01-5678', age: 9, occupation: 'Pelajar', income: 0 },
  ],
  '2': [
    { id: 'h5', name: 'Alya Sofea', relationship: 'Anak', icNumber: '080912-02-5890', age: 16, occupation: 'Pelajar', income: 0 },
    { id: 'h6', name: 'Muhammad Danish', relationship: 'Anak', icNumber: '110325-01-5234', age: 13, occupation: 'Pelajar', income: 0 },
    { id: 'h7', name: 'Nur Aina', relationship: 'Anak', icNumber: '130718-02-5456', age: 11, occupation: 'Pelajar', income: 0 },
  ],
  '3': [
    { id: 'h8', name: 'Salmah binti Yusof', relationship: 'Isteri', icNumber: '810618-14-5678', age: 43, occupation: 'Surirumah', income: 0 },
    { id: 'h9', name: 'Ahmad Syafiq', relationship: 'Anak', icNumber: '050410-01-5123', age: 19, occupation: 'Pelajar', income: 0 },
    { id: 'h10', name: 'Siti Afiqah', relationship: 'Anak', icNumber: '070822-02-5345', age: 17, occupation: 'Pelajar', income: 0 },
    { id: 'h11', name: 'Muhammad Aqil', relationship: 'Anak', icNumber: '091215-01-5678', age: 15, occupation: 'Pelajar', income: 0 },
    { id: 'h12', name: 'Nur Aisyah', relationship: 'Anak', icNumber: '110318-02-5890', age: 13, occupation: 'Pelajar', income: 0 },
    { id: 'h13', name: 'Ahmad Harith', relationship: 'Anak', icNumber: '130710-01-5234', age: 11, occupation: 'Pelajar', income: 0 },
  ],
};

const mockRelatedCases: Record<string, RelatedCase[]> = {
  '1': [
    { id: 'c1', caseNo: 'KES-2024-015', type: 'Bantuan Pendidikan', status: 'Lengkap', date: '2024-01-20', amount: 500 },
    { id: 'c2', caseNo: 'KES-2024-032', type: 'Bantuan Sara Hidup', status: 'Aktif', date: '2024-03-10', amount: 300 },
  ],
  '2': [
    { id: 'c3', caseNo: 'KES-2024-008', type: 'Bantuan Sara Hidup', status: 'Aktif', date: '2024-02-15', amount: 400 },
    { id: 'c4', caseNo: 'KES-2024-041', type: 'Bantuan Perubatan', status: 'Dalam Proses', date: '2024-04-05', amount: 800 },
    { id: 'c5', caseNo: 'KES-2024-055', type: 'Bantuan Sekolah', status: 'Aktif', date: '2024-05-12', amount: 250 },
  ],
  '3': [
    { id: 'c6', caseNo: 'KES-2024-022', type: 'Bantuan Kebersihan Rumah', status: 'Lengkap', date: '2024-03-01', amount: 350 },
  ],
};

// ===================== Helpers =====================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ms-MY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getStatusColor(status: MemberStatus): string {
  switch (status) {
    case 'Aktif':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    case 'Tidak Aktif':
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800/40 dark:text-gray-400 border-gray-200 dark:border-gray-700';
    case 'Senarai Hitam':
      return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

function generateMemberNo(members: Member[]): string {
  const count = members.length + 1;
  return `ASN-2024-${String(count).padStart(3, '0')}`;
}

// ===================== Component =====================

export default function MembersPage() {
  // State
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [maritalFilter, setMaritalFilter] = useState<string>('Semua');
  const [sortBy, setSortBy] = useState<string>('Tarikh Sertai');
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [viewingMember, setViewingMember] = useState<Member | null>(null);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);

  const ITEMS_PER_PAGE = 10;

  // Form
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: '',
      icNumber: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      householdSize: 0,
      monthlyIncome: 0,
      maritalStatus: 'Bujang',
      occupation: '',
      bankAccount: '',
      bankName: '',
      status: 'Aktif',
      notes: '',
    },
  });

  // Stats
  const stats = useMemo(() => {
    const total = members.length;
    const active = members.filter((m) => m.status === 'Aktif').length;
    const inactive = members.filter((m) => m.status === 'Tidak Aktif').length;
    const blacklisted = members.filter((m) => m.status === 'Senarai Hitam').length;
    return { total, active, inactive, blacklisted };
  }, [members]);

  // Filtered & sorted members
  const filteredMembers = useMemo(() => {
    let result = [...members];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.icNumber.includes(q) ||
          m.memberNo.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'Semua') {
      result = result.filter((m) => m.status === statusFilter);
    }

    // Marital filter
    if (maritalFilter !== 'Semua') {
      result = result.filter((m) => m.maritalStatus === maritalFilter);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'Nama':
          return a.name.localeCompare(b.name, 'ms');
        case 'Pendapatan':
          return a.monthlyIncome - b.monthlyIncome;
        case 'Tarikh Sertai':
        default:
          return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
      }
    });

    return result;
  }, [members, searchQuery, statusFilter, maritalFilter, sortBy]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / ITEMS_PER_PAGE));
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };
  const handleStatusFilter = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };
  const handleMaritalFilter = (val: string) => {
    setMaritalFilter(val);
    setCurrentPage(1);
  };
  const handleSortChange = (val: string) => {
    setSortBy(val);
    setCurrentPage(1);
  };

  // CRUD Handlers
  const handleAddMember = () => {
    setEditingMember(null);
    form.reset({
      name: '',
      icNumber: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      householdSize: 0,
      monthlyIncome: 0,
      maritalStatus: 'Bujang',
      occupation: '',
      bankAccount: '',
      bankName: '',
      status: 'Aktif',
      notes: '',
    });
    setDialogOpen(true);
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    form.reset({
      name: member.name,
      icNumber: member.icNumber,
      phone: member.phone,
      email: member.email,
      address: member.address,
      city: member.city,
      state: member.state,
      postalCode: member.postalCode,
      householdSize: member.householdSize,
      monthlyIncome: member.monthlyIncome,
      maritalStatus: member.maritalStatus,
      occupation: member.occupation,
      bankAccount: member.bankAccount,
      bankName: member.bankName,
      status: member.status,
      notes: member.notes,
    });
    setDialogOpen(true);
  };

  const handleViewMember = (member: Member) => {
    setViewingMember(member);
    setSheetOpen(true);
  };

  const handleDeleteClick = (member: Member) => {
    setDeletingMember(member);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingMember) {
      setMembers((prev) => prev.filter((m) => m.id !== deletingMember.id));
      setDeleteDialogOpen(false);
      setDeletingMember(null);
    }
  };

  const onSubmit = (data: MemberFormValues) => {
    if (editingMember) {
      // Update
      setMembers((prev) =>
        prev.map((m) =>
          m.id === editingMember.id
            ? { ...m, ...data }
            : m
        )
      );
    } else {
      // Create
      const newMember: Member = {
        id: Date.now().toString(),
        memberNo: generateMemberNo(members),
        ...data,
        joinDate: new Date().toISOString().split('T')[0],
      };
      setMembers((prev) => [newMember, ...prev]);
    }
    setDialogOpen(false);
    form.reset();
    setEditingMember(null);
  };

  // ===================== Render =====================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100 dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Pengurusan Ahli Asnaf
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Urus dan selenggara maklumat ahli penerima zakat dan bantuan
            </p>
          </div>
          <Button onClick={handleAddMember} className="shrink-0 gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4" />
            Tambah Ahli
          </Button>
        </div>

        {/* Stats Row */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <Card className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Jumlah Ahli</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Aktif</p>
                <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{stats.active}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800/60">
                <UserX className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Tidak Aktif</p>
                <p className="text-xl font-bold text-gray-600 dark:text-gray-300">{stats.inactive}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/40">
                <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Senarai Hitam</p>
                <p className="text-xl font-bold text-red-700 dark:text-red-300">{stats.blacklisted}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter Bar */}
        <Card className="mb-6 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50">
          <CardContent className="p-4">
            <div className="flex flex-col gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Cari nama, No. IC atau No. Ahli..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9 border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-900/50"
                />
              </div>

              {/* Filters Row */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <Filter className="h-3 w-3" /> Status
                  </label>
                  <Select value={statusFilter} onValueChange={handleStatusFilter}>
                    <SelectTrigger className="border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-900/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Semua">Semua</SelectItem>
                      <SelectItem value="Aktif">Aktif</SelectItem>
                      <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                      <SelectItem value="Senarai Hitam">Senarai Hitam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <Filter className="h-3 w-3" /> Status Perkahwinan
                  </label>
                  <Select value={maritalFilter} onValueChange={handleMaritalFilter}>
                    <SelectTrigger className="border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-900/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Semua">Semua</SelectItem>
                      <SelectItem value="Bujang">Bujang</SelectItem>
                      <SelectItem value="Berkahwin">Berkahwin</SelectItem>
                      <SelectItem value="Bercerai">Bercerai</SelectItem>
                      <SelectItem value="Janda/Duda">Janda/Duda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <ArrowUpDown className="h-3 w-3" /> Susun Mengikut
                  </label>
                  <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-900/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tarikh Sertai">Tarikh Sertai</SelectItem>
                      <SelectItem value="Nama">Nama</SelectItem>
                      <SelectItem value="Pendapatan">Pendapatan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Table - Desktop */}
        <Card className="hidden border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50 md:block">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 bg-slate-50/80 hover:bg-slate-50/80 dark:border-slate-700 dark:bg-slate-900/50">
                    <TableHead className="w-[110px] font-semibold">No. Ahli</TableHead>
                    <TableHead className="font-semibold">Nama</TableHead>
                    <TableHead className="font-semibold">No. IC</TableHead>
                    <TableHead className="font-semibold">Telefon</TableHead>
                    <TableHead className="font-semibold">Pendapatan</TableHead>
                    <TableHead className="w-[130px] font-semibold">Status</TableHead>
                    <TableHead className="w-[140px] text-center font-semibold">Tindakan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-40 text-center">
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <Users className="h-10 w-10" />
                          <p className="font-medium">Tiada ahli ditemui</p>
                          <p className="text-sm">Cuba ubah kriteria carian atau tapisan anda.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedMembers.map((member) => (
                      <TableRow
                        key={member.id}
                        className="border-slate-100 dark:border-slate-700/50"
                      >
                        <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-400">
                          {member.memberNo}
                        </TableCell>
                        <TableCell className="font-medium text-slate-900 dark:text-white">
                          {member.name}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-slate-600 dark:text-slate-400">
                          {member.icNumber}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                          {member.phone}
                        </TableCell>
                        <TableCell className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {formatCurrency(member.monthlyIncome)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-xs font-medium ${getStatusColor(member.status)}`}
                          >
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/30"
                              onClick={() => handleViewMember(member)}
                              title="Lihat"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:text-amber-400 dark:hover:bg-amber-900/30"
                              onClick={() => handleEditMember(member)}
                              title="Sunting"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/30"
                              onClick={() => handleDeleteClick(member)}
                              title="Padam"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {filteredMembers.length > 0 && (
              <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Menunjukkan {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredMembers.length)} daripada {filteredMembers.length} ahli
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="gap-1 border-slate-200 dark:border-slate-600"
                  >
                    <ChevronDown className="h-4 w-4 rotate-90" />
                    Sebelum
                  </Button>
                  <div className="hidden items-center gap-1 sm:flex">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`h-8 w-8 p-0 ${currentPage === page ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-slate-200 dark:border-slate-600'}`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="gap-1 border-slate-200 dark:border-slate-600"
                  >
                    Seterusnya
                    <ChevronDown className="h-4 w-4 -rotate-90" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card List - Mobile */}
        <div className="space-y-3 md:hidden">
          {paginatedMembers.length === 0 ? (
            <Card className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50">
              <CardContent className="flex flex-col items-center gap-2 py-12 text-slate-400">
                <Users className="h-10 w-10" />
                <p className="font-medium">Tiada ahli ditemui</p>
                <p className="text-sm">Cuba ubah kriteria carian.</p>
              </CardContent>
            </Card>
          ) : (
            paginatedMembers.map((member) => (
              <Card
                key={member.id}
                className="border-slate-200 bg-white transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800/50"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="truncate font-semibold text-slate-900 dark:text-white">
                          {member.name}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`shrink-0 text-[10px] ${getStatusColor(member.status)}`}
                        >
                          {member.status}
                        </Badge>
                      </div>
                      <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                        {member.memberNo}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <span className="text-xs font-medium text-slate-400 dark:text-slate-500">IC:</span>
                      <span className="font-mono">{member.icNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{member.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Banknote className="h-3.5 w-3.5 text-slate-400" />
                      <span className="font-medium">{formatCurrency(member.monthlyIncome)}</span>
                      <span className="text-xs text-slate-400">/bulan</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-700">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5 text-xs border-slate-200 dark:border-slate-600"
                      onClick={() => handleViewMember(member)}
                    >
                      <Eye className="h-3.5 w-3.5" /> Lihat
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-1.5 text-xs border-slate-200 dark:border-slate-600"
                      onClick={() => handleEditMember(member)}
                    >
                      <Pencil className="h-3.5 w-3.5" /> Sunting
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/30 border-slate-200 dark:border-slate-600"
                      onClick={() => handleDeleteClick(member)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {/* Mobile Pagination */}
          {filteredMembers.length > 0 && (
            <div className="flex items-center justify-between px-1 py-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentPage}/{totalPages} halaman ({filteredMembers.length} ahli)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8 border-slate-200 dark:border-slate-600"
                >
                  <ChevronDown className="h-4 w-4 rotate-90" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 border-slate-200 dark:border-slate-600"
                >
                  <ChevronDown className="h-4 w-4 -rotate-90" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ===================== Add/Edit Dialog ===================== */}
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            form.reset();
            setEditingMember(null);
          }
        }}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">
                {editingMember ? 'Sunting Maklumat Ahli' : 'Tambah Ahli Baru'}
              </DialogTitle>
              <DialogDescription>
                {editingMember
                  ? 'Kemaskini maklumat ahli asnaf di bawah.'
                  : 'Isikan maklumat ahli asnaf yang baharu.'}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Maklumat Peribadi */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Maklumat Peribadi</h3>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Penuh <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="cth: Ahmad bin Abdullah" {...field} className="border-slate-200 dark:border-slate-600" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="icNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>No. Kad Pengenalan <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="cth: 901231-01-5234" {...field} className="font-mono border-slate-200 dark:border-slate-600" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>No. Telefon <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="cth: 013-7892341" {...field} className="border-slate-200 dark:border-slate-600" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emel</FormLabel>
                          <FormControl>
                            <Input placeholder="cth: ahmad@email.com" {...field} className="border-slate-200 dark:border-slate-600" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maritalStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status Perkahwinan</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="border-slate-200 dark:border-slate-600">
                                <SelectValue placeholder="Pilih status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Bujang">Bujang</SelectItem>
                              <SelectItem value="Berkahwin">Berkahwin</SelectItem>
                              <SelectItem value="Bercerai">Bercerai</SelectItem>
                              <SelectItem value="Janda/Duda">Janda/Duda</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="occupation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pekerjaan</FormLabel>
                          <FormControl>
                            <Input placeholder="cth: Pemandu Teksi" {...field} className="border-slate-200 dark:border-slate-600" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Alamat */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Alamat</h3>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alamat <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="No. rumah, jalan" {...field} className="border-slate-200 dark:border-slate-600" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bandar <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="cth: Gombak" {...field} className="border-slate-200 dark:border-slate-600" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Negeri <span className="text-red-500">*</span></FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="border-slate-200 dark:border-slate-600">
                                <SelectValue placeholder="Pilih negeri" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {MALAYSIAN_STATES.map((state) => (
                                <SelectItem key={state} value={state}>{state}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kod Pos</FormLabel>
                          <FormControl>
                            <Input placeholder="cth: 53100" {...field} className="border-slate-200 dark:border-slate-600" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Kewangan */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Maklumat Kewangan</h3>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="householdSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Saiz Isi Rumah</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} placeholder="0" {...field} className="border-slate-200 dark:border-slate-600" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="monthlyIncome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pendapatan Bulanan (RM)</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} placeholder="0" {...field} className="border-slate-200 dark:border-slate-600" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bankAccount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>No. Akaun Bank</FormLabel>
                          <FormControl>
                            <Input placeholder="cth: 1234 5678 9012" {...field} className="font-mono border-slate-200 dark:border-slate-600" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Bank</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="border-slate-200 dark:border-slate-600">
                                <SelectValue placeholder="Pilih bank" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {BANKS.map((bank) => (
                                <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Status & Notes */}
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status Ahli</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="border-slate-200 dark:border-slate-600">
                                <SelectValue placeholder="Pilih status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Aktif">Aktif</SelectItem>
                              <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                              <SelectItem value="Senarai Hitam">Senarai Hitam</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catatan</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Catatan tambahan mengenai ahli ini..."
                            rows={3}
                            {...field}
                            className="border-slate-200 dark:border-slate-600"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      form.reset();
                      setEditingMember(null);
                    }}
                    className="border-slate-200 dark:border-slate-600"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {editingMember ? 'Simpan Perubahan' : 'Tambah Ahli'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* ===================== View Member Sheet ===================== */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
            {viewingMember && (
              <>
                <SheetHeader className="pb-4">
                  <SheetTitle className="text-lg font-bold">{viewingMember.name}</SheetTitle>
                  <SheetDescription>{viewingMember.memberNo}</SheetDescription>
                </SheetHeader>

                <ScrollArea className="h-[calc(100vh-8rem)]">
                  <div className="space-y-6 pb-8 pr-4">
                    {/* Status Badge */}
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={`text-sm font-semibold ${getStatusColor(viewingMember.status)}`}
                      >
                        {viewingMember.status}
                      </Badge>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        Sertai: {formatDate(viewingMember.joinDate)}
                      </span>
                    </div>

                    {/* Personal Info */}
                    <section>
                      <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        <Users className="h-4 w-4" /> Maklumat Peribadi
                      </h4>
                      <div className="space-y-2.5 rounded-lg border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/30">
                        <InfoRow label="No. IC" value={viewingMember.icNumber} mono />
                        <InfoRow label="Telefon" value={viewingMember.phone} icon={<Phone className="h-3.5 w-3.5" />} />
                        {viewingMember.email && (
                          <InfoRow label="Emel" value={viewingMember.email} icon={<Mail className="h-3.5 w-3.5" />} />
                        )}
                        <InfoRow label="Status Perkahwinan" value={viewingMember.maritalStatus} />
                        <InfoRow label="Pekerjaan" value={viewingMember.occupation || '-'} icon={<Briefcase className="h-3.5 w-3.5" />} />
                      </div>
                    </section>

                    {/* Address */}
                    <section>
                      <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        <MapPin className="h-4 w-4" /> Alamat
                      </h4>
                      <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/30">
                        <p className="text-sm text-slate-700 dark:text-slate-300">{viewingMember.address}</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{viewingMember.city}, {viewingMember.state} {viewingMember.postalCode}</p>
                      </div>
                    </section>

                    {/* Financial */}
                    <section>
                      <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        <Banknote className="h-4 w-4" /> Maklumat Kewangan
                      </h4>
                      <div className="space-y-2.5 rounded-lg border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/30">
                        <InfoRow label="Pendapatan Bulanan" value={formatCurrency(viewingMember.monthlyIncome)} />
                        <InfoRow label="Saiz Isi Rumah" value={`${viewingMember.householdSize} orang`} icon={<Home className="h-3.5 w-3.5" />} />
                        {viewingMember.bankAccount && (
                          <InfoRow label="No. Akaun Bank" value={viewingMember.bankAccount} mono />
                        )}
                        {viewingMember.bankName && (
                          <InfoRow label="Nama Bank" value={viewingMember.bankName} />
                        )}
                      </div>
                    </section>

                    {/* Notes */}
                    {viewingMember.notes && (
                      <section>
                        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          <FileText className="h-4 w-4" /> Catatan
                        </h4>
                        <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/30">
                          <p className="text-sm whitespace-pre-wrap text-slate-600 dark:text-slate-400">{viewingMember.notes}</p>
                        </div>
                      </section>
                    )}

                    {/* Related Cases */}
                    {mockRelatedCases[viewingMember.id] && (
                      <section>
                        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          <CalendarDays className="h-4 w-4" /> Kes Berkaitan
                        </h4>
                        <div className="overflow-hidden rounded-lg border border-slate-100 dark:border-slate-700">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-slate-50/80 dark:bg-slate-900/50 hover:bg-slate-50/80">
                                <TableHead className="text-xs">No. Kes</TableHead>
                                <TableHead className="text-xs">Jenis</TableHead>
                                <TableHead className="text-xs text-right">Jumlah</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {mockRelatedCases[viewingMember.id].map((c) => (
                                <TableRow key={c.id} className="border-slate-100 dark:border-slate-700/50">
                                  <TableCell className="font-mono text-xs">{c.caseNo}</TableCell>
                                  <TableCell className="text-xs">{c.type}</TableCell>
                                  <TableCell className="text-right text-xs font-medium">{formatCurrency(c.amount)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </section>
                    )}

                    {/* Household Members */}
                    {mockHouseholdMembers[viewingMember.id] && (
                      <section>
                        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          <Home className="h-4 w-4" /> Ahli Isi Rumah
                        </h4>
                        <div className="overflow-hidden rounded-lg border border-slate-100 dark:border-slate-700">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-slate-50/80 dark:bg-slate-900/50 hover:bg-slate-50/80">
                                <TableHead className="text-xs">Nama</TableHead>
                                <TableHead className="text-xs">Hubungan</TableHead>
                                <TableHead className="text-xs text-right">Umur</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {mockHouseholdMembers[viewingMember.id].map((h) => (
                                <TableRow key={h.id} className="border-slate-100 dark:border-slate-700/50">
                                  <TableCell className="text-xs font-medium">{h.name}</TableCell>
                                  <TableCell className="text-xs text-slate-500">{h.relationship}</TableCell>
                                  <TableCell className="text-right text-xs">{h.age} tahun</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </section>
                    )}

                    {/* Action Buttons */}
                    <Separator />
                    <div className="flex gap-3">
                      <Button
                        className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => {
                          setSheetOpen(false);
                          handleEditMember(viewingMember);
                        }}
                      >
                        <Pencil className="h-4 w-4" /> Sunting
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
                        onClick={() => {
                          setSheetOpen(false);
                          handleDeleteClick(viewingMember);
                        }}
                      >
                        <Trash2 className="h-4 w-4" /> Padam
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
              </>
            )}
          </SheetContent>
        </Sheet>

        {/* ===================== Delete Confirmation Dialog ===================== */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Padam Ahli Asnaf?</AlertDialogTitle>
              <AlertDialogDescription>
                Adakah anda pasti ingin memadam ahli <strong>{deletingMember?.name}</strong> ({deletingMember?.memberNo})? 
                Tindakan ini tidak boleh dibatalkan dan semua data ahli akan dipadamkan secara kekal.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setDeletingMember(null);
                }}
              >
                Batal
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                Ya, Padam
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// ===================== Sub-Components =====================

function InfoRow({ label, value, icon, mono }: { label: string; value: string; icon?: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="flex shrink-0 items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        {icon}
        {label}
      </span>
      <span className={`text-right text-sm font-medium text-slate-800 dark:text-slate-200 ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  );
}
