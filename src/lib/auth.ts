import { createHmac } from 'crypto'

const SECRET = process.env.AUTH_SECRET || 'scholarsync-dev-secret-change-in-production'

export interface SessionPayload {
  userId: string
  role: string
  email: string
}

export function signToken(payload: SessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = createHmac('sha256', SECRET).update(data).digest('base64url')
  return `${data}.${sig}`
}

export function verifyToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [data, sig] = parts
  const expected = createHmac('sha256', SECRET).update(data).digest('base64url')
  if (sig !== expected) return null
  try {
    const json = Buffer.from(data, 'base64url').toString('utf8')
    return JSON.parse(json) as SessionPayload
  } catch {
    return null
  }
}

export const SESSION_COOKIE = 'ss_session'
