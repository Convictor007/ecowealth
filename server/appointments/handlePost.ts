import { randomUUID } from 'crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { parseAppointmentBody } from './validate'
import {
  getClientIp,
  hasValidBookingHeader,
  isBodyTooLarge,
  isBookingSecurityEnabled,
  hashIp,
} from './security'
import { parseJsonBody } from './body'
import { checkRateLimit, recordRateLimit } from './rateLimit'
import { isEmailConfigured, sendAppointmentEmail } from './mailProvider'

export async function handlePost(req: VercelRequest, res: VercelResponse) {
  if (!hasValidBookingHeader(req)) {
    return res.status(403).json({ success: false, message: 'Invalid request.' })
  }

  if (!isEmailConfigured()) {
    return res.status(503).json({
      success: false,
      message:
        'Email not configured. Set RESEND_API_KEY + RESEND_FROM_EMAIL + CLINIC_EMAIL on Vercel (Production).',
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

  try {
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
  } catch (err) {
    console.error('Appointment send error:', err)
    const errMsg = err instanceof Error ? err.message : 'Unknown error'
    let msg = 'Unable to send your request. Please call the clinic.'
    if (/not configured/i.test(errMsg)) {
      msg = 'Booking email is not configured on the server.'
    } else if (/authentication failed|Resend/i.test(errMsg)) {
      msg = 'Email service misconfigured. Check Resend domain and API key.'
    }
    return res.status(503).json({
      success: false,
      message: msg,
      ...(process.env.VERCEL_ENV !== 'production' && { detail: errMsg }),
    })
  }

  return res.status(200).json({
    success: true,
    message:
      'Thank you! Your appointment request was received. We will contact you soon.',
    emailSent: true,
    referenceId: randomUUID().slice(0, 8),
  })
}
