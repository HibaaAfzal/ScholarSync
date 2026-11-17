'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Globe, GraduationCap, Calendar, Wallet, ExternalLink, CheckCircle2, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import type { Scholarship } from '@/lib/types'

interface AdminDashboardProps {
  onChanged: () => void
}

export function AdminDashboard({ onChanged }: AdminDashboardProps) {
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '', provider: '', country: '', degreeLevel: 'Undergraduate',
    fundingType: 'Fully Funded', deadline: '', applicationUrl: '', description: '',
  })

  useEffect(() => {
    fetchScholarships()
  }, [])

  async function fetchScholarships() {
    setLoading(true)
    const res = await fetch('/api/scholarships')
    const d = await res.json()
    setScholarships(d.scholarships || [])
    setLoading(false)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.provider || !form.country || !form.deadline || !form.applicationUrl) {
      toast.error('Sab starred (*) fields zaroori hain.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/scholarships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d?.error || 'Failed to add')
      toast.success('Scholarship added successfully!')
      setForm({
        title: '', provider: '', country: '', degreeLevel: 'Undergraduate',
        fundingType: 'Fully Funded', deadline: '', applicationUrl: '', description: '',
      })
      await fetchScholarships()
      onChanged()
    } catch (e: any) {
      toast.error(e?.message || 'Add nahi ho saka.')
    } finally {
      setSubmitting(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Yeh scholarship delete kar di jayegi. Continue?')) return
    const res = await fetch(`/api/scholarships/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Deleted.')
      await fetchScholarships()
      onChanged()
    } else {
      toast.error('Delete failed.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-slate-50 p-5 dark:border-emerald-900/40 dark:from-emerald-950/40 dark:to-slate-900">
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add new scholarships, manage existing ones. Students inaam mein turant naya opportunity dekh lenge.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Add form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-primary" /> Add New Scholarship</CardTitle>
            <CardDescription>Sab fields bharein aur save karein.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-3">
              <Field label="Title" required>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. DAAD Master Scholarship" required />
              </Field>
              <Field label="Provider" required>
                <Input value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} placeholder="e.g. DAAD Germany" required />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Country" required>
                  <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="e.g. Germany" required />
                </Field>
                <Field label="Degree Level" required>
                  <Select value={form.degreeLevel} onValueChange={(v) => setForm({ ...form, degreeLevel: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                      <SelectItem value="Master">Master</SelectItem>
                      <SelectItem value="PhD">PhD</SelectItem>
                      <SelectItem value="Bachelor">Bachelor</SelectItem>
                      <SelectItem value="Bachelor / Master / PhD">Bachelor / Master / PhD</SelectItem>
                      <SelectItem value="Master / PhD">Master / PhD</SelectItem>
                      <SelectItem value="PhD / Master">PhD / Master</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Funding Type" required>
                  <Select value={form.fundingType} onValueChange={(v) => setForm({ ...form, fundingType: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fully Funded">Fully Funded</SelectItem>
                      <SelectItem value="Partial">Partial</SelectItem>
                      <SelectItem value="Partial / Loan">Partial / Loan</SelectItem>
                      <SelectItem value="Loan">Loan</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Deadline" required>
                  <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} required />
                </Field>
              </div>
              <Field label="Application URL" required>
                <Input type="url" value={form.applicationUrl} onChange={(e) => setForm({ ...form, applicationUrl: e.target.value })} placeholder="https://" required />
              </Field>
              <Field label="Description">
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Eligibility, coverage, required documents, etc."
                  rows={4}
                />
              </Field>
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> Saving…
                  </span>
                ) : (
                  <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Save Scholarship</span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* List of existing scholarships */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Existing Scholarships ({scholarships.length})</CardTitle>
            <CardDescription>Edit nahi ho sakte abhi — delete kar ke dobara add karein.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-md bg-muted/40" />
                ))}
              </div>
            ) : scholarships.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Abhi koi scholarship nahi hai. Pehla add karein!</p>
            ) : (
              <div className="max-h-[60vh] space-y-2 overflow-y-auto ss-scroll pr-1">
                {scholarships.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.4) }}
                    className="flex items-start gap-3 rounded-lg border border-border bg-card p-3"
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="secondary" className={
                          s.fundingType === 'Fully Funded'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                        }>{s.fundingType}</Badge>
                        <Badge variant="outline">{s.degreeLevel}</Badge>
                      </div>
                      <h4 className="mt-1 font-semibold leading-tight">{s.title}</h4>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {s.country}</span>
                        <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" /> {s.provider}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {s.deadline}</span>
                        <span className="flex items-center gap-1"><Wallet className="h-3 w-3" /> {s.fundingType}</span>
                      </div>
                      <a
                        href={s.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        Open official site <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => remove(s.id)}
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  )
}
