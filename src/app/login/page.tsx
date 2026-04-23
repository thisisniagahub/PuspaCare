'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { LockKeyhole, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      const result = await response.json().catch(() => ({}))
      if (!response.ok || !result?.success) {
        throw new Error(result?.error || 'Login gagal')
      }

      const next = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('next') || '/'
        : '/'
      router.replace(next)
      router.refresh()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Login gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 px-4 py-10 dark:from-slate-950 dark:via-background dark:to-slate-900">
      <div className="mx-auto flex min-h-[80vh] max-w-5xl items-center justify-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="hidden rounded-3xl border bg-white/80 p-8 shadow-sm backdrop-blur lg:block dark:bg-slate-950/70">
            <div className="mb-6 flex items-center gap-3">
              <Image src="/puspa-logo-official.png" alt="PUSPA" width={44} height={44} className="object-contain" />
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-purple-700">PUSPA</p>
                <p className="text-sm text-muted-foreground">Pertubuhan Urus Peduli Asnaf</p>
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Operator access only</h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              Login ini aktifkan sesi operator server-side untuk lindungi dashboard, API dalaman, dan modul AI/Ops.
            </p>

            <div className="mt-8 grid gap-4">
              <div className="rounded-2xl border p-4">
                <div className="mb-2 flex items-center gap-2 font-semibold"><ShieldCheck className="h-5 w-5 text-emerald-600" />Server-side session</div>
                <p className="text-sm text-muted-foreground">Browser request ke `/api/v1/*` akan guna sesi sah, bukan lagi bergantung pada role localStorage.</p>
              </div>
              <div className="rounded-2xl border p-4">
                <div className="mb-2 flex items-center gap-2 font-semibold"><LockKeyhole className="h-5 w-5 text-purple-600" />Protected operations</div>
                <p className="text-sm text-muted-foreground">Route sensitif seperti AI Ops, compliance, eKYC, dan TapSecure kini boleh dikawal ikut role di server.</p>
              </div>
            </div>
          </div>

          <Card className="border-purple-100 shadow-lg dark:border-purple-900/40">
            <CardHeader>
              <div className="mb-3 flex items-center gap-3 lg:hidden">
                <Image src="/puspa-logo-official.png" alt="PUSPA" width={36} height={36} className="object-contain" />
                <div>
                  <CardTitle>PUSPA Operator Login</CardTitle>
                  <CardDescription>Akses dalaman sahaja</CardDescription>
                </div>
              </div>
              <CardTitle className="hidden lg:block">PUSPA Operator Login</CardTitle>
              <CardDescription>Masuk untuk aktifkan sesi operator dan akses dashboard penuh.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="password">Kata laluan operator</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Masukkan kata laluan"
                    required
                  />
                </div>

                {error ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
                    {error}
                  </div>
                ) : null}

                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? 'Sedang masuk...' : 'Masuk ke PUSPA'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
