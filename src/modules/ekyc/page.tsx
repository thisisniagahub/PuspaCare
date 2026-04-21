'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  ShieldCheck,
  Camera,
  Upload,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  User,
  CreditCard,
  ScanFace,
  FileCheck,
  RefreshCw,
  Ban,
  BadgeCheck,
  CircleCheck,
  Wallet,
  ArrowRight,
  Star,
  Fingerprint,
  Sparkles,
  Image as ImageIcon,
  Info,
  Loader2,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

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

import { api } from '@/lib/api';

// ═══════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════

type KYCStatus = 'pending' | 'processing' | 'verified' | 'rejected' | 'expired';
type RiskLevel = 'Rendah' | 'Sederhana' | 'Tinggi';

interface Member {
  id: string;
  memberNumber: string;
  name: string;
  ic: string;
  phone: string;
  email?: string;
  address: string;
  status: string;
}

interface EKYCRecord {
  id: string;
  memberId: string;
  memberName: string;
  memberIc: string;
  icFrontUrl?: string;
  icBackUrl?: string;
  icName?: string;
  icNumber?: string;
  icAddress?: string;
  icDateOfBirth?: string;
  icGender?: string;
  selfieUrl?: string;
  livenessScore?: number;
  livenessMethod?: string;
  faceMatchScore?: number;
  status: KYCStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  bnmCompliant: boolean;
  amlaScreening?: string;
  riskLevel?: string;
  screeningNotes?: string;
  walletEnabled: boolean;
  walletLimit: number;
  previousLimit: number;
  limitUpgradedAt?: string;
  bankTransferEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface OCRData {
  name: string;
  icNumber: string;
  address: string;
  dateOfBirth: string;
  gender: string;
}

// ═══════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════

const LIVENESS_CHALLENGES = [
  { key: 'blink', label: 'Kedipkan mata', icon: Eye, duration: 2500 },
  { key: 'smile', label: 'Senyum', icon: Star, duration: 2000 },
  { key: 'turnLeft', label: 'Pusing kepala ke kiri', icon: RefreshCw, duration: 3000 },
];

const MOCK_MEMBERS: Member[] = [
  { id: 'm1', memberNumber: 'ASN-2024-001', name: 'Ahmad bin Abdullah', ic: '850315-01-5123', phone: '013-7892341', email: 'ahmad@email.com', address: 'No. 12, Jalan Hulu Klang 4', status: 'active' },
  { id: 'm2', memberNumber: 'ASN-2024-002', name: 'Siti binti Hassan', ic: '901231-14-5234', phone: '019-3456782', email: 'siti@email.com', address: 'No. 8, Jalan Gombak 7/2', status: 'active' },
  { id: 'm3', memberNumber: 'ASN-2024-003', name: 'Muhammad Amin bin Ismail', ic: '780422-01-5456', phone: '012-9876543', email: 'amin@email.com', address: 'No. 25, Jalan Ampang Hilir', status: 'active' },
  { id: 'm4', memberNumber: 'ASN-2024-004', name: 'Nur Aisyah binti Muhammad', ic: '950817-02-5789', phone: '017-2345678', email: 'aisyah@email.com', address: 'Blok C, Pangsapuri Sri Gombak', status: 'active' },
  { id: 'm5', memberNumber: 'ASN-2024-005', name: 'Ismail bin Osman', ic: '700510-01-5123', phone: '011-5678901', address: 'No. 45, Kampung Melayu Hulu Klang', status: 'inactive' },
  { id: 'm6', memberNumber: 'ASN-2024-006', name: 'Fatimah binti Zahari', ic: '820725-03-5345', phone: '016-8901234', email: 'fatimah@email.com', address: 'No. 3, Jalan Ampang Utama', status: 'active' },
  { id: 'm7', memberNumber: 'ASN-2024-007', name: 'Abdul Rahman bin Haji Yusof', ic: '650101-01-5567', phone: '013-4567890', email: 'arahman@email.com', address: 'No. 18, Jalan Setapak 5', status: 'active' },
  { id: 'm8', memberNumber: 'ASN-2024-008', name: 'Zulkifli bin Mat', ic: '880319-01-5890', phone: '019-5678901', address: 'No. 7, Lorong Gombak 3', status: 'blacklisted' },
  { id: 'm9', memberNumber: 'ASN-2024-009', name: 'Rohani binti Ali', ic: '920605-02-5234', phone: '014-3456789', email: 'rohani@email.com', address: 'No. 33, Jalan Keramat AU3', status: 'active' },
  { id: 'm10', memberNumber: 'ASN-2024-010', name: 'Hassan bin Ahmad', ic: '751112-01-5456', phone: '018-2345678', email: 'hassan@email.com', address: 'No. 56, Jalan Ampang Point', status: 'active' },
];

const MOCK_EKYC_RECORDS: EKYCRecord[] = [
  {
    id: 'ekyc1', memberId: 'm1', memberName: 'Ahmad bin Abdullah', memberIc: '850315-01-5123',
    status: 'verified', livenessScore: 96.5, faceMatchScore: 94.2, bnmCompliant: true,
    amlaScreening: 'Lulus', riskLevel: 'Rendah', walletEnabled: true, walletLimit: 5000,
    previousLimit: 200, bankTransferEnabled: true, verifiedBy: 'admin@puspa.org',
    verifiedAt: '2024-12-15T10:30:00Z', createdAt: '2024-12-15T09:00:00Z', updatedAt: '2024-12-15T10:30:00Z',
  },
  {
    id: 'ekyc2', memberId: 'm2', memberName: 'Siti binti Hassan', memberIc: '901231-14-5234',
    status: 'pending', livenessScore: 91.3, faceMatchScore: 89.7, bnmCompliant: false,
    amlaScreening: 'Dalam Semakan', riskLevel: 'Sederhana', walletEnabled: false, walletLimit: 200,
    previousLimit: 200, bankTransferEnabled: false, createdAt: '2024-12-20T14:00:00Z', updatedAt: '2024-12-20T14:00:00Z',
  },
  {
    id: 'ekyc3', memberId: 'm3', memberName: 'Muhammad Amin bin Ismail', memberIc: '780422-01-5456',
    status: 'processing', livenessScore: 88.1, faceMatchScore: 92.4, bnmCompliant: false,
    amlaScreening: 'Dalam Semakan', riskLevel: 'Rendah', walletEnabled: false, walletLimit: 200,
    previousLimit: 200, bankTransferEnabled: false, createdAt: '2024-12-22T08:30:00Z', updatedAt: '2024-12-22T09:00:00Z',
  },
  {
    id: 'ekyc4', memberId: 'm4', memberName: 'Nur Aisyah binti Muhammad', memberIc: '950817-02-5789',
    status: 'rejected', livenessScore: 45.2, faceMatchScore: 38.9, bnmCompliant: false,
    amlaScreening: 'Gagal', riskLevel: 'Tinggi', walletEnabled: false, walletLimit: 200,
    previousLimit: 200, bankTransferEnabled: false, rejectionReason: 'Gambar tidak jelas dan pengesahan muka gagal',
    createdAt: '2024-12-18T11:00:00Z', updatedAt: '2024-12-19T16:00:00Z',
  },
  {
    id: 'ekyc5', memberId: 'm6', memberName: 'Fatimah binti Zahari', memberIc: '820725-03-5345',
    status: 'verified', livenessScore: 97.8, faceMatchScore: 96.1, bnmCompliant: true,
    amlaScreening: 'Lulus', riskLevel: 'Rendah', walletEnabled: true, walletLimit: 5000,
    previousLimit: 200, bankTransferEnabled: true, verifiedBy: 'admin@puspa.org',
    verifiedAt: '2024-12-10T14:20:00Z', createdAt: '2024-12-10T13:00:00Z', updatedAt: '2024-12-10T14:20:00Z',
  },
  {
    id: 'ekyc6', memberId: 'm9', memberName: 'Rohani binti Ali', memberIc: '920605-02-5234',
    status: 'expired', livenessScore: 72.4, faceMatchScore: 68.3, bnmCompliant: false,
    amlaScreening: 'Tamat Tempoh', riskLevel: 'Sederhana', walletEnabled: false, walletLimit: 200,
    previousLimit: 200, bankTransferEnabled: false, rejectionReason: 'Pengesahan telah tamat tempoh (30 hari)',
    createdAt: '2024-10-01T09:00:00Z', updatedAt: '2024-11-01T09:00:00Z',
  },
];

// ═══════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ms-MY', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getStatusConfig(status: KYCStatus): { label: string; color: string; bgColor: string; borderColor: string } {
  switch (status) {
    case 'pending':
      return { label: 'Menunggu', color: 'text-amber-700 dark:text-amber-300', bgColor: 'bg-amber-50 dark:bg-amber-950/40', borderColor: 'border-amber-200 dark:border-amber-800' };
    case 'processing':
      return { label: 'Dalam Proses', color: 'text-sky-700 dark:text-sky-300', bgColor: 'bg-sky-50 dark:bg-sky-950/40', borderColor: 'border-sky-200 dark:border-sky-800' };
    case 'verified':
      return { label: 'Disahkan', color: 'text-emerald-700 dark:text-emerald-300', bgColor: 'bg-emerald-50 dark:bg-emerald-950/40', borderColor: 'border-emerald-200 dark:border-emerald-800' };
    case 'rejected':
      return { label: 'Ditolak', color: 'text-red-700 dark:text-red-300', bgColor: 'bg-red-50 dark:bg-red-950/40', borderColor: 'border-red-200 dark:border-red-800' };
    case 'expired':
      return { label: 'Tamat Tempoh', color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-50 dark:bg-gray-900/40', borderColor: 'border-gray-200 dark:border-gray-700' };
    default:
      return { label: status, color: 'text-gray-700', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' };
  }
}

function getRiskConfig(level: string): { color: string; bg: string; border: string } {
  switch (level) {
    case 'Rendah':
      return { color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-200 dark:border-emerald-800' };
    case 'Sederhana':
      return { color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/40', border: 'border-amber-200 dark:border-amber-800' };
    case 'Tinggi':
      return { color: 'text-red-700 dark:text-red-300', bg: 'bg-red-50 dark:bg-red-950/40', border: 'border-red-200 dark:border-red-800' };
    default:
      return { color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' };
  }
}

function getScoreBadgeConfig(score: number): { label: string; color: string; bg: string; border: string } {
  if (score >= 80) return { label: 'Baik', color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-200 dark:border-emerald-800' };
  if (score >= 60) return { label: 'Sederhana', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/40', border: 'border-amber-200 dark:border-amber-800' };
  return { label: 'Rendah', color: 'text-red-700 dark:text-red-300', bg: 'bg-red-50 dark:bg-red-950/40', border: 'border-red-200 dark:border-red-800' };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
}

function generateSimulatedScore(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

// ═══════════════════════════════════════════════════
// Sub-Components
// ═══════════════════════════════════════════════════

// ── Circular Score Display ──

function CircularScore({ score, label, size = 80, strokeWidth = 6 }: { score: number; label: string; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;
  const cfg = getScoreBadgeConfig(score);
  const strokeColor = score >= 80 ? 'stroke-emerald-500' : score >= 60 ? 'stroke-amber-500' : 'stroke-red-500';
  const trackColor = score >= 80 ? 'stroke-emerald-100 dark:stroke-emerald-900/40' : score >= 60 ? 'stroke-amber-100 dark:stroke-amber-900/40' : 'stroke-red-100 dark:stroke-red-900/40';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} className={trackColor} />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth}
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            className={`${strokeColor} transition-all duration-1000 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-lg font-bold leading-none ${cfg.color}`}>{score.toFixed(1)}%</span>
        </div>
      </div>
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

// ── Step Indicator ──

function StepIndicator({ steps, currentStep }: { steps: { label: string; icon: React.ElementType }[]; currentStep: number }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx === currentStep;
          const isCompleted = idx < currentStep;
          return (
            <React.Fragment key={idx}>
              <div className="flex flex-col items-center gap-1.5">
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    backgroundColor: isCompleted ? '#16a34a' : isActive ? '#9333ea' : '#e5e7eb',
                  }}
                  className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${isCompleted ? 'bg-emerald-600' : isActive ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`} />
                  )}
                </motion.div>
                <span className={`text-[10px] sm:text-xs font-medium text-center leading-tight ${isActive ? 'text-purple-700 dark:text-purple-300' : isCompleted ? 'text-emerald-700 dark:text-emerald-300' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className="flex-1 mx-2 sm:mx-4">
                  <div className="h-0.5 rounded-full bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                    <motion.div
                      animate={{ width: isCompleted ? '100%' : '0%' }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full"
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ── Image Upload Area ──

function ImageUploadArea({
  label,
  description,
  value,
  onUpload,
  instruction,
}: {
  label: string;
  description: string;
  value: string | null;
  onUpload: (base64: string) => void;
  instruction: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Sila pilih fail gambar (JPG, PNG)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Saiz fail terlalu besar (maksimum 10MB)');
      return;
    }
    try {
      const base64 = await fileToBase64(file);
      onUpload(base64);
      toast.success('Gambar berjaya dimuat naik');
    } catch {
      toast.error('Gagal memuat naik gambar');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{label}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>

      {value ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <div className="rounded-xl overflow-hidden border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
            <img src={value} alt={label} className="w-full max-h-72 object-contain mx-auto" />
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Gambar Diterima
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-red-600"
              onClick={() => onUpload('')}
            >
              <X className="w-3.5 h-3.5 mr-1" /> Alih Keluar
            </Button>
          </div>
        </motion.div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200
            ${dragOver
              ? 'border-purple-400 bg-purple-50 dark:bg-purple-950/20 scale-[1.02]'
              : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/40 hover:border-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-950/10'
            }
          `}
        >
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className={`
              flex items-center justify-center w-16 h-16 rounded-2xl mb-4 transition-colors
              ${dragOver ? 'bg-purple-100 dark:bg-purple-900/40' : 'bg-gray-100 dark:bg-gray-800'}
            `}>
              {dragOver ? (
                <Upload className="w-8 h-8 text-purple-600" />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
              {dragOver ? 'Lepaskan gambar di sini' : 'Klik atau seret gambar ke sini'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG — Maksimum 10MB</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleChange}
          />
        </div>
      )}

      <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3">
        <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-700 dark:text-amber-300">{instruction}</p>
      </div>
    </div>
  );
}

// ── Liveness Detection ──

function LivenessDetection({
  onComplete,
}: {
  onComplete: (base64: string, score: number) => void;
}) {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [challengeCompleted, setChallengeCompleted] = useState<boolean[]>([false, false, false]);
  const [isRunning, setIsRunning] = useState(false);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const completedCount = challengeCompleted.filter(Boolean).length;

  // Effect-driven challenge runner — advances automatically when a challenge completes
  useEffect(() => {
    if (!isRunning) return;
    if (currentChallenge >= LIVENESS_CHALLENGES.length) return;

    const timer = setTimeout(() => {
      setChallengeCompleted((prev) => {
        const next = [...prev];
        next[currentChallenge] = true;
        return next;
      });

      // If this was the last challenge, schedule completion
      const nextIdx = currentChallenge + 1;
      if (nextIdx >= LIVENESS_CHALLENGES.length) {
        setCurrentChallenge(nextIdx);
        // Small delay to let the state update render, then finalize
        setTimeout(() => {
          const score = generateSimulatedScore(85, 99);
          setFinalScore(score);
          setIsRunning(false);
          // Read selfieImage from the closure or latest state
          setSelfieImage((latest) => {
            if (latest) {
              onComplete(latest, score);
            }
            return latest;
          });
        }, 300);
      } else {
        setCurrentChallenge(nextIdx);
      }
    }, LIVENESS_CHALLENGES[currentChallenge].duration);

    timerRef.current = timer;

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isRunning, currentChallenge, onComplete]);

  const handleSelfieUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Sila pilih fail gambar');
      return;
    }
    try {
      const base64 = await fileToBase64(file);
      setSelfieImage(base64);
      toast.success('Gambar selfie berjaya ditangkap');
    } catch {
      toast.error('Gagal menangkap gambar');
    }
  };

  const startDetection = () => {
    if (!selfieImage) {
      toast.error('Sila tangkap gambar selfie terlebih dahulu');
      return;
    }
    setChallengeCompleted([false, false, false]);
    setFinalScore(null);
    setCurrentChallenge(0);
    setIsRunning(true);
    setHasStarted(true);
  };

  const resetDetection = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsRunning(false);
    setCurrentChallenge(0);
    setChallengeCompleted([false, false, false]);
    setFinalScore(null);
    setHasStarted(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const challenge = LIVENESS_CHALLENGES[currentChallenge];
  const ChallengeIcon = challenge?.icon || Eye;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pengesanan Muka Hidup</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Pengesahan muka secara langsung untuk memastikan identiti sebenar
        </p>
      </div>

      {/* Selfie Upload */}
      {!selfieImage ? (
        <div
          onClick={() => inputRef.current?.click()}
          className="relative cursor-pointer rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/40 hover:border-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-950/10 transition-all"
        >
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900/40 mb-4 relative">
              <ScanFace className="w-10 h-10 text-purple-600" />
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-2 border-purple-400"
              />
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
              Tangkap Gambar Selfie
            </p>
            <p className="text-xs text-muted-foreground mt-1">Arahkan muka anda ke kamera</p>
            <Button variant="outline" className="mt-4 gap-2 border-purple-200 text-purple-700 hover:bg-purple-50">
              <Camera className="w-4 h-4" /> Buka Kamera
            </Button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleSelfieUpload(file);
            }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl overflow-hidden border-2 border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20 relative">
            <img src={selfieImage} alt="Selfie" className="w-full max-h-64 object-contain mx-auto" />
            {/* Animated face guide overlay */}
            {isRunning && (
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="w-40 h-52 border-4 border-purple-400 rounded-[50%] opacity-60" />
              </motion.div>
            )}
          </div>

          {!finalScore && (
            <Button
              variant="outline"
              size="sm"
              className="text-muted-foreground hover:text-red-600"
              onClick={() => { setSelfieImage(null); resetDetection(); }}
            >
              <X className="w-3.5 h-3.5 mr-1" /> Ambil Semula Selfie
            </Button>
          )}
        </div>
      )}

      {/* Challenge Section */}
      {selfieImage && !finalScore && (
        <Card className="border-gray-200 dark:border-gray-700">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Cabaran Pengesahan</h4>
              <span className="text-xs text-muted-foreground">{completedCount}/{LIVENESS_CHALLENGES.length} selesai</span>
            </div>

            <Progress value={(completedCount / LIVENESS_CHALLENGES.length) * 100} className="h-2 [&>div]:bg-purple-600" />

            {/* Active Challenge */}
            {isRunning && challenge && (
              <motion.div
                key={currentChallenge}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-4 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 p-4"
              >
                <motion.div
                  animate={{ rotate: challenge.key === 'turnLeft' ? [0, -20, 0] : 0, scale: challenge.key === 'blink' ? [1, 0.9, 1] : 1 }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/40"
                >
                  <ChallengeIcon className="w-6 h-6 text-purple-600" />
                </motion.div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                    Sila: {challenge.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Mengesahkan cabaran {currentChallenge + 1} daripada {LIVENESS_CHALLENGES.length}...
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader2 className="w-5 h-5 text-purple-500" />
                </motion.div>
              </motion.div>
            )}

            {/* Challenge Items */}
            <div className="space-y-2">
              {LIVENESS_CHALLENGES.map((ch, idx) => {
                const ChIcon = ch.icon;
                const isCurrent = idx === currentChallenge && isRunning;
                const isDone = challengeCompleted[idx];
                return (
                  <div
                    key={ch.key}
                    className={`flex items-center gap-3 rounded-lg p-2.5 transition-colors ${
                      isDone
                        ? 'bg-emerald-50 dark:bg-emerald-950/20'
                        : isCurrent
                          ? 'bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800'
                          : 'bg-gray-50 dark:bg-gray-900/30'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                      isDone ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <ChIcon className={`w-4 h-4 ${isCurrent ? 'text-purple-600' : 'text-gray-400'}`} />
                      )}
                    </div>
                    <span className={`text-sm flex-1 ${isDone ? 'text-emerald-700 dark:text-emerald-300 line-through' : isCurrent ? 'text-purple-700 dark:text-purple-300 font-medium' : 'text-muted-foreground'}`}>
                      {ch.label}
                    </span>
                    {isDone && (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 text-[10px]">
                        Selesai
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {!isRunning && !hasStarted && (
                <Button
                  onClick={startDetection}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Mula Pengesahan
                </Button>
              )}
              {isRunning && (
                <Button
                  variant="outline"
                  onClick={resetDetection}
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-1" /> Berhenti
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Final Score */}
      {finalScore !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/10">
            <CardContent className="p-6 flex flex-col items-center gap-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                <CircleCheck className="w-8 h-8 text-emerald-600" />
              </div>
              <h4 className="text-lg font-bold text-emerald-800 dark:text-emerald-200">Pengesahan Berjaya!</h4>
              <CircularScore score={finalScore} label="Skor Liveness" size={120} strokeWidth={10} />
              <p className="text-sm text-muted-foreground text-center">
                Pengesanan muka hidup telah selesai dengan skor {finalScore}%
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={resetDetection}
                className="text-purple-700 border-purple-200 hover:bg-purple-50"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" /> Uji Semula
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// Main Page Component
// ═══════════════════════════════════════════════════

export default function EKYCPage() {
  // ── Wizard State ──
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [icFront, setIcFront] = useState<string | null>(null);
  const [icBack, setIcBack] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [livenessScore, setLivenessScore] = useState<number | null>(null);
  const [faceMatchScore, setFaceMatchScore] = useState<number | null>(null);
  const [ocrData, setOcrData] = useState<OCRData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── List State ──
  const [records, setRecords] = useState<EKYCRecord[]>(MOCK_EKYC_RECORDS);
  const [statusFilter, setStatusFilter] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailRecord, setDetailRecord] = useState<EKYCRecord | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectTarget, setRejectTarget] = useState<EKYCRecord | null>(null);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  // ── Member Selection State ──
  const [memberSearch, setMemberSearch] = useState('');
  const [memberLoading, setMemberLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);

  const WIZARD_STEPS = [
    { label: 'Pilih Ahli', icon: User },
    { label: 'IC Depan', icon: CreditCard },
    { label: 'IC Belakang', icon: CreditCard },
    { label: 'Pengesahan', icon: ScanFace },
    { label: 'Ringkasan', icon: FileCheck },
  ];

  // ── Load Members ──
  useEffect(() => {
    setMemberLoading(true);
    api.get<Member[]>('/members').catch(() => {
      // Use mock data if API fails
    }).finally(() => setMemberLoading(false));
  }, []);

  // ── Load Records ──
  useEffect(() => {
    api.get<EKYCRecord[]>('/ekyc').catch(() => {
      // Use mock data if API fails
    });
  }, []);

  // ── Filtered Members for Selection ──
  const filteredMembers = members.filter((m) => {
    const q = memberSearch.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.ic.includes(q) || m.memberNumber.toLowerCase().includes(q);
  });

  // ── Filtered Records ──
  const filteredRecords = records.filter((r) => {
    const matchesStatus = statusFilter === 'semua' || r.status === statusFilter;
    const matchesSearch = !searchQuery.trim() ||
      r.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.memberIc.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  // ── Stats ──
  const stats = {
    total: records.length,
    verified: records.filter((r) => r.status === 'verified').length,
    pending: records.filter((r) => r.status === 'pending').length,
    rejected: records.filter((r) => r.status === 'rejected').length,
  };

  // ── Can proceed to next step ──
  const canProceed = () => {
    switch (currentStep) {
      case 0: return !!selectedMember;
      case 1: return !!icFront;
      case 2: return !!icBack;
      case 3: return selfie !== null && livenessScore !== null;
      case 4: return true;
      default: return false;
    }
  };

  // ── Handle next / back ──
  const handleNext = () => {
    if (currentStep === 3) {
      // Moving from liveness to summary — simulate OCR + face match
      const simulatedOcr: OCRData = {
        name: selectedMember?.name || 'Ahmad bin Abdullah',
        icNumber: selectedMember?.ic || '850315-01-5123',
        address: selectedMember?.address || 'No. 12, Jalan Hulu Klang 4',
        dateOfBirth: '15 Mac 1985',
        gender: 'Lelaki',
      };
      setOcrData(simulatedOcr);
      setFaceMatchScore(generateSimulatedScore(85, 98));
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleStartNew = () => {
    setCurrentStep(0);
    setSelectedMember(null);
    setIcFront(null);
    setIcBack(null);
    setSelfie(null);
    setLivenessScore(null);
    setFaceMatchScore(null);
    setOcrData(null);
    setIsSubmitting(false);
  };

  // ── Submit Verification ──
  const handleSubmit = async () => {
    if (!selectedMember) return;
    setIsSubmitting(true);
    try {
      await api.post('/ekyc/verify', {
        memberId: selectedMember.id,
        icFrontUrl: icFront,
        icBackUrl: icBack,
        selfieUrl: selfie,
        livenessScore,
        livenessMethod: 'challenge_response',
        faceMatchScore,
        ocrData,
      });
      toast.success('Pengesahan eKYC berjaya dihantar!', {
        description: `Rekod untuk ${selectedMember.name} telah dihantar untuk pengesahan.`,
      });
      handleStartNew();
    } catch {
      toast.error('Gagal menghantar pengesahan', {
        description: 'Sila cuba lagi atau hubungi pentadbir sistem.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Admin Actions ──
  const handleApprove = async (record: EKYCRecord) => {
    setApproving(true);
    try {
      await api.post('/ekyc/verify', { id: record.id, action: 'approve' });
      setRecords((prev) =>
        prev.map((r) =>
          r.id === record.id
            ? { ...r, status: 'verified' as KYCStatus, verifiedAt: new Date().toISOString(), bnmCompliant: true, walletEnabled: true, walletLimit: 5000, bankTransferEnabled: true }
            : r
        )
      );
      toast.success(`Pengesahan untuk ${record.memberName} telah diluluskan`);
      setDetailRecord(null);
    } catch {
      toast.error('Gagal meluluskan pengesahan');
    } finally {
      setApproving(false);
    }
  };

  const openRejectDialog = (record: EKYCRecord) => {
    setRejectTarget(record);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!rejectTarget || !rejectReason.trim()) {
      toast.error('Sila nyatakan sebab penolakan');
      return;
    }
    setRejecting(true);
    try {
      await api.post('/ekyc/reject', { id: rejectTarget.id, reason: rejectReason });
      setRecords((prev) =>
        prev.map((r) =>
          r.id === rejectTarget.id
            ? { ...r, status: 'rejected' as KYCStatus, rejectionReason: rejectReason, updatedAt: new Date().toISOString() }
            : r
        )
      );
      toast.success(`Pengesahan untuk ${rejectTarget.memberName} telah ditolak`);
      setRejectDialogOpen(false);
      setDetailRecord(null);
      setRejectTarget(null);
      setRejectReason('');
    } catch {
      toast.error('Gagal menolak pengesahan');
    } finally {
      setRejecting(false);
    }
  };

  // ── Render ──

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100/80 dark:from-slate-950 dark:to-slate-900">
      {/* ── Header ── */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                <Fingerprint className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Pengesahan eKYC
                </h1>
                <p className="text-sm text-muted-foreground">
                  Pengenalan Elektronik Pelanggan — Selaras BNM AMLA
                </p>
              </div>
            </div>
            <Badge className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100 shrink-0 hidden sm:flex">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Selaras BNM AMLA
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ── Tabs ── */}
        <Tabs defaultValue="verification" className="space-y-6">
          <TabsList className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="verification" className="gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-sm">
              <ScanFace className="w-4 h-4" /> Pengesahan eKYC
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-sm">
              <FileCheck className="w-4 h-4" /> Senarai Pengesahan
              {stats.pending > 0 && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
                  {stats.pending}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ═══════════════════════════════════════════ */}
          {/* TAB 1: eKYC Verification Flow              */}
          {/* ═══════════════════════════════════════════ */}
          <TabsContent value="verification">
            <Card className="border-gray-200 dark:border-gray-700 overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                {/* Step Indicator */}
                <div className="mb-8">
                  <StepIndicator steps={WIZARD_STEPS} currentStep={currentStep} />
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* ── Step 1: Select Member ── */}
                    {currentStep === 0 && (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pilih Ahli</h3>
                          <p className="text-sm text-muted-foreground mt-1">Cari dan pilih ahli untuk memulakan pengesahan eKYC</p>
                        </div>

                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <Input
                            placeholder="Cari nama, No. IC atau No. Ahli..."
                            value={memberSearch}
                            onChange={(e) => setMemberSearch(e.target.value)}
                            className="pl-9 border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-900/50"
                          />
                        </div>

                        {memberLoading ? (
                          <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                              <Skeleton key={i} className="h-16 w-full rounded-lg" />
                            ))}
                          </div>
                        ) : (
                          <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                            {filteredMembers.length === 0 ? (
                              <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                                <User className="w-10 h-10" />
                                <p className="font-medium">Tiada ahli ditemui</p>
                              </div>
                            ) : (
                              filteredMembers.map((member) => {
                                const isSelected = selectedMember?.id === member.id;
                                return (
                                  <button
                                    key={member.id}
                                    onClick={() => setSelectedMember(member)}
                                    className={`
                                      w-full text-left p-3 rounded-xl border-2 transition-all duration-200
                                      ${isSelected
                                        ? 'border-purple-400 bg-purple-50 dark:bg-purple-950/20 shadow-sm'
                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-purple-200 hover:bg-purple-50/50 dark:hover:bg-purple-950/10'
                                      }
                                    `}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${isSelected ? 'bg-purple-200 dark:bg-purple-800' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                        <User className={`w-5 h-5 ${isSelected ? 'text-purple-700 dark:text-purple-300' : 'text-gray-400'}`} />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="font-medium text-gray-900 dark:text-white truncate">{member.name}</p>
                                        <p className="text-xs text-muted-foreground">{member.ic} • {member.memberNumber}</p>
                                      </div>
                                      {isSelected && (
                                        <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" />
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1.5 ml-13">
                                      <Badge
                                        variant="outline"
                                        className={`text-[10px] ${
                                          member.status === 'active'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : member.status === 'inactive'
                                              ? 'bg-gray-100 text-gray-600 border-gray-200'
                                              : 'bg-red-50 text-red-700 border-red-200'
                                        }`}
                                      >
                                        {member.status === 'active' ? 'Aktif' : member.status === 'inactive' ? 'Tidak Aktif' : 'Senarai Hitam'}
                                      </Badge>
                                    </div>
                                  </button>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── Step 2: IC Front ── */}
                    {currentStep === 1 && (
                      <ImageUploadArea
                        label="Tangkap IC Depan"
                        description={`Muat naik gambar bahagian hadapan kad pengenalan ${selectedMember?.name || ''}`}
                        value={icFront}
                        onUpload={(b64) => setIcFront(b64 || null)}
                        instruction="Pastikan gambar IC depan jelas dan tidak bergelak. Semua maklumat perlu boleh dibaca dengan jelas termasuk nama, nombor IC, dan alamat."
                      />
                    )}

                    {/* ── Step 3: IC Back ── */}
                    {currentStep === 2 && (
                      <ImageUploadArea
                        label="Tangkap IC Belakang"
                        description={`Muat naik gambar bahagian belakang kad pengenalan ${selectedMember?.name || ''}`}
                        value={icBack}
                        onUpload={(b64) => setIcBack(b64 || null)}
                        instruction="Pastikan gambar IC belakang jelas. Bahagian warna dan maklumat tambahan perlu kelihatan dengan jelas."
                      />
                    )}

                    {/* ── Step 4: Liveness Detection ── */}
                    {currentStep === 3 && (
                      <LivenessDetection
                        onComplete={(base64, score) => {
                          setSelfie(base64);
                          setLivenessScore(score);
                        }}
                      />
                    )}

                    {/* ── Step 5: Summary ── */}
                    {currentStep === 4 && (
                      <div className="space-y-6">
                        <div className="text-center">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ringkasan & Pengesahan</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Semak maklumat di bawah sebelum menghantar pengesahan
                          </p>
                        </div>

                        {/* Images Row */}
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { src: icFront, label: 'IC Depan' },
                            { src: icBack, label: 'IC Belakang' },
                            { src: selfie, label: 'Selfie' },
                          ].map((item) => (
                            <div key={item.label} className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                              <div className="aspect-[3/4]">
                                {item.src ? (
                                  <img src={item.src} alt={item.label} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon className="w-6 h-6 text-gray-300" />
                                  </div>
                                )}
                              </div>
                              <div className="px-2 py-1.5 border-t border-gray-200 dark:border-gray-700">
                                <span className="text-[10px] font-medium text-muted-foreground">{item.label}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* OCR Data */}
                        {ocrData && (
                          <Card className="border-gray-200 dark:border-gray-700">
                            <CardHeader className="pb-3">
                              <div className="flex items-center gap-2">
                                <ScanFace className="w-4 h-4 text-purple-600" />
                                <CardTitle className="text-sm">Data OCR (Pengekstrakan Automatik)</CardTitle>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                                  { label: 'Nama', value: ocrData.name },
                                  { label: 'No. IC', value: ocrData.icNumber },
                                  { label: 'Alamat', value: ocrData.address },
                                  { label: 'Tarikh Lahir', value: ocrData.dateOfBirth },
                                  { label: 'Jantina', value: ocrData.gender },
                                ].map((field) => (
                                  <div key={field.label} className="flex flex-col">
                                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{field.label}</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{field.value}</span>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Scores */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          <CircularScore
                            score={livenessScore || 0}
                            label="Skor Liveness"
                          />
                          <CircularScore
                            score={faceMatchScore || 0}
                            label="Padanan Muka"
                          />
                          <div className="flex flex-col items-center gap-3">
                            {/* AMLA Badge */}
                            <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20">
                              <ShieldCheck className="w-6 h-6 text-emerald-600" />
                              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">Lulus</Badge>
                              <span className="text-[10px] font-medium text-muted-foreground">Saringan AMLA</span>
                            </div>
                            {/* Risk Level */}
                            <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20">
                              <AlertTriangle className="w-6 h-6 text-emerald-600" />
                              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">Rendah</Badge>
                              <span className="text-[10px] font-medium text-muted-foreground">Tahap Risiko</span>
                            </div>
                          </div>
                        </div>

                        {/* Wallet Upgrade Info */}
                        <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 shrink-0">
                                <Wallet className="w-5 h-5 text-purple-600" />
                              </div>
                              <div className="flex-1 space-y-2">
                                <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-200">Peningkatan Had Wallet</h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold text-gray-400 line-through">{formatCurrency(200)}</span>
                                  <ArrowRight className="w-4 h-4 text-purple-600" />
                                  <span className="text-lg font-bold text-purple-700 dark:text-purple-300">{formatCurrency(5000)}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                  <div className="flex items-center gap-1">
                                    <BadgeCheck className="w-3 h-3 text-emerald-600" />
                                    <span className="text-emerald-700 dark:text-emerald-300">Pindahan Bank: Ya</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <BadgeCheck className="w-3 h-3 text-emerald-600" />
                                    <span className="text-emerald-700 dark:text-emerald-300">BNM AMLA: Selaras</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Member Info */}
                        {selectedMember && (
                          <Card className="border-gray-200 dark:border-gray-700">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40">
                                  <User className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">{selectedMember.name}</p>
                                  <p className="text-xs text-muted-foreground">{selectedMember.ic} • {selectedMember.memberNumber}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* ── Navigation Buttons ── */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  {currentStep > 0 ? (
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      className="gap-2 border-gray-200 dark:border-gray-600"
                    >
                      <ChevronLeft className="w-4 h-4" /> Kembali
                    </Button>
                  ) : (
                    <div />
                  )}

                  {currentStep < 4 ? (
                    <Button
                      onClick={handleNext}
                      disabled={!canProceed()}
                      className="gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {currentStep === 3 ? 'Lihat Ringkasan' : 'Seterusnya'}
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleStartNew}
                        className="gap-2 border-gray-200 dark:border-gray-600"
                      >
                        <RefreshCw className="w-4 h-4" /> Mula Baru
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="gap-2 bg-purple-600 hover:bg-purple-700"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Menghantar...
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" /> Hantar Pengesahan
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════════════════════════════════ */}
          {/* TAB 2: Verification List                   */}
          {/* ═══════════════════════════════════════════ */}
          <TabsContent value="list">
            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Jumlah', value: stats.total, icon: FileCheck, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/40' },
                { label: 'Disahkan', value: stats.verified, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/40' },
                { label: 'Menunggu', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/40' },
                { label: 'Ditolak', value: stats.rejected, icon: XCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/40' },
              ].map((stat) => (
                <Card key={stat.label} className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${stat.bg}`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Search & Filter */}
            <Card className="mb-6 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Cari nama ahli atau No. IC..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-900/50"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48 border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-900/50">
                      <SelectValue placeholder="Tapis status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semua">Semua Status</SelectItem>
                      <SelectItem value="pending">Menunggu</SelectItem>
                      <SelectItem value="processing">Dalam Proses</SelectItem>
                      <SelectItem value="verified">Disahkan</SelectItem>
                      <SelectItem value="rejected">Ditolak</SelectItem>
                      <SelectItem value="expired">Tamat Tempoh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Table - Desktop */}
            <Card className="hidden md:block border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-100 bg-gray-50/80 hover:bg-gray-50/80 dark:border-gray-700 dark:bg-gray-900/50">
                        <TableHead className="font-semibold">Ahli</TableHead>
                        <TableHead className="font-semibold">No. IC</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold text-center">Skor Muka</TableHead>
                        <TableHead className="font-semibold text-center">Skor Liveness</TableHead>
                        <TableHead className="font-semibold text-center">AMLA</TableHead>
                        <TableHead className="font-semibold text-center">Had Wallet</TableHead>
                        <TableHead className="font-semibold">Tarikh</TableHead>
                        <TableHead className="w-[80px] text-center font-semibold">Tindakan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="h-40 text-center">
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                              <FileCheck className="w-10 h-10" />
                              <p className="font-medium">Tiada rekod ditemui</p>
                              <p className="text-sm">Cuba ubah kriteria carian anda.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRecords.map((record) => {
                          const statusCfg = getStatusConfig(record.status);
                          return (
                            <TableRow
                              key={record.id}
                              className="border-gray-100 dark:border-gray-700/50 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                              onClick={() => setDetailRecord(record)}
                            >
                              <TableCell className="font-medium text-gray-900 dark:text-white">{record.memberName}</TableCell>
                              <TableCell className="font-mono text-sm text-muted-foreground">{record.memberIc}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={`text-xs ${statusCfg.color} ${statusCfg.bgColor} ${statusCfg.borderColor}`}>
                                  {statusCfg.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                {record.faceMatchScore !== undefined && record.faceMatchScore !== null ? (
                                  <Badge variant="outline" className={`text-xs ${getScoreBadgeConfig(record.faceMatchScore).color} ${getScoreBadgeConfig(record.faceMatchScore).bg} ${getScoreBadgeConfig(record.faceMatchScore).border}`}>
                                    {record.faceMatchScore.toFixed(1)}%
                                  </Badge>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {record.livenessScore !== undefined && record.livenessScore !== null ? (
                                  <Badge variant="outline" className={`text-xs ${getScoreBadgeConfig(record.livenessScore).color} ${getScoreBadgeConfig(record.livenessScore).bg} ${getScoreBadgeConfig(record.livenessScore).border}`}>
                                    {record.livenessScore.toFixed(1)}%
                                  </Badge>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {record.amlaScreening === 'Lulus' ? (
                                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 text-[10px]">Lulus</Badge>
                                ) : record.amlaScreening === 'Gagal' ? (
                                  <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100 text-[10px]">Gagal</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-[10px] text-amber-700 bg-amber-50 border-amber-200">{record.amlaScreening || '—'}</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-center text-sm font-medium">{formatCurrency(record.walletLimit)}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{formatDate(record.createdAt)}</TableCell>
                              <TableCell className="text-center">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-purple-600">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Card List - Mobile */}
            <div className="space-y-3 md:hidden">
              {filteredRecords.length === 0 ? (
                <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
                  <CardContent className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                    <FileCheck className="w-10 h-10" />
                    <p className="font-medium">Tiada rekod ditemui</p>
                  </CardContent>
                </Card>
              ) : (
                filteredRecords.map((record) => {
                  const statusCfg = getStatusConfig(record.status);
                  return (
                    <Card
                      key={record.id}
                      className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 transition-shadow hover:shadow-md cursor-pointer"
                      onClick={() => setDetailRecord(record)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="truncate font-semibold text-gray-900 dark:text-white text-sm">{record.memberName}</h3>
                              <Badge variant="outline" className={`shrink-0 text-[10px] ${statusCfg.color} ${statusCfg.bgColor} ${statusCfg.borderColor}`}>
                                {statusCfg.label}
                              </Badge>
                            </div>
                            <p className="font-mono text-xs text-muted-foreground">{record.memberIc}</p>
                          </div>
                          <Eye className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                          <div className="rounded-lg bg-gray-50 dark:bg-gray-900/40 p-2">
                            <p className="text-[10px] text-muted-foreground">Skor Muka</p>
                            <p className={`text-sm font-bold ${record.faceMatchScore ? getScoreBadgeConfig(record.faceMatchScore).color : 'text-muted-foreground'}`}>
                              {record.faceMatchScore ? `${record.faceMatchScore.toFixed(1)}%` : '—'}
                            </p>
                          </div>
                          <div className="rounded-lg bg-gray-50 dark:bg-gray-900/40 p-2">
                            <p className="text-[10px] text-muted-foreground">Liveness</p>
                            <p className={`text-sm font-bold ${record.livenessScore ? getScoreBadgeConfig(record.livenessScore).color : 'text-muted-foreground'}`}>
                              {record.livenessScore ? `${record.livenessScore.toFixed(1)}%` : '—'}
                            </p>
                          </div>
                          <div className="rounded-lg bg-gray-50 dark:bg-gray-900/40 p-2">
                            <p className="text-[10px] text-muted-foreground">Had Wallet</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(record.walletLimit)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* ═══════════════════════════════════════════ */}
      {/* Detail Dialog                              */}
      {/* ═══════════════════════════════════════════ */}
      <Dialog open={!!detailRecord} onOpenChange={(open) => { if (!open) setDetailRecord(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {detailRecord && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-lg">Butiran Pengesahan eKYC</DialogTitle>
                    <DialogDescription className="mt-1">
                      Rekod pengesahan untuk {detailRecord.memberName}
                    </DialogDescription>
                  </div>
                  <Badge variant="outline" className={`${getStatusConfig(detailRecord.status).color} ${getStatusConfig(detailRecord.status).bgColor} ${getStatusConfig(detailRecord.status).border}`}>
                    {getStatusConfig(detailRecord.status).label}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Member Info */}
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/40">
                        <User className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{detailRecord.memberName}</p>
                        <p className="text-sm text-muted-foreground">IC: {detailRecord.memberIc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Scores */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <CircularScore score={detailRecord.livenessScore || 0} label="Skor Liveness" />
                  <CircularScore score={detailRecord.faceMatchScore || 0} label="Padanan Muka" />

                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Saringan AMLA</span>
                    {detailRecord.amlaScreening === 'Lulus' ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 px-3 py-1">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Lulus
                      </Badge>
                    ) : detailRecord.amlaScreening === 'Gagal' ? (
                      <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100 px-3 py-1">
                        <XCircle className="w-3 h-3 mr-1" /> Gagal
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="px-3 py-1">{detailRecord.amlaScreening || '—'}</Badge>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Tahap Risiko</span>
                    {detailRecord.riskLevel ? (
                      <Badge variant="outline" className={`px-3 py-1 ${getRiskConfig(detailRecord.riskLevel).color} ${getRiskConfig(detailRecord.riskLevel).bg} ${getRiskConfig(detailRecord.riskLevel).border}`}>
                        {detailRecord.riskLevel}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="px-3 py-1">—</Badge>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Wallet Info */}
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Maklumat Wallet</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Status Wallet</span>
                          <Badge variant={detailRecord.walletEnabled ? 'default' : 'outline'} className={detailRecord.walletEnabled ? 'bg-emerald-600 hover:bg-emerald-700 text-[10px]' : 'text-[10px]'}>
                            {detailRecord.walletEnabled ? 'Dibenarkan' : 'Tidak Dibenarkan'}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Had Semasa</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(detailRecord.walletLimit)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Had Sebelum</span>
                          <span className="text-sm text-muted-foreground">{formatCurrency(detailRecord.previousLimit)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Pindahan Bank</span>
                          <Badge variant={detailRecord.bankTransferEnabled ? 'default' : 'outline'} className={detailRecord.bankTransferEnabled ? 'bg-emerald-600 hover:bg-emerald-700 text-[10px]' : 'text-[10px]'}>
                            {detailRecord.bankTransferEnabled ? 'Ya' : 'Tidak'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Verification Info */}
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Maklumat Pengesahan</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">BNM AMLA</span>
                          <Badge variant={detailRecord.bnmCompliant ? 'default' : 'outline'} className={detailRecord.bnmCompliant ? 'bg-emerald-600 hover:bg-emerald-700 text-[10px]' : 'text-[10px]'}>
                            {detailRecord.bnmCompliant ? 'Selaras' : 'Tidak Selaras'}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Diperakui Oleh</span>
                          <span className="text-sm text-gray-900 dark:text-white">{detailRecord.verifiedBy || '—'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Tarikh Pengesahan</span>
                          <span className="text-sm text-muted-foreground">{detailRecord.verifiedAt ? formatDateTime(detailRecord.verifiedAt) : '—'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Dicipta</span>
                          <span className="text-sm text-muted-foreground">{formatDateTime(detailRecord.createdAt)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Dikemas Kini</span>
                          <span className="text-sm text-muted-foreground">{formatDateTime(detailRecord.updatedAt)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Rejection Reason */}
                {detailRecord.rejectionReason && (
                  <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/10">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-2">
                        <Ban className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-red-700 dark:text-red-300">Sebab Penolakan</p>
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">{detailRecord.rejectionReason}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Screening Notes */}
                {detailRecord.screeningNotes && (
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">Catatan Semakan</p>
                          <p className="text-sm text-muted-foreground mt-1">{detailRecord.screeningNotes}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Actions */}
              {(detailRecord.status === 'pending' || detailRecord.status === 'processing') && (
                <DialogFooter className="flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => openRejectDialog(detailRecord)}
                  >
                    <Ban className="w-4 h-4" /> Tolak
                  </Button>
                  <Button
                    className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleApprove(detailRecord)}
                    disabled={approving}
                  >
                    {approving ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Meluluskan...</>
                    ) : (
                      <><CheckCircle2 className="w-4 h-4" /> Luluskan</>
                    )}
                  </Button>
                </DialogFooter>
              )}

              {detailRecord.status === 'verified' && (
                <DialogFooter className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-center gap-2 w-full text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-medium">Pengesahan telah diluluskan</span>
                  </div>
                </DialogFooter>
              )}

              {detailRecord.status === 'rejected' && (
                <DialogFooter className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-center gap-2 w-full text-red-600">
                    <XCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Pengesahan telah ditolak</span>
                  </div>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════ */}
      {/* Reject Dialog                              */}
      {/* ═══════════════════════════════════════════ */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <Ban className="w-5 h-5" /> Tolak Pengesahan
            </DialogTitle>
            <DialogDescription>
              {rejectTarget && `Anda ingin menolak pengesahan untuk ${rejectTarget.memberName}. Sila nyatakan sebab penolakan.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            <Textarea
              placeholder="Nyatakan sebab penolakan..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="border-gray-200 dark:border-gray-600"
            />
            {rejectReason.trim().length > 0 && rejectReason.trim().length < 10 && (
              <p className="text-xs text-red-500">Sekurang-kurangnya 10 aksara diperlukan</p>
            )}
          </div>
          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => { setRejectDialogOpen(false); setRejectReason(''); }}
              className="border-gray-200 dark:border-gray-600"
            >
              Batal
            </Button>
            <Button
              onClick={handleReject}
              disabled={rejecting || rejectReason.trim().length < 10}
              className="gap-2 bg-red-600 hover:bg-red-700"
            >
              {rejecting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Menolak...</>
              ) : (
                <><Ban className="w-4 h-4" /> Sahkan Penolakan</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
