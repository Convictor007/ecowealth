import { createHmac, timingSafeEqual } from 'crypto'
import type { VercelRequest } from '@vercel/node'

const MAX_BODY_BYTES = 8_192
const DEFAULT_RATE_LIMIT = 5
const RATE_WINDOW_MS = 60 * 60 * 1000

/** Set BOOKING_SECURITY_ENABLED=true on Vercel to re-enable origin, header, and rate limits. */
export function isBookingSecurityEnabled(): boolean {
  return process.env.BOOKING_SECURITY_ENABLED === 'true'
}

export function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return String(forwarded[0]).split(',')[0]?.trim() || 'unknown'
  }
  return req.socket?.remoteAddress ?? 'unknown'
}

export function hashIp(ip: string): string {
  const salt = process.env.RATE_LIMIT_SALT
  if (!isBookingSecurityEnabled()) {
    return createHmac('sha256', 'booking-no-security').update(ip).digest('hex')
  }

  if (!salt || salt.length < 16) {
    const isProd =
      process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production'
    if (isProd) {
      throw new Error('RATE_LIMIT_SALT must be set (min 16 chars) in production')
    }
    return createHmac('sha256', 'dev-rate-limit-salt').update(ip).digest('hex')
  }
  return createHmac('sha256', salt).update(ip).digest('hex')
}

export function isOriginAllowed(req: VercelRequest): boolean {
  if (!isBookingSecurityEnabled()) return true

  const origin = req.headers.origin
  if (!origin || typeof origin !== 'string') {
    return req.method === 'GET'
  }

  const allowed = (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  if (allowed.includes(origin)) return true
  if (/^https:\/\/[\w.-]+\.vercel\.app$/.test(origin)) return true
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true

  return false
}

export function hasValidBookingHeader(req: VercelRequest): boolean {
  if (!isBookingSecurityEnabled()) return true
  const header = req.headers['x-ecowealth-booking']
  return header === '1'
}

export function isBodyTooLarge(req: VercelRequest): boolean {
  const raw = req.body
  if (typeof raw === 'string') return Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES
  if (raw && typeof raw === 'object') {
    return Buffer.byteLength(JSON.stringify(raw), 'utf8') > MAX_BODY_BYTES
  }
  return false
}

export function getRateLimitPerHour(): number {
  const n = Number(process.env.APPOINTMENT_RATE_LIMIT_PER_HOUR ?? DEFAULT_RATE_LIMIT)
  return Number.isFinite(n) && n > 0 ? Math.min(n, 20) : DEFAULT_RATE_LIMIT
}

export function getRateWindowMs(): number {
  return RATE_WINDOW_MS
}

export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}
