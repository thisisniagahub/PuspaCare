'use client'

import {
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  TriangleAlert,
  Clock,
  Users,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/* ────────────────────────────────────────────────────────── */
/*  Constants                                                 */
/* ────────────────────────────────────────────────────────── */

const MAX_CLIENT_ATTEMPTS = 5
const CLIENT_LOCKOUT_SECONDS = 30

type LoginStatus = 'idle' | 'submitting' | 'success'

/* ────────────────────────────────────────────────────────── */
/*  Feature items for the left panel                          */
/* ────────────────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: Users,
    title: 'Pengurusan Asnaf',
    description:
      'Kelola rekod anggota, kes sokongan, dan sesi bimbingan secara terpadu.',
  },
  {
    icon: ShieldCheck,
    title: 'Keamanan Terjamin',
    description:
      'Sistem terenkripsi dengan autentikasi berlapis untuk lindungi data asnaf.',
  },
  {
    icon: Clock,
    title: 'Akses 24/7',
    description:
      'Sesi staf berlaku 12 jam — cukup untuk satu hari kerja tanpa gangguan.',
  },
  {
    icon: LockKeyhole,
    title: 'Kawalan Akses',
    description:
      'Setiap staf hanya akses modul yang sesuai dengan peranan mereka.',
  },
] as const

/* ────────────────────────────────────────────────────────── */
/*  Main page                                                 */
/* ────────────────────────────────────────────────────────── */

export default function LoginPage() {
  const router = useRouter()
  const passwordRef = useRef<HTMLInputElement>(null)

  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [capsLockOn, setCapsLockOn] = useState(false)
  const [status, setStatus] = useState<LoginStatus>('idle')
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [cooldown, setCooldown] = useState(0)

  // Auto-focus password field on mount
  useEffect(() => {
    passwordRef.current?.focus()
  }, [])

  // Cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  function handleCapsLock(event: KeyboardEvent<HTMLInputElement>) {
    setCapsLockOn(event.getModifierState?.('CapsLock') ?? false)
  }

  function mapError(response: Response): string {
    if (response.status === 401)
      return 'Kata laluan tidak sah. Sila semak semula.'
    if (response.status === 429)
      return 'Terlalu banyak cubaan. Cuba lagi sebentar.'
    if (response.status >= 500)
      return 'Masalah pada server. Sila cuba lagi atau hubungi admin.'
    return 'Login gagal. Sila cuba lagi.'
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'submitting' || cooldown > 0 || password.length === 0) return

    setStatus('submitting')
    setError('')

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const result = await response.json().catch(() => ({}))

      if (!response.ok || !result?.success) {
        if (response.status === 429) {
          const retryAfter = Number(response.headers.get('Retry-After')) || 30
          setCooldown(retryAfter)
        }

        const nextAttempts = attempts + 1
        setAttempts(nextAttempts)

        if (nextAttempts >= MAX_CLIENT_ATTEMPTS && cooldown === 0) {
          setCooldown(CLIENT_LOCKOUT_SECONDS)
        }

        throw new Error(mapError(response))
      }

      setStatus('success')
      const next =
        typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search).get('next') || '/'
          : '/'

      setTimeout(() => {
        router.replace(next)
        router.refresh()
      }, 800)
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Login gagal. Sila cuba lagi.'
      )
      setStatus('idle')
    }
  }

  const isLocked = cooldown > 0
  const isSubmitting = status === 'submitting'
  const isSuccess = status === 'success'
  const isDisabled = isSubmitting || isSuccess || isLocked || password.length === 0
  const remainingAttempts = Math.max(0, MAX_CLIENT_ATTEMPTS - attempts)

  return (
    <main className="relative flex min-h-screen bg-foreground">
      {/* ── Left panel: branding + features (desktop) ── */}
      <div className="relative hidden w-[52%] overflow-hidden lg:block">
        {/* Background image */}
        <Image
          src="/login-bg.jpg"
          alt=""
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-foreground/70" />

        <div className="relative z-10 flex h-full flex-col justify-between p-12 xl:p-16">
          {/* Logo + org */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background/10 ring-1 ring-background/20 backdrop-blur-sm">
              <Image
                src="/puspa-logo-official.png"
                alt="Logo PUSPA"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-primary-foreground">
                PUSPA
              </p>
              <p className="text-xs text-primary-foreground/60">
                Pertubuhan Urus Peduli Asnaf
              </p>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
            className="space-y-6"
          >
            <h1 className="text-balance text-4xl font-bold leading-[1.15] tracking-tight text-primary-foreground xl:text-5xl">
              Sistem pengurusan
              <br />
              <span className="text-primary-foreground/70">untuk operator PUSPA.</span>
            </h1>
            <p className="max-w-md text-pretty text-base leading-relaxed text-primary-foreground/50">
              Akses dashboard asnaf, program kebajikan, dan modul pematuhan
              dalam satu platform yang selamat dan bersepadu.
            </p>
          </motion.div>

          {/* Feature grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            className="grid grid-cols-2 gap-3"
          >
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Right panel: login form ── */}
      <div className="flex flex-1 flex-col bg-background">
        {/* Mobile logo */}
        <div className="flex items-center gap-3 px-6 pt-8 lg:hidden">
          <Image
            src="/puspa-logo-official.png"
            alt="Logo PUSPA"
            width={36}
            height={36}
            className="object-contain"
          />
          <div>
            <p className="text-sm font-bold tracking-tight text-foreground">
              PUSPA
            </p>
            <p className="text-xs text-muted-foreground">Akses operator</p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="w-full max-w-[400px] space-y-8"
          >
            {/* Header */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Log masuk operator
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Masukkan kata laluan operator untuk mulakan sesi kerja anda.
              </p>
            </div>

            {/* Form */}
            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-foreground"
                  >
                    Kata laluan operator
                  </Label>
                  <AnimatePresence>
                    {capsLockOn && !isSuccess && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                        role="status"
                      >
                        <TriangleAlert
                          className="h-3 w-3"
                          aria-hidden="true"
                        />
                        Caps Lock aktif
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                <div className="relative">
                  <Input
                    id="password"
                    ref={passwordRef}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value)
                      if (error) setError('')
                    }}
                    onKeyDown={handleCapsLock}
                    onKeyUp={handleCapsLock}
                    placeholder="Masukkan kata laluan"
                    required
                    disabled={isSubmitting || isSuccess || isLocked}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={
                      error
                        ? 'login-error'
                        : isLocked
                          ? 'login-cooldown'
                          : undefined
                    }
                    className="h-11 pr-11 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
                    aria-label={
                      showPassword
                        ? 'Sembunyikan kata laluan'
                        : 'Paparkan kata laluan'
                    }
                    aria-pressed={showPassword}
                    tabIndex={password.length > 0 ? 0 : -1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error message */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    id="login-error"
                    role="alert"
                    aria-live="polite"
                    className="overflow-hidden"
                  >
                    <div className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 px-3.5 py-3 text-sm text-destructive">
                      <TriangleAlert
                        className="mt-0.5 h-4 w-4 shrink-0"
                        aria-hidden="true"
                      />
                      <div className="space-y-1">
                        <p className="font-medium leading-snug">{error}</p>
                        {attempts > 0 && remainingAttempts > 0 && !isLocked && (
                          <p className="text-xs text-destructive/70">
                            {remainingAttempts} cubaan lagi sebelum dikunci
                            sementara.
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Lockout message */}
              <AnimatePresence mode="wait">
                {isLocked && (
                  <motion.div
                    key="cooldown"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    id="login-cooldown"
                    role="status"
                    aria-live="polite"
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2.5 rounded-lg border border-border bg-muted px-3.5 py-3 text-sm text-muted-foreground">
                      <LockKeyhole
                        className="h-4 w-4 shrink-0"
                        aria-hidden="true"
                      />
                      <p>
                        Terlalu banyak cubaan. Cuba lagi dalam{' '}
                        <span className="font-semibold tabular-nums text-foreground">
                          {cooldown}s
                        </span>
                        .
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit button */}
              <Button
                className="h-11 w-full text-sm font-semibold"
                type="submit"
                disabled={isDisabled}
                aria-busy={isSubmitting}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isSuccess ? (
                    <motion.span
                      key="success"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle2
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                      Berjaya, mengalihkan...
                    </motion.span>
                  ) : isSubmitting ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="flex items-center gap-2"
                    >
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                      Sedang log masuk...
                    </motion.span>
                  ) : isLocked ? (
                    <motion.span
                      key="locked"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="tabular-nums"
                    >
                      Cuba lagi dalam {cooldown}s
                    </motion.span>
                  ) : (
                    <motion.span
                      key="default"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                    >
                      Log masuk ke PUSPA
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </form>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Footer notes */}
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <p>
                Sesi operator aktif selama 12 jam selepas log masuk.
              </p>
              <p>
                Lupa kata laluan? Hubungi admin sistem PUSPA untuk reset akses
                anda.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border px-6 py-4">
          <p className="text-center text-xs text-muted-foreground/60">
            PUSPA KL &amp; Selangor &middot; Sistem Pengurusan NGO v2.1.0
          </p>
        </div>
      </div>
    </main>
  )
}

/* ────────────────────────────────────────────────────────── */
/*  Feature card component                                    */
/* ────────────────────────────────────────────────────────── */

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
  description: string
}) {
  return (
    <div className="group rounded-xl border border-background/10 bg-background/5 p-4 backdrop-blur-sm transition-colors hover:bg-background/10">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-background/10">
        <Icon className="h-4 w-4 text-primary-foreground/80" aria-hidden="true" />
      </div>
      <p className="text-sm font-semibold leading-none text-primary-foreground">
        {title}
      </p>
      <p className="mt-1.5 text-xs leading-relaxed text-primary-foreground/50">
        {description}
      </p>
    </div>
  )
}
