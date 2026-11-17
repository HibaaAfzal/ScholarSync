import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const scholarship = await db.scholarship.findUnique({ where: { id } })
  if (!scholarship) {
    return NextResponse.json({ error: 'Scholarship nahi mili.' }, { status: 404 })
  }
  return NextResponse.json({ scholarship })
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  try {
    await db.scholarship.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Delete nahi ho saka.' }, { status: 500 })
  }
}
