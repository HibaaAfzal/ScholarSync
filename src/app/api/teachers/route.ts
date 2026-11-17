import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const teachers = await db.user.findMany({
    where: { role: 'TEACHER' },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      subject: true,
      phone: true,
      officeHours: true,
      bio: true,
      avatarUrl: true,
    },
  })
  return NextResponse.json({ teachers })
}
