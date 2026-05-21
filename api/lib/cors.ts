import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Permissive CORS for the public booking endpoint.
 * Same-origin requests (Vercel site → /api/book-appointment) rarely need this,
 * but preview URLs and custom domains must not be blocked.
 */
export function applyBookingCors(req: VercelRequest, res: VercelResponse): void {
  const origin = req.headers.origin ?? ''

  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*')
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept')
  res.setHeader('Access-Control-Max-Age', '86400')
}
