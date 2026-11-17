'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, LogIn, Eye, EyeOff, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mascot } from './Mascot'
import type { AppUser } from '@/lib/types'

interface LoginScreenProps {
  onLogin: (user: AppUser) => void
}

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@scholarsync.edu', password: 'admin123', desc: 'Add & manage scholarships' },
  { role: 'Student', email: 'hiba@scholarsync.edu', password: 'student123', desc: 'Browse, track, message teachers' },
  { role: 'Student', email: 'bisma@scholarsync.edu', password: 'student123', desc: 'Browse, track, message teachers' },
  { role: 'Teacher', email: 'aleena@hitms.edu.pk', password: 'teacher123', desc: 'Receive student messages' },
]

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Login failed.')
        setLoading(false)
        return
      }
      onLogin(data.user as AppUser)
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  function quickFill(acc: typeof DEMO_ACCOUNTS[number]) {
    setEmail(acc.email)
    setPassword(acc.password)
    setError(null)
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-emerald-950">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-8 p-6 lg:grid-cols-2">
        {/* Left — Hero */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden flex-col gap-6 p-6 lg:flex"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight">ScholarSync</span>
            <Badge variant="secondary" className="ml-1">HITMS</Badge>
          </div>
          <h1 className="text-4xl font-bold leading-tight text-foreground">
            One place for every <span className="text-primary">scholarship</span> you care about.
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover HEC, DAAD, Erasmus, Commonwealth, Chevening and more. Track your progress, ask your teachers for
            recommendation letters, and chat with <span className="font-semibold text-primary">ScholarBot</span> — your
            personal AI guide.
          </p>
          <div className="flex flex-col items-center gap-2 self-start rounded-2xl border border-emerald-200/60 bg-white/70 p-4 shadow-sm dark:border-emerald-900/40 dark:bg-slate-900/60">
            <Mascot size={88} variant="idle" />
            <p className="text-sm text-muted-foreground">
              <Sparkles className="mr-1 inline h-4 w-4 text-primary" />
              Hi! Main ScholarBot hoon. Login karein aur hum shuru karein.
            </p>
          </div>
        </motion.div>

        {/* Right — Login card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto w-full max-w-md"
        >
          <Card className="border-emerald-200/60 shadow-lg dark:border-emerald-900/40">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-center lg:hidden">
                <Mascot size={72} variant="wave" />
              </div>
              <CardTitle className="text-center text-2xl">Welcome back</CardTitle>
              <CardDescription className="text-center">
                Apna account login karein aur scholarships explore karein.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@scholarsync.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPwd ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
                      aria-label={showPwd ? 'Hide password' : 'Show password'}
                    >
                      {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Logging in…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" /> Login
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-6">
                <p className="mb-2 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Quick demo logins
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {DEMO_ACCOUNTS.map((a) => (
                    <button
                      key={a.email}
                      type="button"
                      onClick={() => quickFill(a)}
                      className="rounded-md border border-border bg-card px-2 py-2 text-left text-xs transition hover:border-primary hover:bg-accent"
                    >
                      <div className="font-semibold text-foreground">{a.role}</div>
                      <div className="truncate text-muted-foreground">{a.email}</div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-center">
              <p className="text-xs text-muted-foreground">
                ScholarSync demo for HITMS — Software Engineering CCP project.
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
