import type { VercelRequest, VercelResponse } from '@vercel/node'
import { APPOINTMENT_SERVICES } from '../lib/appointments/services'

export const config = {
  maxDuration: 60,
}

function applyApiHeaders(res: VercelResponse) {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Cache-Control', 'no-store')
}

function emailStatus(): { provider: string; emailConfigured: boolean } {
  const clinic = process.env.CLINIC_EMAIL?.trim()
  const resendKey = process.env.RESEND_API_KEY?.trim()
  const resendFrom = process.env.RESEND_FROM_EMAIL?.trim()
  if (clinic && resendKey && resendFrom) {
    return { provider: 'resend', emailConfigured: true }
  }
  const smtpUser = process.env.MAIL_SMTP_USER?.trim()
  const smtpPass = process.env.MAIL_SMTP_PASS?.replace(/\s+/g, '')
  if (clinic && smtpUser && smtpPass) {
    return { provider: 'smtp', emailConfigured: true }
  }
  return { provider: 'none', emailConfigured: false }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    applyApiHeaders(res)

    if (req.method === 'OPTIONS') {
      return res.status(204).end()
    }

    if (req.method === 'GET') {
      const { provider, emailConfigured } = emailStatus()
      const securityEnabled = process.env.BOOKING_SECURITY_ENABLED === 'true'
      return res.status(200).json({
        success: true,
        message: 'Appointments API is running. Send POST JSON to book.',
        provider,
        emailConfigured,
        securityEnabled,
        services: APPOINTMENT_SERVICES,
      })
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, message: 'Method not allowed.' })
    }

    const { handlePost } = await import('../lib/appointments/handlePost')
    return await handlePost(req, res)
  } catch (err) {
    console.error('Appointment API error:', err)
    const errMsg = err instanceof Error ? err.message : String(err)
    if (!res.headersSent) {
      applyApiHeaders(res)
    }
    return res.status(500).json({
      success: false,
      message: 'Booking API error. Check Vercel function logs.',
      detail: errMsg,
    })
  }
}
