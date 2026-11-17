'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Inbox, Send, MailOpen, BookOpen, CheckCircle2, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import type { AppMessage, AppUser } from '@/lib/types'

interface MessagesViewProps {
  user: AppUser
  refreshKey?: number
}

export function MessagesView({ user, refreshKey = 0 }: MessagesViewProps) {
  const [state, setState] = useState<{ loading: boolean; messages: AppMessage[] }>({ loading: true, messages: [] })

  useEffect(() => {
    let cancelled = false
    fetch('/api/messages')
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return
        setState({ loading: false, messages: d.messages || [] })
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, messages: [] })
      })
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const messages = state.messages
  const loading = state.loading

  const sent = messages.filter((m) => m.fromUserId === user.id)
  const received = messages.filter((m) => m.toUserId === user.id)

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-slate-50 p-5 dark:border-emerald-900/40 dark:from-emerald-950/40 dark:to-slate-900">
        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {user.role === 'STUDENT'
            ? 'Aap ke bheje gaye messages teachers ko yahan se track karein.'
            : user.role === 'TEACHER'
            ? 'Aap ke students se aaye messages yahan par hain.'
            : 'All messages in the system.'}
        </p>
      </div>

      <Tabs defaultValue={user.role === 'TEACHER' ? 'received' : 'sent'}>
        <TabsList>
          <TabsTrigger value="sent" className="gap-1.5">
            <Send className="h-4 w-4" /> Sent ({sent.length})
          </TabsTrigger>
          <TabsTrigger value="received" className="gap-1.5">
            <Inbox className="h-4 w-4" /> Received ({received.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sent" className="mt-4">
          {loading ? (
            <SkeletonRows />
          ) : sent.length === 0 ? (
            <EmptyState
              icon={Send}
              title="Koi message bheja nahi abhi"
              hint="Teachers page par ja ke kisi teacher ko message bhejein."
            />
          ) : (
            <MessageList items={sent} perspective="sent" />
          )}
        </TabsContent>

        <TabsContent value="received" className="mt-4">
          {loading ? (
            <SkeletonRows />
          ) : received.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="Koi message nahi mila abhi"
              hint={user.role === 'TEACHER' ? 'Jab koi student aapko message bhega tab yahan dikhega.' : 'Yahan aapko milne wale messages aayenge.'}
            />
          ) : (
            <MessageList items={received} perspective="received" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MessageList({ items, perspective }: { items: AppMessage[]; perspective: 'sent' | 'received' }) {
  return (
    <div className="space-y-3">
      {items.map((m, i) => (
        <motion.div
          key={m.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(i * 0.04, 0.4) }}
        >
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex-1">
                  <CardTitle className="text-base leading-tight">{m.subject}</CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-1.5 text-xs">
                    {perspective === 'sent' ? (
                      <><span>To:</span> <span className="font-medium text-foreground">{m.toUser.name}</span>
                        {m.toUser.subject && <Badge variant="outline" className="ml-1 gap-1"><BookOpen className="h-3 w-3" /> {m.toUser.subject}</Badge>}
                      </>
                    ) : (
                      <><span>From:</span> <span className="font-medium text-foreground">{m.fromUser.name}</span>
                        <Badge variant="outline">{m.fromUser.email}</Badge>
                      </>
                    )}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-1 text-xs">
                  <Badge variant="secondary" className={
                    m.messageType === 'RECOMMENDATION_REQUEST'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                  }>
                    {m.messageType === 'RECOMMENDATION_REQUEST' ? 'Recommendation' : 'Query'}
                  </Badge>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" /> {formatDate(m.createdAt)}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line rounded-md bg-muted/40 p-3 text-sm text-foreground/90">{m.content}</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Delivered
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

function EmptyState({ icon: Icon, title, hint }: { icon: typeof Inbox; title: string; hint: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
        <MailOpen className="h-8 w-8 text-muted-foreground" />
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  )
}

function SkeletonRows() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  )
}

function formatDate(s: string): string {
  const d = new Date(s)
  if (isNaN(d.getTime())) return s
  return d.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}
