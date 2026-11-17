import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { signToken, SESSION_COOKIE } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = String(body?.email || '').trim().toLowerCase()
    const password = String(body?.password || '')

    if (!email || !password) {
      return NextResponse.json({ error: 'Email aur password dono chahiye.' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { email } })
    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Email ya password ghalat hai.' }, { status: 401 })
    }

    const token = signToken({ userId: user.id, role: user.role, email: user.email })
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

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
  } catch (e) {
    return NextResponse.json({ error: 'Login nahi ho saka.' }, { status: 500 })
  }
}
