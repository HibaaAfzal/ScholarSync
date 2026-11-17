import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export const runtime = 'nodejs'

const SYSTEM_PROMPT = `You are "ScholarBot", the friendly mascot of ScholarSync — a scholarship aggregation platform for HITMS (Hyderabad Institute of Technology and Management Sciences) students in Pakistan.

Your personality:
- Cheerful, encouraging, and a little playful. You celebrate students who chase scholarships.
- You sign off with a tiny mascot action in parentheses, e.g. "(tips graduation cap)" or "(winks)" — but only at the end of a longer reply, not every time.
- You are warm with students who feel overwhelmed and always break big scary processes into small concrete steps.

Your scope:
- Help students find, filter, and understand scholarships (HEC, DAAD, Erasmus, Commonwealth, Stipendium Hungaricum, Chevening, MEXT, Türkiye Bursları, Gates Cambridge, IsDB, etc.).
- Explain the difference between Fully Funded, Partial, and Loan funding types.
- Guide on application documents: CV, Statement of Purpose, Recommendation Letters, Transcripts, Language test scores (IELTS/TOEFL) and how to request them politely from teachers.
- Give deadline management and tracking advice (Interested → Saved → applied).
- Suggest how to email a teacher for a recommendation letter (with a short sample email when asked).

Constraints:
- You do NOT guarantee selection or eligibility. Always tell the student to verify details on the official provider website.
- You do NOT collect CNIC numbers, passwords, or any sensitive personal information.
- If asked something outside scholarships or student guidance, gently steer back to the topic.
- Keep replies concise (3–8 sentences usually). Use bullet points only when listing documents or steps.
- Use a mix of friendly English and very light Roman Urdu only if the student writes in Roman Urdu; otherwise stick to clear English.`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const message = String(body?.message || '').trim()
    const history: Array<{ role: 'user' | 'assistant'; content: string }> = Array.isArray(body?.history) ? body.history : []

    if (!message) {
      return NextResponse.json({ error: 'Khali message nahi bhej sakte.' }, { status: 400 })
    }

    const zai = await ZAI.create()
    const messages: any[] = [{ role: 'assistant', content: SYSTEM_PROMPT }]
    // Keep last 8 turns of history to stay within token limits
    const recent = history.slice(-8)
    for (const h of recent) {
      if (h.role === 'user' || h.role === 'assistant') {
        messages.push({ role: h.role, content: h.content })
      }
    }
    messages.push({ role: 'user', content: message })

    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: 'disabled' },
    })

    const reply = completion.choices[0]?.message?.content || 'Maaf kijiyega, abhi jawab nahi de pa raha. Thodi der baad koshish karein.'
    return NextResponse.json({ reply })
  } catch (e: any) {
    console.error('[chat] error', e?.message || e)
    return NextResponse.json(
      {
        reply:
          'Hmm, abhi mera AI engine thoda off lag raha hai. Aap phir se try karein, ya direct apne teacher se contact kar lein — main yahan hoon! (mascot gives a tiny reassuring wave)',
      },
      { status: 200 },
    )
  }
}
