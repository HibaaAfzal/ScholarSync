'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  GraduationCap, LogOut, BookOpen, MessageSquare, Users, LayoutDashboard, Menu, X,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet'
import { Mascot } from './Mascot'
import { LoginScreen } from './LoginScreen'
import { ScholarshipsView } from './ScholarshipsView'
import { ScholarshipDetail } from './ScholarshipDetail'
import { AdminDashboard } from './AdminDashboard'
import { TeachersView } from './TeachersView'
import { MessagesView } from './MessagesView'
import { AIChatWidget } from './AIChatWidget'
import type { AppUser, Scholarship, ViewKey } from '@/lib/types'

function initials(name: string) {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

interface NavItem {
  key: ViewKey
  label: string
  icon: typeof BookOpen
  roles: AppUser['role'][]
}

const NAV_ITEMS: NavItem[] = [
  { key: 'scholarships', label: 'Scholarships', icon: BookOpen, roles: ['STUDENT', 'ADMIN'] },
  { key: 'admin', label: 'Admin Dashboard', icon: LayoutDashboard, roles: ['ADMIN'] },
  { key: 'teachers', label: 'Teachers', icon: Users, roles: ['STUDENT'] },
  { key: 'messages', label: 'Messages', icon: MessageSquare, roles: ['STUDENT', 'TEACHER', 'ADMIN'] },
]

export function AppShell() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [booting, setBooting] = useState(true)
  const [view, setView] = useState<ViewKey>('scholarships')
  const [selected, setSelected] = useState<Scholarship | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d?.user) {
          setUser(d.user as AppUser)
          // Default view based on role
          if (d.user.role === 'ADMIN') setView('admin')
          else if (d.user.role === 'TEACHER') setView('messages')
          else setView('scholarships')
        }
        setBooting(false)
      })
      .catch(() => setBooting(false))
  }, [])

  function handleLogin(u: AppUser) {
    setUser(u)
    if (u.role === 'ADMIN') setView('admin')
    else if (u.role === 'TEACHER') setView('messages')
    else setView('scholarships')
    router.refresh()
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    setSelected(null)
    setView('scholarships')
    router.refresh()
  }

  function openScholarship(s: Scholarship) {
    setSelected(s)
  }

  function onStatusChange(id: string, status: any) {
    setSelected((cur) => (cur && cur.id === id ? { ...cur, userStatus: status } : cur))
    setRefreshKey((k) => k + 1)
  }

  if (booting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-50 dark:from-slate-900 dark:to-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Mascot size={72} variant="idle" />
          <p className="text-sm text-muted-foreground">Loading ScholarSync…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />
  }

  const navItems = NAV_ITEMS.filter((n) => n.roles.includes(user.role))

  function setViewAndCloseNav(v: ViewKey) {
    setView(v)
    setMobileNavOpen(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-emerald-50/40 via-background to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-emerald-950/30">
      {/* Top nav */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
          {/* Mobile menu trigger */}
          {navItems.length > 1 && (
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" /> ScholarSync
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-4 flex flex-col gap-1">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const active = view === item.key
                    return (
                      <button
                        key={item.key}
                        onClick={() => setViewAndCloseNav(item.key)}
                        className={`flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition ${
                          active ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-accent'
                        }`}
                      >
                        <Icon className="h-4 w-4" /> {item.label}
                      </button>
                    )
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          )}

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">ScholarSync</span>
            <Badge variant="secondary" className="hidden sm:inline-block">HITMS</Badge>
          </div>

          {/* Desktop nav */}
          <nav className="ml-4 hidden flex-1 items-center gap-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = view === item.key
              return (
                <Button
                  key={item.key}
                  variant={active ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setView(item.key)}
                  className={`gap-1.5 ${active ? '' : 'text-foreground'}`}
                >
                  <Icon className="h-4 w-4" /> {item.label}
                </Button>
              )
            })}
          </nav>

          {/* User menu */}
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <div className="text-xs font-semibold leading-tight">{user.name}</div>
              <div className="text-[11px] text-muted-foreground">{user.email}</div>
            </div>
            <Avatar className="h-8 w-8 border border-primary/30">
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{initials(user.name)}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={logout} aria-label="Logout" title="Logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {view === 'scholarships' && (
              <ScholarshipsView user={user} onOpen={openScholarship} refreshKey={refreshKey} />
            )}
            {view === 'admin' && (
              <AdminDashboard onChanged={() => setRefreshKey((k) => k + 1)} />
            )}
            {view === 'teachers' && (
              <TeachersView onMessageSent={() => setRefreshKey((k) => k + 1)} />
            )}
            {view === 'messages' && (
              <MessagesView user={user} refreshKey={refreshKey} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-background/60">
        <div className="mx-auto max-w-7xl px-4 py-4 text-center text-xs text-muted-foreground">
          <p>
            ScholarSync — Scholarship Aggregation &amp; Guidance System ·
            <span className="ml-1">Software Engineering CCP project, HITMS.</span>
          </p>
          <p className="mt-1">
            Demo data only. Verify all details on the official provider website before applying.
          </p>
        </div>
      </footer>

      {/* Scholarship detail dialog */}
      <ScholarshipDetail scholarship={selected} onClose={() => setSelected(null)} onStatusChange={onStatusChange} />

      {/* Floating AI chat widget — visible to students and admin */}
      {user.role !== 'TEACHER' && <AIChatWidget />}
    </div>
  )
}
