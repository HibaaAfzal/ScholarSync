import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { verifyToken, SESSION_COOKIE } from '@/lib/auth'

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  const payload = verifyToken(token)
  if (!payload) {
    return NextResponse.json({ error: 'Login required.' }, { status: 401 })
  }

  const { id } = await ctx.params
  const body = await req.json()
  const status = String(body?.status || '').toUpperCase()
  const allowed = ['INTERESTED', 'SAVED', 'APPLIED']
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 })
  }

  const existing = await db.userScholarshipStatus.findUnique({
    where: {
      userId_scholarshipId: { userId: payload.userId, scholarshipId: id },
    },
  })

  if (existing) {
    const updated = await db.userScholarshipStatus.update({
      where: { id: existing.id },
      data: { status },
    })
    return NextResponse.json({ status: updated.status })
  } else {
    const created = await db.userScholarshipStatus.create({
      data: { userId: payload.userId, scholarshipId: id, status },
    })
    return NextResponse.json({ status: created.status })
  }
}
