import type { VercelRequest } from '@vercel/node'

/** Parse JSON body from Vercel (object, string, or Buffer). */
export function parseJsonBody(req: VercelRequest): unknown {
  const raw = req.body

  if (raw === undefined || raw === null) {
    return null
  }

  if (typeof raw === 'object' && !Buffer.isBuffer(raw) && !Array.isArray(raw)) {
    return raw
  }

  if (Buffer.isBuffer(raw)) {
    const text = raw.toString('utf8').trim()
    if (!text) return null
    try {
      return JSON.parse(text) as unknown
    } catch {
      return null
    }
  }

  if (typeof raw === 'string') {
    const text = raw.trim()
    if (!text) return null
    try {
      return JSON.parse(text) as unknown
    } catch {
      return null
    }
  }

  return null
}
