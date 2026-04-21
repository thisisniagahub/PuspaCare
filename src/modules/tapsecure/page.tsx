'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  ShieldCheck,
  Smartphone,
  Laptop,
  Tablet,
  Monitor,
  Fingerprint,
  ScanFace,
  Plus,
  Trash2,
  Star,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Globe,
  Cpu,
  Activity,
  Lock,
  Unlock,
  ShieldAlert,
  ShieldX,
  Download,
  Search,
  Filter,
  RefreshCw,
  Wifi,
  Info,
  ChevronRight,
  Loader2,
  CircleCheck,
  Zap,
  Eye,
  KeyRound,
  MessageSquare,
} from 'lucide-react';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface DeviceBinding {
  id: string;
  deviceName: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  deviceFingerprint: string;
  userAgent: string;
  ipAddress: string;
  location: string;
  isPrimary: boolean;
  isTrusted: boolean;
  isActive: boolean;
  otpVerified: boolean;
  lastUsedAt: string;
  boundAt: string;
}

interface SecurityLogEntry {
  id: string;
  action: string;
  method: string;
  deviceFingerprint: string;
  deviceName: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failed' | 'blocked';
  details: string;
  createdAt: string;
}

interface SecuritySettings {
  biometricTransaction: boolean;
  boundDeviceOnly: boolean;
  sessionTimeout: number;
}

type BindingStep = 'idle' | 'code' | 'otp' | 'success';
type BiometricStep = 'idle' | 'preparing' | 'scanning' | 'registering' | 'success';

// ──────────────────────────────────────────────
// Demo Data
// ──────────────────────────────────────────────

const DEMO_DEVICES: DeviceBinding[] = [
  {
    id: 'dev_001',
    deviceName: 'iPhone 15 Pro Max',
    deviceType: 'mobile',
    deviceFingerprint: 'fp_a1b2c3d4',
    userAgent: 'Safari 17.4 / iOS 17.4',
    ipAddress: '192.168.1.105',
    location: 'Kuala Lumpur, Malaysia',
    isPrimary: true,
    isTrusted: true,
    isActive: true,
    otpVerified: true,
    lastUsedAt: '2026-06-15T10:32:00Z',
    boundAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'dev_002',
    deviceName: 'MacBook Pro M3',
    deviceType: 'desktop',
    deviceFingerprint: 'fp_e5f6g7h8',
    userAgent: 'Chrome 125 / macOS Sonoma 14.5',
    ipAddress: '192.168.1.42',
    location: 'Kuala Lumpur, Malaysia',
    isPrimary: false,
    isTrusted: true,
    isActive: true,
    otpVerified: true,
    lastUsedAt: '2026-06-15T09:15:00Z',
    boundAt: '2026-02-20T14:30:00Z',
  },
  {
    id: 'dev_003',
    deviceName: 'Samsung Galaxy S24',
    deviceType: 'mobile',
    deviceFingerprint: 'fp_i9j0k1l2',
    userAgent: 'Chrome 125 / Android 14',
    ipAddress: '103.45.67.89',
    location: 'Johor Bahru, Malaysia',
    isPrimary: false,
    isTrusted: false,
    isActive: true,
    otpVerified: true,
    lastUsedAt: '2026-06-14T18:45:00Z',
    boundAt: '2026-03-15T11:20:00Z',
  },
  {
    id: 'dev_004',
    deviceName: 'iPad Air M2',
    deviceType: 'tablet',
    deviceFingerprint: 'fp_m3n4o5p6',
    userAgent: 'Safari 17.4 / iPadOS 17.4',
    ipAddress: '192.168.1.88',
    location: 'Petaling Jaya, Malaysia',
    isPrimary: false,
    isTrusted: true,
    isActive: false,
    otpVerified: true,
    lastUsedAt: '2026-06-10T15:00:00Z',
    boundAt: '2026-04-05T09:45:00Z',
  },
];

const DEMO_LOGS: SecurityLogEntry[] = [
  {
    id: 'log_001',
    action: 'login',
    method: 'password',
    deviceFingerprint: 'fp_a1b2c3d4',
    deviceName: 'iPhone 15 Pro Max',
    ipAddress: '192.168.1.105',
    userAgent: 'Safari 17.4 / iOS 17.4',
    status: 'success',
    details: 'Login berjaya melalui kata laluan',
    createdAt: '2026-06-15T10:32:00Z',
  },
  {
    id: 'log_002',
    action: 'device_bind',
    method: 'device_bind',
    deviceFingerprint: 'fp_i9j0k1l2',
    deviceName: 'Samsung Galaxy S24',
    ipAddress: '103.45.67.89',
    userAgent: 'Chrome 125 / Android 14',
    status: 'success',
    details: 'Peranti baru berjaya diikat',
    createdAt: '2026-06-14T18:45:00Z',
  },
  {
    id: 'log_003',
    action: 'login',
    method: 'password',
    deviceFingerprint: 'fp_unknown',
    deviceName: 'Peranti Tidak Dikenali',
    ipAddress: '45.33.128.9',
    userAgent: 'Firefox 126 / Windows 11',
    status: 'failed',
    details: 'Kata laluan salah — 3 percubaan gagal',
    createdAt: '2026-06-14T12:20:00Z',
  },
  {
    id: 'log_004',
    action: 'login',
    method: 'password',
    deviceFingerprint: 'fp_unknown',
    deviceName: 'Peranti Tidak Dikenali',
    ipAddress: '45.33.128.9',
    userAgent: 'Firefox 126 / Windows 11',
    status: 'blocked',
    details: 'Akaun dikunci selepas 5 percubaan gagal',
    createdAt: '2026-06-14T12:25:00Z',
  },
  {
    id: 'log_005',
    action: 'biometric_setup',
    method: 'fingerprint',
    deviceFingerprint: 'fp_a1b2c3d4',
    deviceName: 'iPhone 15 Pro Max',
    ipAddress: '192.168.1.105',
    userAgent: 'Safari 17.4 / iOS 17.4',
    status: 'success',
    details: 'Cap jari berjaya didaftarkan',
    createdAt: '2026-06-13T09:00:00Z',
  },
  {
    id: 'log_006',
    action: 'transaction_verify',
    method: 'webauthn',
    deviceFingerprint: 'fp_a1b2c3d4',
    deviceName: 'iPhone 15 Pro Max',
    ipAddress: '192.168.1.105',
    userAgent: 'Safari 17.4 / iOS 17.4',
    status: 'success',
    details: 'Transaksi disahkan dengan biometrik',
    createdAt: '2026-06-12T16:30:00Z',
  },
  {
    id: 'log_007',
    action: 'device_unbind',
    method: 'device_bind',
    deviceFingerprint: 'fp_old_device',
    deviceName: 'iPhone 12',
    ipAddress: '192.168.1.50',
    userAgent: 'Safari 16 / iOS 16',
    status: 'success',
    details: 'Peranti berjaya dikeluarkan oleh pengguna',
    createdAt: '2026-06-11T14:00:00Z',
  },
  {
    id: 'log_008',
    action: 'login',
    method: 'webauthn',
    deviceFingerprint: 'fp_e5f6g7h8',
    deviceName: 'MacBook Pro M3',
    ipAddress: '192.168.1.42',
    userAgent: 'Chrome 125 / macOS Sonoma 14.5',
    status: 'success',
    details: 'Login berjaya melalui biometrik',
    createdAt: '2026-06-10T08:45:00Z',
  },
  {
    id: 'log_009',
    action: 'login',
    method: 'otp',
    deviceFingerprint: 'fp_unknown',
    deviceName: 'Peranti Tidak Dikenali',
    ipAddress: '203.106.88.12',
    userAgent: 'Chrome 124 / Android 13',
    status: 'failed',
    details: 'OTP tamat tempoh — tidak disahkan dalam 5 minit',
    createdAt: '2026-06-09T20:10:00Z',
  },
  {
    id: 'log_010',
    action: 'biometric_setup',
    method: 'face',
    deviceFingerprint: 'fp_e5f6g7h8',
    deviceName: 'MacBook Pro M3',
    ipAddress: '192.168.1.42',
    userAgent: 'Chrome 125 / macOS Sonoma 14.5',
    status: 'success',
    details: 'Pengesahan muka berjaya didaftarkan',
    createdAt: '2026-06-08T11:30:00Z',
  },
  {
    id: 'log_011',
    action: 'device_bind',
    method: 'device_bind',
    deviceFingerprint: 'fp_m3n4o5p6',
    deviceName: 'iPad Air M2',
    ipAddress: '192.168.1.88',
    userAgent: 'Safari 17.4 / iPadOS 17.4',
    status: 'success',
    details: 'Peranti tablet berjaya diikat',
    createdAt: '2026-06-05T09:45:00Z',
  },
  {
    id: 'log_012',
    action: 'transaction_verify',
    method: 'password',
    deviceFingerprint: 'fp_i9j0k1l2',
    deviceName: 'Samsung Galaxy S24',
    ipAddress: '103.45.67.89',
    userAgent: 'Chrome 125 / Android 14',
    status: 'failed',
    details: 'Pengesahan transaksi gagal — sesi tamat',
    createdAt: '2026-06-04T17:20:00Z',
  },
  {
    id: 'log_013',
    action: 'login',
    method: 'password',
    deviceFingerprint: 'fp_a1b2c3d4',
    deviceName: 'iPhone 15 Pro Max',
    ipAddress: '192.168.1.105',
    userAgent: 'Safari 17.4 / iOS 17.4',
    status: 'success',
    details: 'Login berjaya — sesi baru dimulakan',
    createdAt: '2026-06-03T07:50:00Z',
  },
  {
    id: 'log_014',
    action: 'device_bind',
    method: 'device_bind',
    deviceFingerprint: 'fp_suspicious',
    deviceName: 'Peranti Mencurigakan',
    ipAddress: '185.220.101.34',
    userAgent: 'Tor Browser / Linux',
    status: 'blocked',
    details: 'Pengikatan peranti disekat — alamat IP mencurigakan',
    createdAt: '2026-06-02T03:15:00Z',
  },
  {
    id: 'log_015',
    action: 'login',
    method: 'webauthn',
    deviceFingerprint: 'fp_a1b2c3d4',
    deviceName: 'iPhone 15 Pro Max',
    ipAddress: '192.168.1.105',
    userAgent: 'Safari 17.4 / iOS 17.4',
    status: 'success',
    details: 'Login pantas melalui Face ID',
    createdAt: '2026-06-01T09:00:00Z',
  },
];

const ACTION_LABELS: Record<string, string> = {
  login: 'Log Masuk',
  device_bind: 'Ikatan Peranti',
  device_unbind: 'Nyahikat Peranti',
  biometric_setup: 'Persediaan Biometrik',
  transaction_verify: 'Pengesahan Transaksi',
  password_change: 'Tukar Kata Laluan',
};

const METHOD_LABELS: Record<string, string> = {
  password: 'Kata Laluan',
  webauthn: 'WebAuthn',
  device_bind: 'Pengikatan Peranti',
  face: 'Pengesahan Muka',
  fingerprint: 'Cap Jari',
  otp: 'SMS OTP',
};

const SESSION_TIMEOUT_OPTIONS = [
  { value: 5, label: '5 minit' },
  { value: 15, label: '15 minit' },
  { value: 30, label: '30 minit' },
  { value: 60, label: '1 jam' },
  { value: 240, label: '4 jam' },
];

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function DeviceIcon({ type, className }: { type: string; className?: string }) {
  switch (type) {
    case 'mobile':
      return <Smartphone className={className} />;
    case 'desktop':
      return <Laptop className={className} />;
    case 'tablet':
      return <Tablet className={className} />;
    default:
      return <Monitor className={className} />;
  }
}

function getDeviceTypeLabel(type: string) {
  switch (type) {
    case 'mobile':
      return 'Telefon Pintar';
    case 'desktop':
      return 'Komputer Riba';
    case 'tablet':
      return 'Tablet';
    default:
      return 'Peranti Lain';
  }
}

function getStatusBadge(status: 'success' | 'failed' | 'blocked') {
  switch (status) {
    case 'success':
      return (
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Berjaya
        </Badge>
      );
    case 'failed':
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100 gap-1">
          <XCircle className="w-3 h-3" />
          Gagal
        </Badge>
      );
    case 'blocked':
      return (
        <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 gap-1">
          <ShieldX className="w-3 h-3" />
          Disekat
        </Badge>
      );
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ms-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDateShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ms-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatRelativeTime(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Baru sahaja';
  if (diffMins < 60) return `${diffMins} minit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return formatDateShort(dateStr);
}

function generateBindingCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ──────────────────────────────────────────────
// Animation variants
// ──────────────────────────────────────────────

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
};

// ──────────────────────────────────────────────
// Sub-Components
// ──────────────────────────────────────────────

function PulseFingerprint({ size = 64 }: { size?: number }) {
  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        className="absolute rounded-full bg-emerald-500/20"
        animate={{
          scale: [1, 1.5, 2],
          opacity: [0.6, 0.3, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeOut',
        }}
        style={{ width: size, height: size }}
      />
      <motion.div
        className="absolute rounded-full bg-emerald-500/15"
        animate={{
          scale: [1, 1.3, 1.7],
          opacity: [0.4, 0.2, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeOut',
          delay: 0.5,
        }}
        style={{ width: size, height: size }}
      />
      <Fingerprint className="text-emerald-600" style={{ width: size, height: size }} />
    </div>
  );
}

function DeviceCard({
  device,
  isCurrentDevice,
  onRemove,
  onSetPrimary,
}: {
  device: DeviceBinding;
  isCurrentDevice: boolean;
  onRemove: () => void;
  onSetPrimary: () => void;
}) {
  return (
    <motion.div {...fadeInUp} layout>
      <Card
        className={`overflow-hidden transition-all duration-200 hover:shadow-md ${
          isCurrentDevice
            ? 'border-emerald-300 bg-emerald-50/30 ring-1 ring-emerald-200'
            : device.isActive
              ? 'border-gray-200'
              : 'border-gray-200 opacity-70'
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Device Icon */}
            <div
              className={`flex items-center justify-center w-11 h-11 rounded-xl shrink-0 ${
                isCurrentDevice
                  ? 'bg-emerald-100 text-emerald-700'
                  : device.isActive
                    ? 'bg-gray-100 text-gray-600'
                    : 'bg-gray-50 text-gray-400'
              }`}
            >
              <DeviceIcon type={device.deviceType} className="w-5 h-5" />
            </div>

            {/* Device Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-gray-900 truncate">
                  {device.deviceName}
                </span>
                {isCurrentDevice && (
                  <Badge className="bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-600 text-[10px] px-1.5 py-0">
                    Peranti Semasa
                  </Badge>
                )}
                {device.isPrimary && (
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100 text-[10px] px-1.5 py-0 gap-0.5">
                    <Star className="w-2.5 h-2.5" />
                    Utama
                  </Badge>
                )}
                {device.isTrusted && (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 text-[10px] px-1.5 py-0 gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Dipercayai
                  </Badge>
                )}
                {!device.isActive && (
                  <Badge className="bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-100 text-[10px] px-1.5 py-0">
                    Tidak Aktif
                  </Badge>
                )}
              </div>

              <div className="mt-1.5 space-y-0.5">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Cpu className="w-3 h-3 shrink-0" />
                  {device.userAgent}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Globe className="w-3 h-3 shrink-0" />
                  {device.ipAddress}
                  {device.location && (
                    <>
                      <span className="mx-0.5">·</span>
                      <MapPin className="w-3 h-3 shrink-0" />
                      {device.location}
                    </>
                  )}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3 h-3 shrink-0" />
                  Terakhir aktif: {formatRelativeTime(device.lastUsedAt)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-3">
                {!device.isPrimary && device.isActive && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onSetPrimary}
                    className="text-xs h-7 gap-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                  >
                    <Star className="w-3 h-3" />
                    Tandai Utama
                  </Button>
                )}
                {!isCurrentDevice && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRemove}
                    className="text-xs h-7 gap-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                    Alih Keluar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function DeviceSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
            <Skeleton className="h-3 w-48" />
            <div className="flex gap-2 mt-1">
              <Skeleton className="h-7 w-24" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ──────────────────────────────────────────────
// Main Page Component
// ──────────────────────────────────────────────

export default function TapSecurePage() {
  // ── State ──────────────────────────────────
  const [activeTab, setActiveTab] = useState('devices');
  const [devices, setDevices] = useState<DeviceBinding[]>([]);
  const [logs, setLogs] = useState<SecurityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>('dev_001');

  // Device binding dialog
  const [bindingOpen, setBindingOpen] = useState(false);
  const [bindingStep, setBindingStep] = useState<BindingStep>('idle');
  const [bindingCode, setBindingCode] = useState('');
  const [otpInput, setOtpInput] = useState('');

  // Remove dialog
  const [removeDevice, setRemoveDevice] = useState<DeviceBinding | null>(null);

  // Set primary confirm
  const [primaryDevice, setPrimaryDevice] = useState<DeviceBinding | null>(null);

  // Biometric
  const [biometricStep, setBiometricStep] = useState<BiometricStep>('idle');
  const [biometricActive, setBiometricActive] = useState(true);

  // Security settings
  const [settings, setSettings] = useState<SecuritySettings>({
    biometricTransaction: true,
    boundDeviceOnly: true,
    sessionTimeout: 30,
  });

  // Log filters
  const [logSearch, setLogSearch] = useState('');
  const [logStatusFilter, setLogStatusFilter] = useState<string>('all');
  const [logActionFilter, setLogActionFilter] = useState<string>('all');
  const [logMethodFilter, setLogMethodFilter] = useState<string>('all');

  // ── Load Data ──────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setDevices(DEMO_DEVICES);
      setLogs(DEMO_LOGS);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // ── Computed ───────────────────────────────
  const deviceStats = useMemo(() => ({
    total: devices.length,
    primary: devices.filter((d) => d.isPrimary).length,
    trusted: devices.filter((d) => d.isTrusted).length,
    active: devices.filter((d) => d.isActive).length,
  }), [devices]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (logStatusFilter !== 'all' && log.status !== logStatusFilter) return false;
      if (logActionFilter !== 'all' && log.action !== logActionFilter) return false;
      if (logMethodFilter !== 'all' && log.method !== logMethodFilter) return false;
      if (logSearch) {
        const search = logSearch.toLowerCase();
        return (
          log.ipAddress.toLowerCase().includes(search) ||
          log.deviceName.toLowerCase().includes(search) ||
          log.details.toLowerCase().includes(search)
        );
      }
      return true;
    });
  }, [logs, logSearch, logStatusFilter, logActionFilter, logMethodFilter]);

  const logStats = useMemo(() => ({
    success: logs.filter((l) => l.status === 'success').length,
    failed: logs.filter((l) => l.status === 'failed').length,
    blocked: logs.filter((l) => l.status === 'blocked').length,
    total: logs.length,
  }), [logs]);

  // ── Handlers ───────────────────────────────

  const handleAddDevice = useCallback(() => {
    setBindingStep('idle');
    setOtpInput('');
    setBindingCode(generateBindingCode());
    setBindingOpen(true);
  }, []);

  const handleBindingNext = useCallback(() => {
    setBindingStep('otp');
  }, []);

  const handleOtpSubmit = useCallback(() => {
    if (otpInput.length === 6) {
      setBindingStep('success');
      const newDevice: DeviceBinding = {
        id: `dev_${Date.now()}`,
        deviceName: 'Peranti Baru',
        deviceType: 'mobile',
        deviceFingerprint: `fp_new_${Date.now()}`,
        userAgent: 'Chrome 125 / Android 14',
        ipAddress: '110.159.22.33',
        location: 'Shah Alam, Malaysia',
        isPrimary: false,
        isTrusted: false,
        isActive: true,
        otpVerified: true,
        lastUsedAt: new Date().toISOString(),
        boundAt: new Date().toISOString(),
      };
      setTimeout(() => {
        setDevices((prev) => [...prev, newDevice]);
        toast.success('Peranti berjaya diikat!', {
          description: 'Peranti baru telah ditambah ke senarai peranti terikat.',
        });
      }, 1200);
    }
  }, [otpInput]);

  const handleRemoveDevice = useCallback((device: DeviceBinding) => {
    setRemoveDevice(device);
  }, []);

  const confirmRemoveDevice = useCallback(() => {
    if (!removeDevice) return;
    setDevices((prev) => prev.filter((d) => d.id !== removeDevice.id));
    toast.success('Peranti dikeluarkan', {
      description: `${removeDevice.deviceName} telah dikeluarkan daripada senarai peranti terikat.`,
    });
    setRemoveDevice(null);
  }, [removeDevice]);

  const handleSetPrimary = useCallback((device: DeviceBinding) => {
    setPrimaryDevice(device);
  }, []);

  const confirmSetPrimary = useCallback(() => {
    if (!primaryDevice) return;
    setDevices((prev) =>
      prev.map((d) => ({
        ...d,
        isPrimary: d.id === primaryDevice.id,
      })),
    );
    toast.success('Peranti utama dikemaskini', {
      description: `${primaryDevice.deviceName} kini ditetapkan sebagai peranti utama.`,
    });
    setPrimaryDevice(null);
  }, [primaryDevice]);

  const handleBiometricSetup = useCallback(() => {
    setBiometricStep('preparing');
    setTimeout(() => setBiometricStep('scanning'), 1500);
    setTimeout(() => setBiometricStep('registering'), 4000);
    setTimeout(() => {
      setBiometricStep('success');
      setBiometricActive(true);
      toast.success('Biometrik berjaya didaftarkan!', {
        description: 'Pengesahan biometrik kini aktif untuk akaun anda.',
      });
    }, 5500);
  }, []);

  const handleExportLog = useCallback(() => {
    toast.success('Log dieksport', {
      description: `${filteredLogs.length} rekod log keselamatan telah dieksport ke CSV.`,
    });
  }, [filteredLogs.length]);

  // ── Render ─────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 to-gray-50">
      {/* ── Header ─────────────────────── */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-600 text-white shadow-sm">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                    TapSecure
                  </h1>
                  <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5">
                    ™
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Pengurusan keselamatan peranti & pengesahan
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 gap-1">
                <Zap className="w-3 h-3" />
                Dilindungi
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* ── Tabs ─────────────────────── */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full sm:w-auto grid grid-cols-3 mb-6">
            <TabsTrigger value="devices" className="gap-1.5 text-xs sm:text-sm">
              <Smartphone className="w-4 h-4 hidden sm:block" />
              Pengikatan Peranti
            </TabsTrigger>
            <TabsTrigger value="biometric" className="gap-1.5 text-xs sm:text-sm">
              <Fingerprint className="w-4 h-4 hidden sm:block" />
              Pengesahan Biometrik
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-1.5 text-xs sm:text-sm">
              <Activity className="w-4 h-4 hidden sm:block" />
              Log Keselamatan
            </TabsTrigger>
          </TabsList>

          {/* ══════════════════════════════════════
              TAB 1: Pengikatan Peranti
              ══════════════════════════════════════ */}
          <TabsContent value="devices">
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="space-y-6"
            >
              {/* SMS OTP Banner */}
              <motion.div {...fadeInUp}>
                <Card className="border-amber-200 bg-amber-50/50">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 text-amber-600 shrink-0 mt-0.5">
                        <Info className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-amber-800">
                          SMS OTP Telah Dihapuskan
                        </p>
                        <p className="text-xs text-amber-700 mt-0.5">
                          Keselamatan akaun kini menggunakan <strong>Pengikatan Peranti</strong> sebagai ganti SMS OTP. 
                          Ikatan peranti lebih selamat dan mudah digunakan.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Device Stats */}
              <motion.div {...fadeInUp}>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    {
                      label: 'Jumlah Peranti',
                      value: deviceStats.total,
                      icon: Smartphone,
                      color: 'text-gray-600',
                      bg: 'bg-gray-100',
                    },
                    {
                      label: 'Peranti Utama',
                      value: deviceStats.primary,
                      icon: Star,
                      color: 'text-purple-600',
                      bg: 'bg-purple-100',
                    },
                    {
                      label: 'Peranti Dipercayai',
                      value: deviceStats.trusted,
                      icon: CheckCircle2,
                      color: 'text-emerald-600',
                      bg: 'bg-emerald-100',
                    },
                    {
                      label: 'Sesi Aktif',
                      value: deviceStats.active,
                      icon: Wifi,
                      color: 'text-teal-600',
                      bg: 'bg-teal-100',
                    },
                  ].map((stat) => {
                    const StatIcon = stat.icon;
                    return (
                      <Card key={stat.label}>
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-center gap-2.5">
                            <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${stat.bg} ${stat.color}`}>
                              <StatIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">{stat.label}</p>
                              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </motion.div>

              {/* Current Device */}
              <motion.div {...fadeInUp}>
                <Card className="overflow-hidden border-emerald-300 bg-gradient-to-r from-emerald-50/80 to-white">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white">
                          <Monitor className="w-3.5 h-3.5" />
                        </div>
                        Peranti Semasa
                      </CardTitle>
                      <Badge className="bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-600 text-[10px] gap-1">
                        <Wifi className="w-3 h-3" />
                        Sesi Aktif
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {loading ? (
                      <DeviceSkeleton />
                    ) : (
                      devices
                        .filter((d) => d.id === currentDeviceId)
                        .map((device) => (
                          <DeviceCard
                            key={device.id}
                            device={device}
                            isCurrentDevice
                            onRemove={() => handleRemoveDevice(device)}
                            onSetPrimary={() => handleSetPrimary(device)}
                          />
                        ))
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Bound Devices List */}
              <motion.div {...fadeInUp}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-muted-foreground" />
                    Peranti Terikat Lain
                    <Badge variant="secondary" className="text-xs">
                      {devices.filter((d) => d.id !== currentDeviceId).length}
                    </Badge>
                  </h2>
                  <Button
                    onClick={handleAddDevice}
                    size="sm"
                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah Peranti
                  </Button>
                </div>

                {loading ? (
                  <div className="space-y-3">
                    <DeviceSkeleton />
                    <DeviceSkeleton />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {devices
                      .filter((d) => d.id !== currentDeviceId)
                      .length === 0 ? (
                      <Card>
                        <CardContent className="py-10 text-center">
                          <Smartphone className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-900">
                            Tiada peranti terikat lain
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Klik &quot;Tambah Peranti&quot; untuk mengikat peranti baru.
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      devices
                        .filter((d) => d.id !== currentDeviceId)
                        .map((device) => (
                          <DeviceCard
                            key={device.id}
                            device={device}
                            isCurrentDevice={false}
                            onRemove={() => handleRemoveDevice(device)}
                            onSetPrimary={() => handleSetPrimary(device)}
                          />
                        ))
                    )}
                  </div>
                )}
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* ══════════════════════════════════════
              TAB 2: Pengesahan Biometrik
              ══════════════════════════════════════ */}
          <TabsContent value="biometric">
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="space-y-6"
            >
              {/* Biometric Setup Card */}
              <motion.div {...fadeInUp}>
                <Card className="overflow-hidden border-emerald-200">
                  <CardContent className="p-6 sm:p-8">
                    <div className="flex flex-col items-center text-center space-y-4">
                      {biometricStep === 'idle' && (
                        <>
                          <PulseFingerprint size={72} />
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              Pengesahan Biometrik
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 max-w-md">
                              Daftarkan cap jari atau pengesahan muka untuk akses yang lebih selamat 
                              dan pantas ke akaun PUSPA anda.
                            </p>
                          </div>
                          <Button
                            onClick={handleBiometricSetup}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                          >
                            <Fingerprint className="w-4 h-4" />
                            Aktifkan Pengesahan Biometrik
                          </Button>
                        </>
                      )}

                      {biometricStep === 'preparing' && (
                        <AnimatePresence mode="wait">
                          <motion.div
                            key="preparing"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-4"
                          >
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            >
                              <Loader2 className="w-16 h-16 text-emerald-600 mx-auto" />
                            </motion.div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">
                                Menyediakan pengesahan...
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                Menghubungkan kepada pengimbas biometrik peranti anda
                              </p>
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      )}

                      {biometricStep === 'scanning' && (
                        <AnimatePresence mode="wait">
                          <motion.div
                            key="scanning"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-4"
                          >
                            <PulseFingerprint size={72} />
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">
                                Sila sentuh pengimbas cap jari
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                atau arahkan muka anda ke kamera peranti
                              </p>
                            </div>
                            <div className="w-full max-w-xs mx-auto">
                              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full bg-emerald-500 rounded-full"
                                  initial={{ width: '0%' }}
                                  animate={{ width: '65%' }}
                                  transition={{ duration: 2.5, ease: 'easeOut' }}
                                />
                              </div>
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      )}

                      {biometricStep === 'registering' && (
                        <AnimatePresence mode="wait">
                          <motion.div
                            key="registering"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-4"
                          >
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                            >
                              <Fingerprint className="w-16 h-16 text-emerald-600 mx-auto" />
                            </motion.div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">
                                Mendaftarkan peranti...
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                Mengesahkan dan menyimpan data biometrik anda
                              </p>
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      )}

                      {biometricStep === 'success' && (
                        <AnimatePresence mode="wait">
                          <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-4"
                          >
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                            >
                              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mx-auto">
                                <CircleCheck className="w-10 h-10 text-emerald-600" />
                              </div>
                            </motion.div>
                            <div>
                              <h3 className="text-lg font-bold text-emerald-700">
                                Biometrik berjaya didaftarkan!
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                Pengesahan biometrik kini aktif untuk akaun anda.
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              onClick={() => setBiometricStep('idle')}
                              className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                            >
                              Selesai
                            </Button>
                          </motion.div>
                        </AnimatePresence>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* SMS OTP Phase Out Notice */}
              <motion.div {...fadeInUp}>
                <Card className="border-amber-200 bg-amber-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-100 text-amber-600 shrink-0">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-amber-800">
                          SMS OTP Telah Digantikan dengan Device Binding
                        </p>
                        <p className="text-xs text-amber-700 mt-0.5">
                          Kaedah SMS OTP telah dihentikan secara berperingkat dan digantikan dengan 
                          Pengikatan Peranti yang lebih selamat.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Current Methods Comparison */}
              <motion.div {...fadeInUp}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                      Kaedah Pengesahan Semasa
                    </CardTitle>
                    <CardDescription>
                      Perbandingan tahap keselamatan setiap kaedah pengesahan
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Kaedah</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Keselamatan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium flex items-center gap-2">
                            <KeyRound className="w-4 h-4 text-gray-500" />
                            Kata Laluan
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                              Aktif
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-amber-400">★★</span>
                            <span className="text-gray-300">★★★</span>
                          </TableCell>
                        </TableRow>
                        <TableRow className="bg-amber-50/50">
                          <TableCell className="font-medium flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-amber-500" />
                            SMS OTP
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 text-[10px] px-1.5 py-0">
                              Dihapuskan
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-amber-100 text-amber-600 border-amber-200 hover:bg-amber-100 gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Dihapuskan
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-amber-400">★</span>
                            <span className="text-gray-300">★★★★</span>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-emerald-600" />
                            Pengikatan Peranti
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                              Aktif
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-amber-400">★★★</span>
                            <span className="text-gray-300">★★</span>
                          </TableCell>
                        </TableRow>
                        <TableRow className="bg-emerald-50/50">
                          <TableCell className="font-medium flex items-center gap-2">
                            <Fingerprint className="w-4 h-4 text-emerald-600" />
                            Cap Jari / Muka
                          </TableCell>
                          <TableCell>
                            {biometricActive ? (
                              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                                Aktif
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-gray-500">
                                Tidak Aktif
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="text-amber-400">★★★★★</span>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Security Settings */}
              <motion.div {...fadeInUp}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                      Tetapan Keselamatan
                    </CardTitle>
                    <CardDescription>
                      Konfigurasi pilihan keselamatan akaun anda
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-6">
                    {/* Biometric Transaction Toggle */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          Sahkan transaksi dengan biometrik
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Memerlukan pengesahan biometrik untuk setiap transaksi kewangan
                        </p>
                      </div>
                      <Switch
                        checked={settings.biometricTransaction}
                        onCheckedChange={(checked) =>
                          setSettings((prev) => ({ ...prev, biometricTransaction: checked }))
                        }
                      />
                    </div>

                    <Separator />

                    {/* Bound Device Only Toggle */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          Bataskan akses ke peranti terikat sahaja
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Hanya peranti yang didaftar boleh mengakses akaun
                        </p>
                      </div>
                      <Switch
                        checked={settings.boundDeviceOnly}
                        onCheckedChange={(checked) =>
                          setSettings((prev) => ({ ...prev, boundDeviceOnly: checked }))
                        }
                      />
                    </div>

                    <Separator />

                    {/* Session Timeout Slider */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Had masa tamat sesi
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Sesi akan tamat secara automatik selepas tempoh tidak aktif
                          </p>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                          {settings.sessionTimeout >= 60
                            ? `${settings.sessionTimeout / 60} jam`
                            : `${settings.sessionTimeout} minit`}
                        </Badge>
                      </div>
                      <Slider
                        value={[settings.sessionTimeout]}
                        min={0}
                        max={4}
                        step={1}
                        onValueChange={(val) => {
                          const timeouts = [5, 15, 30, 60, 240];
                          setSettings((prev) => ({
                            ...prev,
                            sessionTimeout: timeouts[val[0]],
                          }));
                        }}
                        className="w-full"
                      />
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>5 min</span>
                        <span>15 min</span>
                        <span>30 min</span>
                        <span>1 jam</span>
                        <span>4 jam</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* ══════════════════════════════════════
              TAB 3: Log Keselamatan
              ══════════════════════════════════════ */}
          <TabsContent value="logs">
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="space-y-4"
            >
              {/* Log Stats */}
              <motion.div {...fadeInUp}>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label: 'Jumlah Log', value: logStats.total, icon: Activity, color: 'text-gray-600', bg: 'bg-gray-100' },
                    { label: 'Berjaya', value: logStats.success, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100' },
                    { label: 'Gagal', value: logStats.failed, icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
                    { label: 'Disekat', value: logStats.blocked, icon: ShieldX, color: 'text-amber-600', bg: 'bg-amber-100' },
                  ].map((stat) => {
                    const StatIcon = stat.icon;
                    return (
                      <Card key={stat.label}>
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${stat.bg} ${stat.color}`}>
                              <StatIcon className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                              <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </motion.div>

              {/* Filters */}
              <motion.div {...fadeInUp}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Cari IP, peranti, atau butiran..."
                          value={logSearch}
                          onChange={(e) => setLogSearch(e.target.value)}
                          className="pl-8 h-9 text-sm"
                        />
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Select value={logActionFilter} onValueChange={setLogActionFilter}>
                          <SelectTrigger size="sm" className="w-[140px] text-xs">
                            <Filter className="w-3 h-3 mr-1" />
                            <SelectValue placeholder="Tindakan" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Semua Tindakan</SelectItem>
                            {Object.entries(ACTION_LABELS).map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={logMethodFilter} onValueChange={setLogMethodFilter}>
                          <SelectTrigger size="sm" className="w-[130px] text-xs">
                            <SelectValue placeholder="Kaedah" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Semua Kaedah</SelectItem>
                            {Object.entries(METHOD_LABELS).map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={logStatusFilter} onValueChange={setLogStatusFilter}>
                          <SelectTrigger size="sm" className="w-[110px] text-xs">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="success">Berjaya</SelectItem>
                            <SelectItem value="failed">Gagal</SelectItem>
                            <SelectItem value="blocked">Disekat</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-muted-foreground">
                        Menunjukkan {filteredLogs.length} daripada {logs.length} rekod
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportLog}
                        className="text-xs gap-1 h-7"
                      >
                        <Download className="w-3 h-3" />
                        Eksport Log
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Log Table */}
              <motion.div {...fadeInUp}>
                <Card>
                  <CardContent className="p-0">
                    {loading ? (
                      <div className="p-4 space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="flex gap-4">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                        ))}
                      </div>
                    ) : filteredLogs.length === 0 ? (
                      <div className="py-12 text-center">
                        <Activity className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-900">
                          Tiada log ditemui
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Cuba ubah penapis carian anda
                        </p>
                      </div>
                    ) : (
                      <div className="max-h-[500px] overflow-y-auto">
                        <Table>
                          <TableHeader className="sticky top-0 bg-gray-50 z-10">
                            <TableRow>
                              <TableHead className="text-xs">Masa</TableHead>
                              <TableHead className="text-xs">Tindakan</TableHead>
                              <TableHead className="text-xs">Kaedah</TableHead>
                              <TableHead className="text-xs hidden md:table-cell">Peranti</TableHead>
                              <TableHead className="text-xs hidden sm:table-cell">IP</TableHead>
                              <TableHead className="text-xs">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredLogs.map((log, idx) => (
                              <TableRow
                                key={log.id}
                                className={
                                  log.status === 'failed'
                                    ? 'bg-red-50/50'
                                    : log.status === 'blocked'
                                      ? 'bg-amber-50/50'
                                      : idx % 2 === 0
                                        ? ''
                                        : 'bg-gray-50/30'
                                }
                              >
                                <TableCell className="text-xs text-muted-foreground">
                                  {formatDate(log.createdAt)}
                                </TableCell>
                                <TableCell className="text-xs font-medium">
                                  <div className="flex items-center gap-1.5">
                                    {log.action === 'login' && <Unlock className="w-3 h-3 text-gray-400" />}
                                    {log.action === 'device_bind' && <Smartphone className="w-3 h-3 text-emerald-500" />}
                                    {log.action === 'device_unbind' && <Trash2 className="w-3 h-3 text-red-400" />}
                                    {log.action === 'biometric_setup' && <Fingerprint className="w-3 h-3 text-purple-500" />}
                                    {log.action === 'transaction_verify' && <ShieldCheck className="w-3 h-3 text-emerald-500" />}
                                    {ACTION_LABELS[log.action] || log.action}
                                  </div>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                  {METHOD_LABELS[log.method] || log.method}
                                </TableCell>
                                <TableCell className="text-xs hidden md:table-cell">
                                  <span className="truncate block max-w-[150px]" title={log.deviceName}>
                                    {log.deviceName}
                                  </span>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground font-mono hidden sm:table-cell">
                                  {log.ipAddress}
                                </TableCell>
                                <TableCell>{getStatusBadge(log.status)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      {/* ── Footer ─────────────────────── */}
      <footer className="border-t bg-white/60 mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>TapSecure™ — Keselamatan peringkat perusahaan untuk PUSPA</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Semua data dilindungi dengan enkripsi hujung-ke-hujung
            </p>
          </div>
        </div>
      </footer>

      {/* ══════════════════════════════════════
          DIALOGS
          ══════════════════════════════════════ */}

      {/* Add Device Dialog */}
      <Dialog
        open={bindingOpen}
        onOpenChange={(open) => {
          if (!open) {
            setBindingOpen(false);
            setBindingStep('idle');
            setOtpInput('');
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              Tambah Peranti Baru
            </DialogTitle>
            <DialogDescription>
              Ikut langkah berikut untuk mengikat peranti baru
            </DialogDescription>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {bindingStep === 'idle' && (
              <motion.div
                key="step-code"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Masukkan kod pengikatan ini pada peranti baru anda:
                  </p>
                  <div className="bg-emerald-50 border-2 border-dashed border-emerald-300 rounded-xl py-6 px-8 inline-block mx-auto">
                    <span className="text-4xl font-bold tracking-[0.3em] text-emerald-700 font-mono">
                      {bindingCode}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Kod ini tamat tempoh dalam 10 minit
                  </p>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setBindingOpen(false)}
                    className="text-xs"
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleBindingNext}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1"
                  >
                    Seterusnya
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </DialogFooter>
              </motion.div>
            )}

            {bindingStep === 'otp' && (
              <motion.div
                key="step-otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mx-auto">
                    <Fingerprint className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Sahkan OTP dari peranti baru
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Masukkan kod 6-digit yang dipaparkan pada peranti baru
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <Input
                      value={otpInput}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setOtpInput(val);
                      }}
                      placeholder="000000"
                      maxLength={6}
                      className="w-40 text-center text-2xl font-mono tracking-[0.3em] h-12"
                    />
                  </div>
                  {otpInput.length < 6 && (
                    <p className="text-[11px] text-muted-foreground">
                      Masukkan sebarang 6 digit untuk simulasi
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setBindingStep('idle');
                      setOtpInput('');
                    }}
                    className="text-xs"
                  >
                    Kembali
                  </Button>
                  <Button
                    onClick={handleOtpSubmit}
                    disabled={otpInput.length !== 6}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Sahkan OTP
                  </Button>
                </DialogFooter>
              </motion.div>
            )}

            {bindingStep === 'success' && (
              <motion.div
                key="step-success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center space-y-3 py-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mx-auto">
                    <CircleCheck className="w-8 h-8 text-emerald-600" />
                  </div>
                </motion.div>
                <div>
                  <p className="text-base font-bold text-emerald-700">
                    Peranti berjaya diikat!
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Peranti baru telah ditambah ke senarai peranti terikat anda.
                  </p>
                </div>
                <DialogFooter className="justify-center">
                  <Button
                    onClick={() => {
                      setBindingOpen(false);
                      setBindingStep('idle');
                      setOtpInput('');
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                  >
                    Selesai
                  </Button>
                </DialogFooter>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Remove Device Confirmation */}
      <AlertDialog open={!!removeDevice} onOpenChange={(open) => !open && setRemoveDevice(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              Alih Keluar Peranti
            </AlertDialogTitle>
            <AlertDialogDescription>
              Adakah anda pasti ingin mengalih keluar{' '}
              <strong>{removeDevice?.deviceName}</strong> daripada senarai peranti terikat?
              Peranti ini tidak akan dapat mengakses akaun PUSPA anda selepas dikeluarkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveDevice}
              className="bg-red-600 hover:bg-red-700 text-white text-xs"
            >
              Alih Keluar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Set Primary Confirmation */}
      <AlertDialog open={!!primaryDevice} onOpenChange={(open) => !open && setPrimaryDevice(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Star className="w-4 h-4 text-purple-600" />
              Tetapkan Peranti Utama
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tetapkan <strong>{primaryDevice?.deviceName}</strong> sebagai peranti utama anda?
              Peranti utama akan menerima notifikasi keutamaan dan mempunyai keistimewaan keselamatan tertinggi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSetPrimary}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
            >
              Tetapkan Sebagai Utama
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


