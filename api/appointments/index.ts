import type { VercelRequest, VercelResponse } from '@vercel/node'
import { loadAppointmentConfig } from '../../server/appointments/config'
import { validateAppointment } from '../../server/appointments/validate'
import { sendAppointmentEmail } from '../../server/appointments/mail'

function applyCors(req: VercelRequest, res: VercelResponse, allowedOrigins: string[]): void {
  const origin = req.headers.origin ?? ''
  const vercelPreview = /^https:\/\/[\w-]+\.vercel\.app$/.test(origin)

  if (
    origin &&
    (allowedOrigins.includes(origin) ||
      vercelPreview ||
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))
  ) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const config = loadAppointmentConfig()
  applyCors(req, res, config.allowedOrigins)

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      message: 'Appointments API is running. Send POST JSON to book.',
    })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' })
  }

  const payload = req.body
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return res.status(400).json({ success: false, message: 'Invalid JSON body.' })
  }

  const { data, errors } = validateAppointment(payload as Record<string, unknown>)
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
  } catch {
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
}
