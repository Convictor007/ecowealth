import type { VercelRequest, VercelResponse } from '@vercel/node'
import { applyBookingCors } from './lib/cors'
import { loadAppointmentConfig } from './lib/appointments/config'
import { validateAppointment } from './lib/appointments/validate'
import { sendAppointmentEmail } from './lib/appointments/mail'

function parseJsonBody(req: VercelRequest): Record<string, unknown> | null {
  const raw = req.body
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>
  }
  if (typeof raw === 'string' && raw.trim()) {
    try {
      return JSON.parse(raw) as Record<string, unknown>
    } catch {
      return null
    }
  }
  return null
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyBookingCors(req, res)

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  try {
    const config = loadAppointmentConfig()

    if (req.method === 'GET') {
      const smtpConfigured = Boolean(
        config.clinicEmail && config.smtp.user && config.smtp.pass,
      )
      return res.status(200).json({
        success: true,
        message: 'Appointments API is running. Send POST JSON to book.',
        smtpConfigured,
      })
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, message: 'Method not allowed.' })
    }

    const payload = parseJsonBody(req)
    if (!payload) {
      return res.status(400).json({ success: false, message: 'Invalid JSON body.' })
    }

    const { data, errors } = validateAppointment(payload)
    if (Object.keys(errors).length > 0) {
      return res.status(422).json({
        success: false,
        message: 'Please correct the errors below.',
        errors,
      })
    }

    let emailSent = false
    try {
      emailSent = await sendAppointmentEmail(data, config)
    } catch (err) {
      console.error('Appointment email failed:', err)
      emailSent = false
    }

    if (!emailSent) {
      return res.status(200).json({
        success: true,
        message: 'Request received. Our team will follow up with you shortly.',
        emailSent: false,
      })
    }

    return res.status(200).json({
      success: true,
      message:
        'Thank you! Your appointment request was received. We will contact you soon.',
      emailSent: true,
    })
  } catch (err) {
    console.error('book-appointment handler error:', err)
    return res.status(500).json({
      success: false,
      message: 'Booking server error. Check Vercel function logs.',
    })
  }
}
