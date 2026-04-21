'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ShieldCheck, Smartphone, Laptop, Tablet, Monitor, Fingerprint, Plus, Trash2, Star, CheckCircle2, XCircle, AlertTriangle, Clock, MapPin, Globe, Activity, Lock, ShieldAlert, ShieldX, Download, Search, Filter, Wifi, Info, ChevronRight, Loader2, CircleCheck, Zap, KeyRound, MessageSquare } from 'lucide-react';

type Dev = { id: string; name: string; type: string; ua: string; ip: string; loc: string; primary: boolean; trusted: boolean; active: boolean; lastUsed: string };
type Log = { id: string; action: string; method: string; device: string; ip: string; status: string; details: string; time: string };
type BStep = 'idle' | 'otp' | 'success';
type BioStep = 'idle' | 'preparing' | 'scanning' | 'done';

const DEVICES: Dev[] = [
  { id: 'd1', name: 'iPhone 15 Pro Max', type: 'mobile', ua: 'Safari 17.4 / iOS 17.4', ip: '192.168.1.105', loc: 'Kuala Lumpur', primary: true, trusted: true, active: true, lastUsed: '2026-06-15T10:32:00Z' },
  { id: 'd2', name: 'MacBook Pro M3', type: 'desktop', ua: 'Chrome 125 / macOS 14.5', ip: '192.168.1.42', loc: 'Kuala Lumpur', primary: false, trusted: true, active: true, lastUsed: '2026-06-15T09:15:00Z' },
  { id: 'd3', name: 'Samsung Galaxy S24', type: 'mobile', ua: 'Chrome 125 / Android 14', ip: '103.45.67.89', loc: 'Johor Bahru', primary: false, trusted: false, active: true, lastUsed: '2026-06-14T18:45:00Z' },
  { id: 'd4', name: 'iPad Air M2', type: 'tablet', ua: 'Safari 17.4 / iPadOS 17.4', ip: '192.168.1.88', loc: 'Petaling Jaya', primary: false, trusted: true, active: false, lastUsed: '2026-06-10T15:00:00Z' },
];

const LOGS: Log[] = [
  { id: 'l1', action: 'login', method: 'password', device: 'iPhone 15 Pro Max', ip: '192.168.1.105', status: 'success', details: 'Login berjaya melalui kata laluan', time: '2026-06-15T10:32:00Z' },
  { id: 'l2', action: 'device_bind', method: 'device_bind', device: 'Samsung Galaxy S24', ip: '103.45.67.89', status: 'success', details: 'Peranti baru berjaya diikat', time: '2026-06-14T18:45:00Z' },
  { id: 'l3', action: 'login', method: 'password', device: 'Peranti Tidak Dikenali', ip: '45.33.128.9', status: 'failed', details: 'Kata laluan salah — 3 percubaan gagal', time: '2026-06-14T12:20:00Z' },
  { id: 'l4', action: 'login', method: 'password', device: 'Peranti Tidak Dikenali', ip: '45.33.128.9', status: 'blocked', details: 'Akaun dikunci selepas 5 percubaan gagal', time: '2026-06-14T12:25:00Z' },
  { id: 'l5', action: 'biometric_setup', method: 'fingerprint', device: 'iPhone 15 Pro Max', ip: '192.168.1.105', status: 'success', details: 'Cap jari berjaya didaftarkan', time: '2026-06-13T09:00:00Z' },
  { id: 'l6', action: 'transaction_verify', method: 'webauthn', device: 'iPhone 15 Pro Max', ip: '192.168.1.105', status: 'success', details: 'Transaksi disahkan dengan biometrik', time: '2026-06-12T16:30:00Z' },
  { id: 'l7', action: 'device_unbind', method: 'device_bind', device: 'iPhone 12', ip: '192.168.1.50', status: 'success', details: 'Peranti berjaya dikeluarkan oleh pengguna', time: '2026-06-11T14:00:00Z' },
  { id: 'l8', action: 'login', method: 'webauthn', device: 'MacBook Pro M3', ip: '192.168.1.42', status: 'success', details: 'Login berjaya melalui biometrik', time: '2026-06-10T08:45:00Z' },
  { id: 'l9', action: 'login', method: 'otp', device: 'Peranti Tidak Dikenali', ip: '203.106.88.12', status: 'failed', details: 'OTP tamat tempoh — tidak disahkan dalam 5 minit', time: '2026-06-09T20:10:00Z' },
  { id: 'l10', action: 'device_bind', method: 'device_bind', device: 'Peranti Mencurigakan', ip: '185.220.101.34', status: 'blocked', details: 'Pengikatan disekat — IP mencurigakan', time: '2026-06-02T03:15:00Z' },
];

const AL: Record<string, string> = { login: 'Log Masuk', device_bind: 'Ikatan Peranti', device_unbind: 'Nyahikat Peranti', biometric_setup: 'Biometrik', transaction_verify: 'Pengesahan Transaksi' };
const ML: Record<string, string> = { password: 'Kata Laluan', webauthn: 'WebAuthn', device_bind: 'Pengikatan', fingerprint: 'Cap Jari', face: 'Pengesahan Muka', otp: 'SMS OTP' };
const fade = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };
const stagger = { animate: { transition: { staggerChildren: 0.08 } } };

const DevIcon = ({ type, className }: { type: string; className?: string }) => {
  const M = type === 'mobile' ? Smartphone : type === 'desktop' ? Laptop : Tablet;
  return <M className={className} />;
};

function StatusBadge({ status }: { status: string }) {
  if (status === 'success') return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 gap-1"><CheckCircle2 className="w-3 h-3" />Berjaya</Badge>;
  if (status === 'failed') return <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100 gap-1"><XCircle className="w-3 h-3" />Gagal</Badge>;
  return <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 gap-1"><ShieldX className="w-3 h-3" />Disekat</Badge>;
}

function PulseFingerprint() {
  return (
    <div className="relative flex items-center justify-center">
      <motion.div className="absolute rounded-full bg-emerald-500/20" animate={{ scale: [1, 1.5, 2], opacity: [0.6, 0.3, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }} style={{ width: 72, height: 72 }} />
      <motion.div className="absolute rounded-full bg-emerald-500/15" animate={{ scale: [1, 1.3, 1.7], opacity: [0.4, 0.2, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.5 }} style={{ width: 72, height: 72 }} />
      <Fingerprint className="text-emerald-600" style={{ width: 72, height: 72 }} />
    </div>
  );
}

function DevCard({ d, isCurrent, onRemove, onSetPrimary }: { d: Dev; isCurrent: boolean; onRemove: () => void; onSetPrimary: () => void }) {
  return (
    <motion.div {...fade} layout>
      <Card className={`overflow-hidden transition-all hover:shadow-md ${isCurrent ? 'border-emerald-300 bg-emerald-50/30 ring-1 ring-emerald-200' : d.active ? 'border-gray-200' : 'border-gray-200 opacity-70'}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`flex items-center justify-center w-11 h-11 rounded-xl shrink-0 ${isCurrent ? 'bg-emerald-100 text-emerald-700' : d.active ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-400'}`}>
              <DevIcon type={d.type} className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-gray-900 truncate">{d.name}</span>
                {isCurrent && <Badge className="bg-emerald-600 text-white border-emerald-600 text-[10px] px-1.5 py-0">Peranti Semasa</Badge>}
                {d.primary && <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-[10px] px-1.5 py-0 gap-0.5"><Star className="w-2.5 h-2.5" />Utama</Badge>}
                {d.trusted && <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] px-1.5 py-0 gap-0.5"><CheckCircle2 className="w-2.5 h-2.5" />Dipercayai</Badge>}
                {!d.active && <Badge className="bg-gray-100 text-gray-500 border-gray-200 text-[10px] px-1.5 py-0">Tidak Aktif</Badge>}
              </div>
              <div className="mt-1.5 space-y-0.5">
                <p className="text-xs text-muted-foreground">{d.ua}</p>
                <p className="text-xs text-muted-foreground">{d.ip} · {d.loc}</p>
                <p className="text-xs text-muted-foreground">Terakhir: {new Date(d.lastUsed).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <div className="flex items-center gap-2 mt-3">
                {!d.primary && d.active && (
                  <Button variant="outline" size="sm" onClick={onSetPrimary} className="text-xs h-7 gap-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                    <Star className="w-3 h-3" />Tandai Utama
                  </Button>
                )}
                {!isCurrent && (
                  <Button variant="outline" size="sm" onClick={onRemove} className="text-xs h-7 gap-1 border-red-200 text-red-600 hover:bg-red-50">
                    <Trash2 className="w-3 h-3" />Alih Keluar
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

function StatCard({ label, value, icon: Icon, bg, color }: { label: string; value: number; icon: any; bg: string; color: string }) {
  return (
    <Card><CardContent className="p-3 sm:p-4"><div className="flex items-center gap-2.5">
      <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${bg} ${color}`}><Icon className="w-4 h-4" /></div>
      <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-xl font-bold text-gray-900">{value}</p></div>
    </div></CardContent></Card>
  );
}

export default function TapSecurePage() {
  const [tab, setTab] = useState('devices');
  const [devices, setDevices] = useState<Dev[]>([]);
  const [logs] = useState<Log[]>(LOGS);
  const [loading, setLoading] = useState(true);
  const [bindOpen, setBindOpen] = useState(false);
  const [bindStep, setBindStep] = useState<BStep>('idle');
  const [bindCode, setBindCode] = useState('');
  const [otp, setOtp] = useState('');
  const [removeDev, setRemoveDev] = useState<Dev | null>(null);
  const [primDev, setPrimDev] = useState<Dev | null>(null);
  const [bioStep, setBioStep] = useState<BioStep>('idle');
  const [bioActive] = useState(true);
  const [bioTx, setBioTx] = useState(true);
  const [devOnly, setDevOnly] = useState(true);
  const [timeout, setTimeout_] = useState(30);
  const [logSearch, setLogSearch] = useState('');
  const [logStatus, setLogStatus] = useState('all');
  const [logAction, setLogAction] = useState('all');

  useEffect(() => { const t = setTimeout(() => { setDevices(DEVICES); setLoading(false); }, 600); return () => clearTimeout(t); }, []);

  const otherDevices = useMemo(() => devices.filter(d => d.id !== 'd1'), [devices]);
  const filteredLogs = useMemo(() => logs.filter(l => {
    if (logStatus !== 'all' && l.status !== logStatus) return false;
    if (logAction !== 'all' && l.action !== logAction) return false;
    if (logSearch) { const s = logSearch.toLowerCase(); return l.ip.toLowerCase().includes(s) || l.device.toLowerCase().includes(s) || l.details.toLowerCase().includes(s); }
    return true;
  }), [logs, logSearch, logStatus, logAction]);

  const logStats = useMemo(() => ({ total: logs.length, success: logs.filter(l => l.status === 'success').length, failed: logs.filter(l => l.status === 'failed').length, blocked: logs.filter(l => l.status === 'blocked').length }), [logs]);
  const devStats = useMemo(() => ({ total: devices.length, primary: devices.filter(d => d.primary).length, trusted: devices.filter(d => d.trusted).length, active: devices.filter(d => d.active).length }), [devices]);

  const handleAdd = () => { setBindStep('idle'); setOtp(''); setBindCode(Math.floor(100000 + Math.random() * 900000).toString()); setBindOpen(true); };
  const handleOtpSubmit = () => {
    if (otp.length !== 6) return;
    setBindStep('success');
    const nd: Dev = { id: `d_${Date.now()}`, name: 'Peranti Baru', type: 'mobile', ua: 'Chrome 125 / Android 14', ip: '110.159.22.33', loc: 'Shah Alam', primary: false, trusted: false, active: true, lastUsed: new Date().toISOString() };
    setTimeout(() => { setDevices(p => [...p, nd]); toast.success('Peranti berjaya diikat!'); }, 800);
  };
  const confirmRemove = () => { if (!removeDev) return; setDevices(p => p.filter(d => d.id !== removeDev.id)); toast.success(`${removeDev.name} dikeluarkan`); setRemoveDev(null); };
  const confirmPrimary = () => { if (!primDev) return; setDevices(p => p.map(d => ({ ...d, primary: d.id === primDev.id }))); toast.success(`${primDev.name} ditetapkan utama`); setPrimDev(null); };
  const handleBio = () => { setBioStep('preparing'); setTimeout(() => setBioStep('scanning'), 1500); setTimeout(() => setBioStep('done'), 4000); };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 to-gray-50 flex flex-col">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-600 text-white shadow-sm"><ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" /></div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">TapSecure</h1>
                  <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5">™</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Pengurusan keselamatan peranti &amp; pengesahan</p>
              </div>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 gap-1"><Zap className="w-3 h-3" />Dilindungi</Badge>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full sm:w-auto grid grid-cols-3 mb-6">
            <TabsTrigger value="devices" className="gap-1.5 text-xs sm:text-sm"><Smartphone className="w-4 h-4 hidden sm:block" />Pengikatan Peranti</TabsTrigger>
            <TabsTrigger value="biometric" className="gap-1.5 text-xs sm:text-sm"><Fingerprint className="w-4 h-4 hidden sm:block" />Pengesahan Biometrik</TabsTrigger>
            <TabsTrigger value="logs" className="gap-1.5 text-xs sm:text-sm"><Activity className="w-4 h-4 hidden sm:block" />Log Keselamatan</TabsTrigger>
          </TabsList>

          {/* TAB 1: Pengikatan Peranti */}
          <TabsContent value="devices">
            <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-6">
              <motion.div {...fade}>
                <Card className="border-amber-200 bg-amber-50/50"><CardContent className="p-3 sm:p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 text-amber-600 shrink-0 mt-0.5"><Info className="w-4 h-4" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-amber-800">SMS OTP Telah Dihapuskan</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Keselamatan akaun kini menggunakan <strong>Pengikatan Peranti</strong> sebagai ganti SMS OTP.</p>
                    </div>
                  </div>
                </CardContent></Card>
              </motion.div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard label="Jumlah Peranti" value={devStats.total} icon={Smartphone} bg="bg-gray-100" color="text-gray-600" />
                <StatCard label="Peranti Utama" value={devStats.primary} icon={Star} bg="bg-purple-100" color="text-purple-600" />
                <StatCard label="Dipercayai" value={devStats.trusted} icon={CheckCircle2} bg="bg-emerald-100" color="text-emerald-600" />
                <StatCard label="Sesi Aktif" value={devStats.active} icon={Wifi} bg="bg-teal-100" color="text-teal-600" />
              </div>

              <motion.div {...fade}>
                <Card className="overflow-hidden border-emerald-300 bg-gradient-to-r from-emerald-50/80 to-white">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-600 text-white"><Monitor className="w-3.5 h-3.5" /></div>
                        Peranti Semasa
                      </CardTitle>
                      <Badge className="bg-emerald-600 text-white border-emerald-600 text-[10px] gap-1"><Wifi className="w-3 h-3" />Sesi Aktif</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {!loading && devices.filter(d => d.id === 'd1').map(d => (
                      <DevCard key={d.id} d={d} isCurrent onRemove={() => setRemoveDev(d)} onSetPrimary={() => setPrimDev(d)} />
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div {...fade}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-muted-foreground" />Peranti Terikat Lain
                    <Badge variant="secondary" className="text-xs">{otherDevices.length}</Badge>
                  </h2>
                  <Button onClick={handleAdd} size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"><Plus className="w-3.5 h-3.5" />Tambah Peranti</Button>
                </div>
                {!loading && (otherDevices.length === 0 ? (
                  <Card><CardContent className="py-10 text-center">
                    <Smartphone className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900">Tiada peranti terikat lain</p>
                  </CardContent></Card>
                ) : otherDevices.map(d => (
                  <div key={d.id} className="mb-3"><DevCard d={d} isCurrent={false} onRemove={() => setRemoveDev(d)} onSetPrimary={() => setPrimDev(d)} /></div>
                )))}
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* TAB 2: Pengesahan Biometrik */}
          <TabsContent value="biometric">
            <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-6">
              <motion.div {...fade}>
                <Card className="overflow-hidden border-emerald-200"><CardContent className="p-6 sm:p-8">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <AnimatePresence mode="wait">
                      {bioStep === 'idle' && (
                        <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                          <PulseFingerprint />
                          <div><h3 className="text-lg font-bold text-gray-900">Pengesahan Biometrik</h3>
                            <p className="text-sm text-muted-foreground mt-1 max-w-md">Daftarkan cap jari atau pengesahan muka untuk akses lebih selamat.</p></div>
                          <Button onClick={handleBio} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"><Fingerprint className="w-4 h-4" />Aktifkan Pengesahan Biometrik</Button>
                        </motion.div>
                      )}
                      {bioStep === 'preparing' && (
                        <motion.div key="prep" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}><Loader2 className="w-16 h-16 text-emerald-600 mx-auto" /></motion.div>
                          <div><h3 className="text-lg font-bold text-gray-900">Menyediakan pengesahan...</h3><p className="text-sm text-muted-foreground mt-1">Menghubungkan ke pengimbas biometrik</p></div>
                        </motion.div>
                      )}
                      {bioStep === 'scanning' && (
                        <motion.div key="scan" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                          <PulseFingerprint />
                          <div><h3 className="text-lg font-bold text-gray-900">Sila sentuh pengimbas cap jari</h3><p className="text-sm text-muted-foreground mt-1">atau arahkan muka anda ke kamera</p></div>
                          <div className="w-full max-w-xs mx-auto"><div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div className="h-full bg-emerald-500 rounded-full" initial={{ width: '0%' }} animate={{ width: '65%' }} transition={{ duration: 2.5, ease: 'easeOut' }} />
                          </div></div>
                        </motion.div>
                      )}
                      {bioStep === 'done' && (
                        <motion.div key="done" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
                            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mx-auto"><CircleCheck className="w-10 h-10 text-emerald-600" /></div>
                          </motion.div>
                          <div><h3 className="text-lg font-bold text-emerald-700">Biometrik berjaya didaftarkan!</h3><p className="text-sm text-muted-foreground mt-1">Pengesahan biometrik kini aktif.</p></div>
                          <Button variant="outline" onClick={() => setBioStep('idle')} className="text-emerald-700 border-emerald-200 hover:bg-emerald-50">Selesai</Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </CardContent></Card>
              </motion.div>

              <motion.div {...fade}>
                <Card className="border-amber-200 bg-amber-50/50"><CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-100 text-amber-600 shrink-0"><AlertTriangle className="w-4 h-4" /></div>
                    <div><p className="text-sm font-semibold text-amber-800">SMS OTP Telah Digantikan</p>
                      <p className="text-xs text-muted-foreground mt-0.5">SMS OTP dihentikan secara berperingkat dan digantikan dengan Pengikatan Peranti.</p></div>
                  </div>
                </CardContent></Card>
              </motion.div>

              <motion.div {...fade}>
                <Card><CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><Lock className="w-4 h-4 text-muted-foreground" />Kaedah Pengesahan Semasa</CardTitle>
                  <CardDescription>Perbandingan tahap keselamatan</CardDescription>
                </CardHeader><CardContent className="pt-0">
                  <Table><TableHeader><TableRow><TableHead>Kaedah</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Keselamatan</TableHead></TableRow></TableHeader>
                    <TableBody>
                      <TableRow><TableCell className="font-medium flex items-center gap-2"><KeyRound className="w-4 h-4 text-gray-500" />Kata Laluan</TableCell><TableCell><Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Aktif</Badge></TableCell><TableCell className="text-right"><span className="text-amber-400">★★</span><span className="text-gray-300">★★★</span></TableCell></TableRow>
                      <TableRow className="bg-amber-50/50"><TableCell className="font-medium flex items-center gap-2"><MessageSquare className="w-4 h-4 text-amber-500" />SMS OTP <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] px-1.5 py-0">Dihapuskan</Badge></TableCell><TableCell><Badge className="bg-amber-100 text-amber-600 border-amber-200 gap-1"><AlertTriangle className="w-3 h-3" />Dihapuskan</Badge></TableCell><TableCell className="text-right"><span className="text-amber-400">★</span><span className="text-gray-300">★★★★</span></TableCell></TableRow>
                      <TableRow><TableCell className="font-medium flex items-center gap-2"><Smartphone className="w-4 h-4 text-emerald-600" />Pengikatan Peranti</TableCell><TableCell><Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Aktif</Badge></TableCell><TableCell className="text-right"><span className="text-amber-400">★★★</span><span className="text-gray-300">★★</span></TableCell></TableRow>
                      <TableRow className="bg-emerald-50/50"><TableCell className="font-medium flex items-center gap-2"><Fingerprint className="w-4 h-4 text-emerald-600" />Cap Jari / Muka</TableCell><TableCell>{bioActive ? <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Aktif</Badge> : <Badge variant="outline" className="text-gray-500">Tidak Aktif</Badge>}</TableCell><TableCell className="text-right"><span className="text-amber-400">★★★★★</span></TableCell></TableRow>
                    </TableBody>
                  </Table>
                </CardContent></Card>
              </motion.div>

              <motion.div {...fade}>
                <Card><CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-muted-foreground" />Tetapan Keselamatan</CardTitle>
                  <CardDescription>Konfigurasi pilihan keselamatan akaun</CardDescription>
                </CardHeader><CardContent className="pt-0 space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1"><p className="text-sm font-medium">Sahkan transaksi dengan biometrik</p><p className="text-xs text-muted-foreground mt-0.5">Pengesahan biometrik untuk transaksi kewangan</p></div>
                    <Switch checked={bioTx} onCheckedChange={setBioTx} />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1"><p className="text-sm font-medium">Bataskan akses ke peranti terikat sahaja</p><p className="text-xs text-muted-foreground mt-0.5">Hanya peranti berdaftar boleh mengakses</p></div>
                    <Switch checked={devOnly} onCheckedChange={setDevOnly} />
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div><p className="text-sm font-medium">Had masa tamat sesi</p><p className="text-xs text-muted-foreground mt-0.5">Sesi tamat selepas tempoh tidak aktif</p></div>
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">{timeout >= 60 ? `${timeout / 60} jam` : `${timeout} minit`}</Badge>
                    </div>
                    <Slider value={[timeout]} min={0} max={4} step={1} onValueChange={v => setTimeout_([5, 15, 30, 60, 240][v[0]])} />
                    <div className="flex justify-between text-[10px] text-muted-foreground"><span>5 min</span><span>15 min</span><span>30 min</span><span>1 jam</span><span>4 jam</span></div>
                  </div>
                </CardContent></Card>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* TAB 3: Log Keselamatan */}
          <TabsContent value="logs">
            <motion.div initial="initial" animate="animate" variants={stagger} className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard label="Jumlah Log" value={logStats.total} icon={Activity} bg="bg-gray-100" color="text-gray-600" />
                <StatCard label="Berjaya" value={logStats.success} icon={CheckCircle2} bg="bg-emerald-100" color="text-emerald-600" />
                <StatCard label="Gagal" value={logStats.failed} icon={XCircle} bg="bg-red-100" color="text-red-600" />
                <StatCard label="Disekat" value={logStats.blocked} icon={ShieldX} bg="bg-amber-100" color="text-amber-600" />
              </div>

              <motion.div {...fade}>
                <Card><CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Cari IP, peranti, atau butiran..." value={logSearch} onChange={e => setLogSearch(e.target.value)} className="pl-8 h-9 text-sm" />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Select value={logAction} onValueChange={setLogAction}><SelectTrigger size="sm" className="w-[140px] text-xs"><Filter className="w-3 h-3 mr-1" /><SelectValue placeholder="Tindakan" /></SelectTrigger>
                        <SelectContent><SelectItem value="all">Semua Tindakan</SelectItem>{Object.entries(AL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                      </Select>
                      <Select value={logStatus} onValueChange={setLogStatus}><SelectTrigger size="sm" className="w-[110px] text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent><SelectItem value="all">Semua</SelectItem><SelectItem value="success">Berjaya</SelectItem><SelectItem value="failed">Gagal</SelectItem><SelectItem value="blocked">Disekat</SelectItem></SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-muted-foreground">Menunjukkan {filteredLogs.length} daripada {logs.length} rekod</p>
                    <Button variant="outline" size="sm" onClick={() => toast.success(`${filteredLogs.length} rekod dieksport`)} className="text-xs gap-1 h-7"><Download className="w-3 h-3" />Eksport</Button>
                  </div>
                </CardContent></Card>
              </motion.div>

              <motion.div {...fade}>
                <Card><CardContent className="p-0">
                  <div className="max-h-[500px] overflow-y-auto">
                    <Table><TableHeader className="sticky top-0 bg-gray-50 z-10"><TableRow>
                      <TableHead className="text-xs">Masa</TableHead><TableHead className="text-xs">Tindakan</TableHead><TableHead className="text-xs">Kaedah</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Peranti</TableHead><TableHead className="text-xs hidden sm:table-cell">IP</TableHead><TableHead className="text-xs">Status</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>{filteredLogs.map((l, i) => (
                      <TableRow key={l.id} className={l.status === 'failed' ? 'bg-red-50/50' : l.status === 'blocked' ? 'bg-amber-50/50' : i % 2 ? 'bg-gray-50/30' : ''}>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{new Date(l.time).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true })}</TableCell>
                        <TableCell className="text-xs font-medium">{AL[l.action] || l.action}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{ML[l.method] || l.method}</TableCell>
                        <TableCell className="text-xs hidden md:table-cell"><span className="truncate block max-w-[150px]">{l.device}</span></TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono hidden sm:table-cell">{l.ip}</TableCell>
                        <TableCell><StatusBadge status={l.status} /></TableCell>
                      </TableRow>
                    ))}</TableBody>
                    </Table>
                  </div>
                </CardContent></Card>
              </motion.div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t bg-white/60 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /><span>TapSecure™ — Keselamatan peringkat perusahaan untuk PUSPA</span></div>
            <p className="text-xs text-muted-foreground">Data dilindungi dengan enkripsi hujung-ke-hujung</p>
          </div>
        </div>
      </footer>

      {/* Add Device Dialog */}
      <Dialog open={bindOpen} onOpenChange={o => { if (!o) { setBindOpen(false); setBindStep('idle'); setOtp(''); } }}>
        <DialogContent className="sm:max-w-md"><DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Smartphone className="w-4 h-4 text-emerald-600" />Tambah Peranti Baru</DialogTitle>
          <DialogDescription>Ikut langkah berikut untuk mengikat peranti baru</DialogDescription>
        </DialogHeader>
        <AnimatePresence mode="wait">
          {bindStep === 'idle' && (
            <motion.div key="code" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Masukkan kod pengikatan ini pada peranti baru:</p>
                <div className="bg-emerald-50 border-2 border-dashed border-emerald-300 rounded-xl py-6 px-8 inline-block"><span className="text-4xl font-bold tracking-[0.3em] text-emerald-700 font-mono">{bindCode}</span></div>
                <p className="text-xs text-muted-foreground">Kod tamat tempoh dalam 10 minit</p>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setBindOpen(false)} className="text-xs">Batal</Button>
                <Button onClick={() => setBindStep('otp')} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1">Seterusnya<ChevronRight className="w-3 h-3" /></Button>
              </DialogFooter>
            </motion.div>
          )}
          {bindStep === 'otp' && (
            <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mx-auto"><Fingerprint className="w-6 h-6 text-emerald-600" /></div>
                <div><p className="text-sm font-medium">Sahkan OTP dari peranti baru</p><p className="text-xs text-muted-foreground mt-1">Masukkan kod 6-digit dari peranti baru</p></div>
                <div className="flex justify-center"><Input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" maxLength={6} className="w-40 text-center text-2xl font-mono tracking-[0.3em] h-12" /></div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => { setBindStep('idle'); setOtp(''); }} className="text-xs">Kembali</Button>
                <Button onClick={handleOtpSubmit} disabled={otp.length !== 6} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1"><CheckCircle2 className="w-3 h-3" />Sahkan</Button>
              </DialogFooter>
            </motion.div>
          )}
          {bindStep === 'success' && (
            <motion.div key="ok" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center space-y-3 py-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mx-auto"><CircleCheck className="w-8 h-8 text-emerald-600" /></div>
              </motion.div>
              <div><p className="text-base font-bold text-emerald-700">Peranti berjaya diikat!</p><p className="text-sm text-muted-foreground mt-1">Peranti baru telah ditambah.</p></div>
              <DialogFooter className="justify-center"><Button onClick={() => { setBindOpen(false); setBindStep('idle'); setOtp(''); }} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">Selesai</Button></DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Remove Device Alert */}
      <AlertDialog open={!!removeDev} onOpenChange={o => !o && setRemoveDev(null)}>
        <AlertDialogContent><AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-red-500" />Alih Keluar Peranti</AlertDialogTitle>
          <AlertDialogDescription>Adakah anda pasti ingin mengalih keluar <strong>{removeDev?.name}</strong>?</AlertDialogDescription>
        </AlertDialogHeader><AlertDialogFooter>
          <AlertDialogCancel className="text-xs">Batal</AlertDialogCancel>
          <AlertDialogAction onClick={confirmRemove} className="bg-red-600 hover:bg-red-700 text-white text-xs">Alih Keluar</AlertDialogAction>
        </AlertDialogFooter></AlertDialogContent>
      </AlertDialog>

      {/* Set Primary Alert */}
      <AlertDialog open={!!primDev} onOpenChange={o => !o && setPrimDev(null)}>
        <AlertDialogContent><AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2"><Star className="w-4 h-4 text-purple-600" />Tetapkan Peranti Utama</AlertDialogTitle>
          <AlertDialogDescription>Tetapkan <strong>{primDev?.name}</strong> sebagai peranti utama?</AlertDialogDescription>
        </AlertDialogHeader><AlertDialogFooter>
          <AlertDialogCancel className="text-xs">Batal</AlertDialogCancel>
          <AlertDialogAction onClick={confirmPrimary} className="bg-purple-600 hover:bg-purple-700 text-white text-xs">Tetapkan Utama</AlertDialogAction>
        </AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
