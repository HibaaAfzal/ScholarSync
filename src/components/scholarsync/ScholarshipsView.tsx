'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search, Globe, GraduationCap, Wallet, Calendar, ExternalLink, MapPin, Bookmark, CheckCircle2, Heart, Filter, X,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Scholarship, TrackingStatus, AppUser } from '@/lib/types'

interface ScholarshipsViewProps {
  user: AppUser
  onOpen: (s: Scholarship) => void
  refreshKey?: number
}

const STATUS_META: Record<TrackingStatus, { label: string; cls: string; icon: typeof Bookmark }> = {
  INTERESTED: { label: 'Interested', cls: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200', icon: Heart },
  SAVED: { label: 'Saved', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200', icon: Bookmark },
  APPLIED: { label: 'Applied', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200', icon: CheckCircle2 },
}

export function ScholarshipsView({ user, onOpen, refreshKey = 0 }: ScholarshipsViewProps) {
  const [state, setState] = useState<{ loading: boolean; scholarships: Scholarship[] }>({ loading: true, scholarships: [] })
  const [search, setSearch] = useState('')
  const [country, setCountry] = useState('ALL')
  const [degreeLevel, setDegreeLevel] = useState('ALL')
  const [fundingType, setFundingType] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    let cancelled = false
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (country !== 'ALL') params.set('country', country)
    if (degreeLevel !== 'ALL') params.set('degreeLevel', degreeLevel)
    if (fundingType !== 'ALL') params.set('fundingType', fundingType)
    if (statusFilter !== 'ALL') params.set('status', statusFilter)
    fetch(`/api/scholarships?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return
        setState({ loading: false, scholarships: d.scholarships || [] })
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, scholarships: [] })
      })
    return () => {
      cancelled = true
    }
  }, [search, country, degreeLevel, fundingType, statusFilter, refreshKey])

  const scholarships = state.scholarships
  const loading = state.loading

  const countries = useMemo(() => {
    const set = new Set<string>()
    scholarships.forEach((s) => set.add(s.country))
    return ['ALL', ...Array.from(set).sort()]
  }, [scholarships])

  const fundingTypes = useMemo(() => {
    const set = new Set<string>()
    scholarships.forEach((s) => set.add(s.fundingType))
    return ['ALL', ...Array.from(set).sort()]
  }, [scholarships])

  const degreeOptions = ['ALL', 'Undergraduate', 'Master', 'PhD', 'Bachelor']

  const clearFilters = () => {
    setSearch('')
    setCountry('ALL')
    setDegreeLevel('ALL')
    setFundingType('ALL')
    setStatusFilter('ALL')
  }

  const anyFilter = search || country !== 'ALL' || degreeLevel !== 'ALL' || fundingType !== 'ALL' || statusFilter !== 'ALL'

  const stats = useMemo(() => {
    const total = scholarships.length
    const applied = scholarships.filter((s) => s.userStatus === 'APPLIED').length
    const saved = scholarships.filter((s) => s.userStatus === 'SAVED').length
    const interested = scholarships.filter((s) => s.userStatus === 'INTERESTED').length
    return { total, applied, saved, interested }
  }, [scholarships])

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="rounded-2xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-slate-50 p-5 dark:border-emerald-900/40 dark:from-emerald-950/40 dark:to-slate-900">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Assalam-o-Alaikum, {user.name.split(' ')[0]}!
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse curated scholarships, track your progress, and tap any card to see full details.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total" value={stats.total} icon={Globe} tone="primary" />
          <StatCard label="Interested" value={stats.interested} icon={Heart} tone="rose" />
          <StatCard label="Saved" value={stats.saved} icon={Bookmark} tone="amber" />
          <StatCard label="Applied" value={stats.applied} icon={CheckCircle2} tone="emerald" />
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" /> Search &amp; Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title, provider, or description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger><SelectValue placeholder="Country" /></SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c} value={c}>{c === 'ALL' ? 'All countries' : c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={degreeLevel} onValueChange={setDegreeLevel}>
              <SelectTrigger><SelectValue placeholder="Degree" /></SelectTrigger>
              <SelectContent>
                {degreeOptions.map((d) => (
                  <SelectItem key={d} value={d}>{d === 'ALL' ? 'All degrees' : d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={fundingType} onValueChange={setFundingType}>
              <SelectTrigger><SelectValue placeholder="Funding" /></SelectTrigger>
              <SelectContent>
                {fundingTypes.map((f) => (
                  <SelectItem key={f} value={f}>{f === 'ALL' ? 'All funding types' : f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue placeholder="My status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                <SelectItem value="INTERESTED">Interested</SelectItem>
                <SelectItem value="SAVED">Saved</SelectItem>
                <SelectItem value="APPLIED">Applied</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {anyFilter && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-1 h-3 w-3" /> Clear filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-xl border border-border bg-muted/40" />
          ))}
        </div>
      ) : scholarships.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Search className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">Koi scholarship is filter mein nahi mili. Filters clear kar ke dekhein.</p>
            {anyFilter && (
              <Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scholarships.map((s, i) => (
            <ScholarshipCard key={s.id} scholarship={s} onOpen={onOpen} index={i} />
          ))}
        </motion.div>
      )}
    </div>
  )
}

function StatCard({
  label, value, icon: Icon, tone,
}: { label: string; value: number; icon: typeof Globe; tone: 'primary' | 'rose' | 'amber' | 'emerald' }) {
  const toneCls = {
    primary: 'bg-primary/10 text-primary',
    rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
  }[tone]
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneCls}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-lg font-bold leading-none">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}

function ScholarshipCard({ scholarship, onOpen, index }: { scholarship: Scholarship; onOpen: (s: Scholarship) => void; index: number }) {
  const status = scholarship.userStatus
  const StatusIcon = status ? STATUS_META[status].icon : null
  const fundingTone =
    scholarship.fundingType === 'Fully Funded'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
      : scholarship.fundingType.includes('Loan')
      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200'
      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.4) }}
      onClick={() => onOpen(scholarship)}
      className="group relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <div className="flex items-start justify-between gap-2 border-b border-border bg-muted/30 p-4">
        <div className="flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className={fundingTone}>{scholarship.fundingType}</Badge>
            {status && StatusIcon && (
              <Badge variant="secondary" className={STATUS_META[status].cls}>
                <StatusIcon className="mr-1 h-3 w-3" /> {STATUS_META[status].label}
              </Badge>
            )}
          </div>
          <h3 className="line-clamp-2 font-semibold leading-tight text-foreground group-hover:text-primary">
            {scholarship.title}
          </h3>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-primary/70" /> {scholarship.provider}</div>
        <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary/70" /> {scholarship.country}</div>
        <div className="flex items-center gap-2"><Wallet className="h-4 w-4 text-primary/70" /> {scholarship.degreeLevel}</div>
        <div className="mt-auto flex items-center gap-2 pt-2 text-foreground/80">
          <Calendar className="h-4 w-4 text-primary/70" />
          <span>Deadline:</span>
          <span className="font-semibold">{formatDeadline(scholarship.deadline)}</span>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-2 text-xs text-muted-foreground">
        <span>Tap to view details</span>
        <ExternalLink className="h-3 w-3 transition group-hover:translate-x-0.5" />
      </div>
    </motion.button>
  )
}

function formatDeadline(d: string): string {
  // d is YYYY-MM-DD
  const date = new Date(d + 'T00:00:00')
  if (isNaN(date.getTime())) return d
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
