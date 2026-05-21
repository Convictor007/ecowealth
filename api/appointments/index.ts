import { randomUUID } from 'crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { APPOINTMENT_SERVICES } from '../../server/appointments/services'
import { parseAppointmentBody } from '../../server/appointments/validate'
import {
  getClientIp,
  hasValidBookingHeader,
  isBodyTooLarge,
  isOriginAllowed,
  hashIp,
} from '../../server/appointments/security'
import { parseJsonBody } from '../../server/appointments/body'
import { checkRateLimit, recordRateLimit } from '../../server/appointments/rateLimit'
import { isEmailConfigured, sendAppointmentEmail } from '../../server/appointments/notify'

function cors(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin
  if (origin && typeof origin === 'string') {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*')
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, X-EcoWealth-Booking')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Cache-Control', 'no-store')
}

async function handler(req: VercelRequest, res: VercelResponse) {
  cors(req, res)

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (!isOriginAllowed(req)) {
    return res.status(403).json({ success: false, message: 'Origin not allowed.' })
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      message: 'Appointments API is running. Send POST JSON to book.',
      provider: 'gmail-smtp',
      emailConfigured: isEmailConfigured(),
      services: APPOINTMENT_SERVICES,
    })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' })
  }

  if (!hasValidBookingHeader(req)) {
    return res.status(403).json({ success: false, message: 'Invalid request.' })
  }

  if (!isEmailConfigured()) {
    return res.status(503).json({
      success: false,
      message:
        'Email not configured. Set CLINIC_EMAIL, MAIL_SMTP_USER, and MAIL_SMTP_PASS (Gmail App Password) on Vercel.',
    })
  }

  if (isBodyTooLarge(req)) {
    return res.status(413).json({ success: false, message: 'Request too large.' })
  }

  const payload = parseJsonBody(req)
  if (!payload) {
    return res.status(400).json({ success: false, message: 'Invalid JSON body.' })
  }

  const { data, errors } = parseAppointmentBody(payload)
  if (errors) {
    return res.status(422).json({
      success: false,
      message: 'Please correct the errors below.',
      errors,
    })
  }

  if (!data) {
    return res.status(400).json({ success: false, message: 'Invalid request.' })
  }

  if (data.website) {
    return res.status(200).json({
      success: true,
      message: 'Thank you! Your appointment request was received.',
    })
  }

  try {
    const ipHash = hashIp(getClientIp(req))

    if (!checkRateLimit(ipHash)) {
      return res.status(429).json({
        success: false,
        message: 'Too many booking attempts. Please try again later or call the clinic.',
      })
    }

    await sendAppointmentEmail(data)
    recordRateLimit(ipHash)

    return res.status(200).json({
      success: true,
      message:
        'Thank you! Your appointment request was received. We will contact you soon.',
      emailSent: true,
      referenceId: randomUUID().slice(0, 8),
    })
  } catch (err) {
    console.error('Appointment API error:', err)
    const errMsg = err instanceof Error ? err.message : ''
    const authFailed = /authentication failed/i.test(errMsg)
    const msg = authFailed
      ? 'Email service misconfigured. Please call the clinic.'
      : 'Unable to send your request. Please call the clinic.'
    return res.status(503).json({ success: false, message: msg })
  }
}

handler.config = {
  maxDuration: 60,
}

export default handler
