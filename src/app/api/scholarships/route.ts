import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { verifyToken, SESSION_COOKIE } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  const payload = verifyToken(token)

  const url = new URL(req.url)
  const search = url.searchParams.get('search') || ''
  const country = url.searchParams.get('country') || ''
  const degreeLevel = url.searchParams.get('degreeLevel') || ''
  const fundingType = url.searchParams.get('fundingType') || ''
  const status = url.searchParams.get('status') || ''

  const where: any = {}
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { provider: { contains: search } },
      { description: { contains: search } },
    ]
  }
  if (country) where.country = country
  if (degreeLevel) where.degreeLevel = { contains: degreeLevel }
  if (fundingType) where.fundingType = fundingType

  const scholarships = await db.scholarship.findMany({
    where,
    orderBy: { deadline: 'asc' },
  })

  let userStatuses: Record<string, string> = {}
  if (payload) {
    const rows = await db.userScholarshipStatus.findMany({
      where: { userId: payload.userId },
    })
    userStatuses = Object.fromEntries(rows.map((r) => [r.scholarshipId, r.status]))
  }

  const result = scholarships.map((s) => ({
    ...s,
    userStatus: userStatuses[s.id] || null,
  }))

  // Optional: filter by user tracking status
  const filtered = status ? result.filter((s) => s.userStatus === status) : result

  return NextResponse.json({ scholarships: filtered })
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  const payload = verifyToken(token)
  if (!payload || payload.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Sirf admin scholarship add kar sakta hai.' }, { status: 403 })
  }

  const body = await req.json()
  const required = ['title', 'provider', 'country', 'degreeLevel', 'fundingType', 'deadline', 'applicationUrl']
  for (const f of required) {
    if (!body?.[f] || String(body[f]).trim() === '') {
      return NextResponse.json({ error: `${f} field zaroori hai.` }, { status: 400 })
    }
  }

  const created = await db.scholarship.create({
    data: {
      title: String(body.title).trim(),
      provider: String(body.provider).trim(),
      country: String(body.country).trim(),
      degreeLevel: String(body.degreeLevel).trim(),
      fundingType: String(body.fundingType).trim(),
      deadline: String(body.deadline).trim(),
      applicationUrl: String(body.applicationUrl).trim(),
      description: String(body.description || '').trim(),
      createdById: payload.userId,
    },
  })

  return NextResponse.json({ scholarship: created })
}
