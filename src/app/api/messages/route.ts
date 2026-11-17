import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { verifyToken, SESSION_COOKIE } from '@/lib/auth'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  const payload = verifyToken(token)
  if (!payload) {
    return NextResponse.json({ messages: [] })
  }
  const messages = await db.message.findMany({
    where: {
      OR: [{ fromUserId: payload.userId }, { toUserId: payload.userId }],
    },
    orderBy: { createdAt: 'desc' },
    include: {
      fromUser: { select: { id: true, name: true, email: true, role: true } },
      toUser: { select: { id: true, name: true, email: true, role: true, subject: true } },
    },
  })
  return NextResponse.json({ messages })
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  const payload = verifyToken(token)
  if (!payload) {
    return NextResponse.json({ error: 'Login required.' }, { status: 401 })
  }

  const body = await req.json()
  const toUserId = String(body?.toUserId || '')
  const subject = String(body?.subject || '').trim()
  const content = String(body?.content || '').trim()
  const messageType = String(body?.messageType || 'QUERY').toUpperCase()

  if (!toUserId || !subject || !content) {
    return NextResponse.json({ error: 'Recipient, subject aur content sab zaroori hain.' }, { status: 400 })
  }

  // Only students can send messages to teachers
  const sender = await db.user.findUnique({ where: { id: payload.userId } })
  if (!sender || sender.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Sirf students message bhej sakte hain.' }, { status: 403 })
  }

  const recipient = await db.user.findUnique({ where: { id: toUserId } })
  if (!recipient || recipient.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Message sirf teacher ko bheja ja sakta hai.' }, { status: 400 })
  }

  const created = await db.message.create({
    data: {
      fromUserId: payload.userId,
      toUserId,
      subject,
      content,
      messageType,
      status: 'SENT',
    },
  })

  return NextResponse.json({ message: created })
}
