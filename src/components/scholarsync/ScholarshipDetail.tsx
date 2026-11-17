'use client'

import { useState } from 'react'
import {
  GraduationCap, Globe, Wallet, Calendar, ExternalLink, Bookmark, CheckCircle2, Heart, Building2, FileText, AlertCircle, Send,
} from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import type { Scholarship, TrackingStatus } from '@/lib/types'

interface ScholarshipDetailProps {
  scholarship: Scholarship | null
  onClose: () => void
  onStatusChange?: (id: string, status: TrackingStatus) => void
}

const STATUS_BUTTONS: { value: TrackingStatus; label: string; icon: typeof Bookmark; cls: string }[] = [
  { value: 'INTERESTED', label: 'Interested', icon: Heart, cls: 'data-[active=true]:bg-rose-100 data-[active=true]:text-rose-700 data-[active=true]:border-rose-300 dark:data-[active=true]:bg-rose-900/40 dark:data-[active=true]:text-rose-200 dark:data-[active=true]:border-rose-800' },
  { value: 'SAVED', label: 'Saved', icon: Bookmark, cls: 'data-[active=true]:bg-amber-100 data-[active=true]:text-amber-700 data-[active=true]:border-amber-300 dark:data-[active=true]:bg-amber-900/40 dark:data-[active=true]:text-amber-200 dark:data-[active=true]:border-amber-800' },
  { value: 'APPLIED', label: 'Applied', icon: CheckCircle2, cls: 'data-[active=true]:bg-emerald-100 data-[active=true]:text-emerald-700 data-[active=true]:border-emerald-300 dark:data-[active=true]:bg-emerald-900/40 dark:data-[active=true]:text-emerald-200 dark:data-[active=true]:border-emerald-800' },
]

export function ScholarshipDetail({ scholarship, onClose, onStatusChange }: ScholarshipDetailProps) {
  const [currentStatus, setCurrentStatus] = useState<TrackingStatus | null>(scholarship?.userStatus || null)
  const [saving, setSaving] = useState(false)

  // Sync when scholarship changes
  const initialStatus = scholarship?.userStatus || null
  if (scholarship && currentStatus !== initialStatus && !saving) {
    // Keep in sync on open; allow local updates after
    // (Only reset when scholarship id changes)
  }

  async function updateStatus(status: TrackingStatus) {
    if (!scholarship) return
    setSaving(true)
    const prev = currentStatus
    setCurrentStatus(status)
    try {
      const res = await fetch(`/api/scholarships/${scholarship.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => null)
        throw new Error(d?.error || 'Update failed')
      }
      toast.success(`Marked as ${status.toLowerCase()}.`)
      onStatusChange?.(scholarship.id, status)
    } catch (e: any) {
      setCurrentStatus(prev)
      toast.error(e?.message || 'Could not update status.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={!!scholarship} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-2xl">
        {scholarship && (
          <>
            <DialogHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className={
                  scholarship.fundingType === 'Fully Funded'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
                    : scholarship.fundingType.includes('Loan')
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                }>
                  {scholarship.fundingType}
                </Badge>
                <Badge variant="outline">{scholarship.degreeLevel}</Badge>
                <Badge variant="outline" className="gap-1"><Globe className="h-3 w-3" /> {scholarship.country}</Badge>
              </div>
              <DialogTitle className="text-2xl">{scholarship.title}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4" /> {scholarship.provider}
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[55vh] space-y-4 overflow-y-auto ss-scroll pr-1">
              {/* Key facts grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <FactBox label="Provider" value={scholarship.provider} icon={Building2} />
                <FactBox label="Country" value={scholarship.country} icon={Globe} />
                <FactBox label="Degree" value={scholarship.degreeLevel} icon={GraduationCap} />
                <FactBox label="Funding" value={scholarship.fundingType} icon={Wallet} />
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/30">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-semibold">Application Deadline</span>
                </div>
                <div className="mt-1 text-lg font-bold text-amber-900 dark:text-amber-100">
                  {formatDeadline(scholarship.deadline)}
                </div>
              </div>

              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <FileText className="h-4 w-4 text-primary" /> Description
                </h4>
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {scholarship.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                <span>
                  Yeh demo data hai. Eligibility aur deadline verify karne ke liye official provider website zaroor visit karein.
                </span>
              </div>

              <Separator />

              <div>
                <h4 className="mb-2 text-sm font-semibold text-foreground">Track this scholarship</h4>
                <p className="mb-3 text-xs text-muted-foreground">
                  Apni progress mark karein — Interested (dekho), Saved (yaad rakho), Applied (apply kar chuke ho).
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {STATUS_BUTTONS.map((b) => {
                    const isActive = currentStatus === b.value
                    const Icon = b.icon
                    return (
                      <Button
                        key={b.value}
                        variant="outline"
                        size="sm"
                        disabled={saving}
                        data-active={isActive}
                        onClick={() => updateStatus(b.value)}
                        className={`${b.cls} h-auto flex-col gap-1 py-3`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-xs font-semibold">{b.label}</span>
                      </Button>
                    )
                  })}
                </div>
              </div>
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
              <Button variant="ghost" onClick={onClose}>Close</Button>
              <Button asChild>
                <a href={scholarship.applicationUrl} target="_blank" rel="noopener noreferrer">
                  <Send className="mr-1 h-4 w-4" /> Apply on official site
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
            </DialogFooter>
          </>
        )}
        {!scholarship && (
          <div className="space-y-3 p-6">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function FactBox({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Globe }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3">
      <div className="mb-1 flex items-center gap-1 text-[11px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="text-sm font-semibold leading-tight text-foreground">{value}</div>
    </div>
  )
}

function formatDeadline(d: string): string {
  const date = new Date(d + 'T00:00:00')
  if (isNaN(date.getTime())) return d
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
}
