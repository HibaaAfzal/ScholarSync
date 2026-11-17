'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, Clock, MessageSquare, PenLine, Send, BookOpen, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import type { Teacher } from '@/lib/types'

interface TeachersViewProps {
  onMessageSent?: () => void
}

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function TeachersView({ onMessageSent }: TeachersViewProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState<Teacher | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetch('/api/teachers')
      .then((r) => r.json())
      .then((d) => {
        setTeachers(d.teachers || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function openMessage(t: Teacher) {
    setActive(t)
    setOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-slate-50 p-5 dark:border-emerald-900/40 dark:from-emerald-950/40 dark:to-slate-900">
        <h1 className="text-2xl font-bold tracking-tight">Faculty &amp; Teachers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Apne teachers se directly contact karein — advice, recommendation letter ya koi bhi query. In-app message bhejein aur woh "Messages" tab mein dikhega.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl border border-border bg-muted/40" />
          ))}
        </div>
      ) : teachers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Abhi koi teacher available nahi hai.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.4) }}
            >
              <Card className="h-full transition hover:border-primary/60 hover:shadow-md">
                <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                  <Avatar className="h-12 w-12 border border-primary/30">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">{initials(t.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-base leading-tight">{t.name}</CardTitle>
                    {t.subject && (
                      <CardDescription className="mt-0.5 flex items-center gap-1">
                        <BookOpen className="h-3 w-3" /> {t.subject}
                      </CardDescription>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {t.bio && (
                    <p className="line-clamp-3 text-xs text-muted-foreground">{t.bio}</p>
                  )}
                  <div className="space-y-1 text-xs">
                    <a href={`mailto:${t.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                      <Mail className="h-3 w-3" /> {t.email}
                    </a>
                    {t.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3 w-3" /> {t.phone}
                      </div>
                    )}
                    {t.officeHours && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-3 w-3" /> {t.officeHours}
                      </div>
                    )}
                  </div>
                  <Button variant="default" size="sm" className="mt-2 w-full" onClick={() => openMessage(t)}>
                    <MessageSquare className="mr-1 h-4 w-4" /> Message
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <MessageDialog
        teacher={active}
        open={open}
        onOpenChange={(o) => {
          setOpen(o)
          if (!o) setActive(null)
        }}
        onSent={() => {
          onMessageSent?.()
        }}
      />
    </div>
  )
}

interface MessageDialogProps {
  teacher: Teacher | null
  open: boolean
  onOpenChange: (o: boolean) => void
  onSent?: () => void
}

function MessageDialog({ teacher, open, onOpenChange, onSent }: MessageDialogProps) {
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [messageType, setMessageType] = useState<'QUERY' | 'RECOMMENDATION_REQUEST'>('QUERY')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (open && teacher) {
      setSubject('')
      setContent('')
      setMessageType('QUERY')
    }
  }, [open, teacher])

  async function send(e: React.FormEvent) {
    e.preventDefault()
    if (!teacher) return
    if (!subject || !content) {
      toast.error('Subject aur message dono zaroori hain.')
      return
    }
    setSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toUserId: teacher.id, subject, content, messageType }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d?.error || 'Send failed')
      toast.success(`Message sent to ${teacher.name}.`)
      onSent?.()
      onOpenChange(false)
    } catch (e: any) {
      toast.error(e?.message || 'Message bheja nahi ja saka.')
    } finally {
      setSending(false)
    }
  }

  function applyTemplate(type: 'QUERY' | 'RECOMMENDATION_REQUEST') {
    if (!teacher) return
    if (type === 'RECOMMENDATION_REQUEST') {
      setSubject('Request for Recommendation Letter')
      setContent(
        `Respected ${teacher.name},\n\nI hope this message finds you well. I am applying for a scholarship and would be honoured if you could provide a recommendation letter based on my academic performance and conduct in your class.\n\nI can share my CV, transcripts, and details of the scholarship at your convenience. I would be grateful for your time and support.\n\nSincerely,\n[Your name]\n[Your roll number]`,
      )
    } else {
      setSubject('Advice regarding scholarship application')
      setContent(
        `Respected ${teacher.name},\n\nI would like to seek your guidance regarding my scholarship plans. Kindly let me know a suitable time when I can meet you during your office hours.\n\nThank you.`,
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" /> Message to {teacher?.name}
          </DialogTitle>
          <DialogDescription>
            {teacher?.subject ? `${teacher.subject} • ` : ''}Reply aapko email par bhi mil jayegi ideally.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={send} className="space-y-3">
          <div>
            <Label className="text-xs font-medium">Message type</Label>
            <Select value={messageType} onValueChange={(v) => {
              const t = v as 'QUERY' | 'RECOMMENDATION_REQUEST'
              setMessageType(t)
              applyTemplate(t)
            }}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="QUERY">General Query / Advice</SelectItem>
                <SelectItem value="RECOMMENDATION_REQUEST">Recommendation Letter Request</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-medium" htmlFor="msg-subject">Subject</Label>
            <Input id="msg-subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1" placeholder="Subject of your message" required />
          </div>
          <div>
            <Label className="text-xs font-medium" htmlFor="msg-content">Message</Label>
            <Textarea id="msg-content" value={content} onChange={(e) => setContent(e.target.value)} rows={8} className="mt-1" placeholder="Write your message…" required />
          </div>
          <div className="flex items-center gap-2 rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            <PenLine className="h-3 w-3" />
            Template auto-fill ho gaya — aap ise edit bhi kar sakte hain.
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              <X className="mr-1 h-4 w-4" /> Cancel
            </Button>
            <Button type="submit" disabled={sending}>
              {sending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> Sending…
                </span>
              ) : (
                <span className="flex items-center gap-2"><Send className="h-4 w-4" /> Send Message</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
