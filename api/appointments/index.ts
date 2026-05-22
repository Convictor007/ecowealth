import { randomUUID } from 'crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { APPOINTMENT_SERVICES } from '../../server/appointments/services'
import { parseAppointmentBody } from '../../server/appointments/validate'
import {
  getClientIp,
  hasValidBookingHeader,
  isBodyTooLarge,
  isBookingSecurityEnabled,
  hashIp,
} from '../../server/appointments/security'
import { parseJsonBody } from '../../server/appointments/body'
import { checkRateLimit, recordRateLimit } from '../../server/appointments/rateLimit'
import {
  isEmailConfigured,
  resolveMailProvider,
  sendAppointmentEmail,
} from '../../server/appointments/mailProvider'

function applyApiHeaders(res: VercelResponse) {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Cache-Control', 'no-store')
}

async function handleRequest(req: VercelRequest, res: VercelResponse) {
  applyApiHeaders(res)

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      message: 'Appointments API is running. Send POST JSON to book.',
      provider: resolveMailProvider(),
      emailConfigured: isEmailConfigured(),
      securityEnabled: isBookingSecurityEnabled(),
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
        'Email not configured. Set RESEND_API_KEY + RESEND_FROM_EMAIL + CLINIC_EMAIL (recommended), or Gmail SMTP vars.',
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

  if (isBookingSecurityEnabled() && data.website) {
    return res.status(200).json({
      success: true,
      message: 'Thank you! Your appointment request was received.',
    })
  }

  if (isBookingSecurityEnabled()) {
    const ipHash = hashIp(getClientIp(req))
    if (!checkRateLimit(ipHash)) {
      return res.status(429).json({
        success: false,
        message: 'Too many booking attempts. Please try again later or call the clinic.',
      })
    }
    await sendAppointmentEmail(data)
    recordRateLimit(ipHash)
  } else {
    await sendAppointmentEmail(data)
  }

  return res.status(200).json({
    success: true,
    message:
      'Thank you! Your appointment request was received. We will contact you soon.',
    emailSent: true,
    referenceId: randomUUID().slice(0, 8),
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    return await handleRequest(req, res)
  } catch (err) {
    console.error('Appointment API error:', err)
    const errMsg = err instanceof Error ? err.message : 'Unknown error'
    const authFailed = /authentication failed/i.test(errMsg)
    const notConfigured = /not configured/i.test(errMsg)
    const templateMissing = /template not found/i.test(errMsg)

    let msg = 'Unable to send your request. Please call the clinic.'
    if (notConfigured) {
      msg = 'Booking email is not configured on the server. Please call the clinic.'
    } else if (authFailed) {
      msg = 'Email service misconfigured. Please call the clinic.'
    } else if (templateMissing) {
      msg = 'Booking email template error. Please call the clinic.'
    }

    if (!res.headersSent) {
      applyApiHeaders(res)
    }

    return res.status(503).json({
      success: false,
      message: msg,
      ...(process.env.VERCEL_ENV !== 'production' && { detail: errMsg }),
    })
  }
}

export const config = {
  maxDuration: 60,
}
