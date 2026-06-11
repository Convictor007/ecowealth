import type { VercelRequest, VercelResponse } from '@vercel/node'
import { parseAppointmentBody } from './validate.js'
import {
  getClientIp,
  hasValidBookingHeader,
  isBodyTooLarge,
  isBookingSecurityEnabled,
  hashIp,
} from './security.js'
import { parseJsonBody } from './body.js'
import { checkRateLimit, recordRateLimit } from './rateLimit.js'
import { createAppointment, isDatabaseConfigured, serviceExists } from './db.js'

export async function handlePost(req: VercelRequest, res: VercelResponse) {
  if (!hasValidBookingHeader(req)) {
    return res.status(403).json({ success: false, message: 'Invalid request.' })
  }

  if (!isDatabaseConfigured()) {
    return res.status(503).json({
      success: false,
      message:
        'Database not configured. Set DB_HOST, DB_NAME, DB_USER, and DB_PASS in .env (run database/schema.sql).',
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
    }

    const exists = serviceExists(data.service)
    if (!exists) {
      return res.status(422).json({
        success: false,
        message: 'Please correct the errors below.',
        errors: { service: 'Please select a service.' },
      })
    }

    const referenceId = await createAppointment({
      fullName: data.fullName,
      phone: data.phone,
      service: data.service,
      preferredDate: data.preferredDate,
      preferredTime: data.preferredTime,
      notes: data.notes,
    })

    if (isBookingSecurityEnabled()) {
      const ipHash = hashIp(getClientIp(req))
      recordRateLimit(ipHash)
    }

    return res.status(200).json({
      success: true,
      message:
        'Thank you! Your appointment request was saved. We will contact you by phone soon.',
      savedToDatabase: true,
      referenceId,
    })
  } catch (err) {
    console.error('Appointment save error:', err)
    const errMsg = err instanceof Error ? err.message : 'Unknown error'
    return res.status(503).json({
      success: false,
      message: 'Unable to save your request. Please call the clinic.',
      ...(process.env.VERCEL_ENV !== 'production' && { detail: errMsg }),
    })
  }
}
