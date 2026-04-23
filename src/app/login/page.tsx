'use client'

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const MAX_CLIENT_ATTEMPTS = 5
const CLIENT_LOCKOUT_SECONDS = 30

type LoginStatus = 'idle' | 'submitting' | 'success'

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

  // Cooldown countdown (client-side lockout + 429 countdown)
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

  function mapError(response: Response, payload: { error?: string }): string {
    if (response.status === 401) {
      return 'Kata laluan tidak sah. Sila semak semula.'
    }
    if (response.status === 429) {
      return 'Terlalu banyak cubaan. Cuba lagi sebentar.'
    }
    if (response.status >= 500) {
      return 'Masalah pada server. Sila cuba lagi atau hubungi admin.'
    }
    return payload?.error || 'Login gagal. Sila cuba lagi.'
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
        // Handle 429 rate limit from server with Retry-After header
        if (response.status === 429) {
          const retryAfter = Number(response.headers.get('Retry-After')) || 30
          setCooldown(retryAfter)
        }

        const nextAttempts = attempts + 1
        setAttempts(nextAttempts)

        // Client-side lockout backup
        if (nextAttempts >= MAX_CLIENT_ATTEMPTS && cooldown === 0) {
          setCooldown(CLIENT_LOCKOUT_SECONDS)
        }

        throw new Error(mapError(response, result))
      }

      setStatus('success')
      const next =
        typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search).get('next') || '/'
          : '/'

      // Small delay so success state is visible before redirect
      setTimeout(() => {
        router.replace(next)
        router.refresh()
      }, 600)
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Login gagal. Sila cuba lagi.',
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
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto flex min-h-[80vh] max-w-5xl items-center justify-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Left: Value proposition panel */}
          <aside className="hidden rounded-3xl border border-border bg-card p-10 shadow-sm lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="mb-8 flex items-center gap-3">
                <Image
                  src="/puspa-logo-official.png"
                  alt="Logo PUSPA"
                  width={48}
                  height={48}
                  className="object-contain"
                />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    PUSPA
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Pertubuhan Urus Peduli Asnaf
                  </p>
                </div>
              </div>

              <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-foreground">
                Sistem pengurusan untuk operator PUSPA.
              </h1>
              <p className="mt-4 max-w-md text-pretty text-base leading-relaxed text-muted-foreground">
                Log masuk untuk akses dashboard asnaf, program kebajikan, dan
                modul pematuhan — semuanya dalam satu tempat yang selamat.
              </p>
            </div>

            <div className="mt-10 grid gap-4">
              <FeatureItem
                icon={<ShieldCheck className="h-5 w-5" aria-hidden="true" />}
                title="Sesi selamat"
                description="Session disimpan sebagai HTTP-only cookie, lindungi akses dashboard dan API dalaman."
              />
              <FeatureItem
                icon={<LockKeyhole className="h-5 w-5" aria-hidden="true" />}
                title="Kawalan peranan"
                description="Setiap modul — AI Ops, compliance, eKYC, TapSecure — dikawal ikut peranan operator."
              />
            </div>
          </aside>

          {/* Right: Login form */}
          <Card className="border-border shadow-sm">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-3 lg:hidden">
                <Image
                  src="/puspa-logo-official.png"
                  alt="Logo PUSPA"
                  width={40}
                  height={40}
                  className="object-contain"
                />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    PUSPA
                  </p>
                  <p className="text-sm text-muted-foreground">Akses operator</p>
                </div>
              </div>
              <CardTitle className="text-2xl font-semibold">
                Log masuk operator
              </CardTitle>
              <CardDescription>
                Masukkan kata laluan operator untuk mulakan sesi kerja anda.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Kata laluan operator
                    </Label>
                    {capsLockOn && !isSuccess ? (
                      <span
                        className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground"
                        role="status"
                      >
                        <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
                        Caps Lock aktif
                      </span>
                    ) : null}
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
                        error ? 'login-error' : isLocked ? 'login-cooldown' : undefined
                      }
                      className="pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0"
                      aria-label={
                        showPassword ? 'Sembunyikan kata laluan' : 'Paparkan kata laluan'
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

                {error ? (
                  <div
                    id="login-error"
                    role="alert"
                    aria-live="polite"
                    className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
                  >
                    <TriangleAlert
                      className="mt-0.5 h-4 w-4 shrink-0"
                      aria-hidden="true"
                    />
                    <div className="space-y-1">
                      <p className="font-medium leading-snug">{error}</p>
                      {attempts > 0 && remainingAttempts > 0 && !isLocked ? (
                        <p className="text-xs text-destructive/80">
                          {remainingAttempts} cubaan lagi sebelum dikunci sementara.
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {isLocked ? (
                  <div
                    id="login-cooldown"
                    role="status"
                    aria-live="polite"
                    className="flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-2.5 text-sm text-muted-foreground"
                  >
                    <LockKeyhole className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <p>
                      Terlalu banyak cubaan. Cuba lagi dalam{' '}
                      <span className="font-semibold tabular-nums text-foreground">
                        {cooldown}s
                      </span>
                      .
                    </p>
                  </div>
                ) : null}

                <Button
                  className="w-full"
                  type="submit"
                  size="lg"
                  disabled={isDisabled}
                  aria-busy={isSubmitting}
                >
                  {isSuccess ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      Berjaya, mengalihkan...
                    </>
                  ) : isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Sedang log masuk...
                    </>
                  ) : isLocked ? (
                    `Cuba lagi dalam ${cooldown}s`
                  ) : (
                    'Log masuk ke PUSPA'
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col items-start gap-1 border-t border-border pt-4 text-xs text-muted-foreground">
              <p>Sesi operator aktif selama 12 jam selepas log masuk.</p>
              <p>
                Lupa kata laluan? Hubungi admin sistem PUSPA untuk reset akses
                anda.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  )
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-background/50 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold leading-none text-foreground">
          {title}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  )
}
