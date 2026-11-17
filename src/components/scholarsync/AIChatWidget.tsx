'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, X, Sparkles, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mascot } from './Mascot'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const QUICK_PROMPTS = [
  'Which fully funded scholarships can a Pakistani undergrad apply to?',
  'How do I write a strong Statement of Purpose?',
  'How should I email my teacher for a recommendation letter?',
  'What documents do I usually need for a Master scholarship abroad?',
]

const WELCOME: ChatMessage = {
  role: 'assistant',
  content:
    "Hi! Main ScholarBot hoon — your scholarship buddy. Aap mujhse scholarships, deadlines, documents, ya apne teacher se kaise baat karni hai — kuch bhi pooch sakte hain. Neche se ek quick suggestion bhi try kar sakte hain! (waves graduation cap)",
}

export function AIChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, open])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  async function send(text?: string) {
    const content = (text ?? input).trim()
    if (!content || loading) return
    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content }]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          history: nextMessages
            .filter((m, i) => i > 0) // skip welcome
            .slice(-8)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      const reply = String(data?.reply || 'Hmm, kuch garbar ho gaya. Phir se try karein.')
      setMessages((cur) => [...cur, { role: 'assistant', content: reply }])
    } catch {
      setMessages((cur) => [
        ...cur,
        {
          role: 'assistant',
          content:
            'Network issue lag raha hai. Thodi der baad try karein — main yahan hi hoon. (mascot gives a tiny reassuring wave)',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  function resetChat() {
    setMessages([WELCOME])
    setInput('')
  }

  return (
    <>
      {/* Floating launcher button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="launcher"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-5 right-5 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl ring-4 ring-primary/20 transition hover:scale-105 hover:ring-primary/30 focus:outline-none focus:ring-4 focus:ring-primary/40"
            aria-label="Open ScholarBot chat"
          >
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white ring-2 ring-background">
              AI
            </span>
            <Mascot size={56} variant="wave" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="fixed bottom-5 right-5 z-50 flex h-[32rem] max-h-[80vh] w-[min(22rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-emerald-200/60 bg-card shadow-2xl dark:border-emerald-900/50"
            role="dialog"
            aria-label="ScholarBot chat"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border bg-gradient-to-r from-primary to-emerald-600 p-3 text-primary-foreground">
              <Mascot size={36} variant="idle" />
              <div className="flex-1">
                <div className="flex items-center gap-1 text-sm font-semibold">
                  ScholarBot <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div className="flex items-center gap-1 text-[11px] opacity-90">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-300" /> Online — ready to help
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-primary-foreground hover:bg-white/15"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="ss-scroll flex-1 space-y-3 overflow-y-auto bg-muted/20 p-3"
            >
              {messages.map((m, i) => (
                <MessageBubble key={i} m={m} />
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mascot size={22} variant="thinking" />
                  <span className="flex items-center gap-1">
                    ScholarBot soch raha hai
                    <span className="ml-0.5 inline-flex gap-0.5">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
                    </span>
                  </span>
                </div>
              )}
              {!loading && messages.length <= 1 && (
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Quick suggestions</p>
                  {QUICK_PROMPTS.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="block w-full rounded-md border border-border bg-card px-2 py-1.5 text-left text-xs text-foreground transition hover:border-primary/60 hover:bg-accent"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-border bg-card p-2">
              <div className="flex items-center gap-1.5">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      send()
                    }
                  }}
                  placeholder="Ask ScholarBot anything…"
                  disabled={loading}
                  className="h-9 flex-1"
                />
                <Button
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => send()}
                  disabled={loading || !input.trim()}
                  aria-label="Send"
                >
                  <Send className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 text-muted-foreground"
                  onClick={resetChat}
                  disabled={loading}
                  aria-label="Reset chat"
                  title="Reset chat"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function MessageBubble({ m }: { m: ChatMessage }) {
  const isUser = m.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {!isUser && <Mascot size={26} variant="idle" className="flex-shrink-0" />}
      <div
        className={`ss-pop-in max-w-[80%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'rounded-br-sm bg-primary text-primary-foreground'
            : 'rounded-bl-sm bg-card text-foreground border border-border'
        }`}
      >
        {m.content}
      </div>
    </motion.div>
  )
}
