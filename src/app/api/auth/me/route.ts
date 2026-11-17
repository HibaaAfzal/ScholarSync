import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { verifyToken, SESSION_COOKIE } from '@/lib/auth'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  const payload = verifyToken(token)
  if (!payload) {
    return NextResponse.json({ user: null })
  }
  const user = await db.user.findUnique({ where: { id: payload.userId } })
  if (!user) {
    return NextResponse.json({ user: null })
  }
  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      subject: user.subject,
      phone: user.phone,
      officeHours: user.officeHours,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
    },
  })
}
