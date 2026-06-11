import type { VercelRequest, VercelResponse } from '@vercel/node'
import { isDatabaseConfigured, listAppointmentServices } from '../lib/appointments/db.js'
import { APPOINTMENT_SERVICES } from '../lib/appointments/services.js'

export const config = {
  maxDuration: 60,
}

function applyApiHeaders(res: VercelResponse) {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Cache-Control', 'no-store')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    applyApiHeaders(res)

    if (req.method === 'OPTIONS') {
      return res.status(204).end()
    }

    if (req.method === 'GET') {
      const securityEnabled = process.env.BOOKING_SECURITY_ENABLED === 'true'
      const dbConfigured = isDatabaseConfigured()
      const services = dbConfigured ? listAppointmentServices() : [...APPOINTMENT_SERVICES]
      return res.status(200).json({
        success: true,
        message: 'Appointments API is running. Send POST JSON to book.',
        storage: dbConfigured ? 'database' : 'unconfigured',
        databaseConfigured: dbConfigured,
        securityEnabled,
        services,
      })
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ success: false, message: 'Method not allowed.' })
    }

    const { handlePost } = await import('../lib/appointments/handlePost.js')
    return await handlePost(req, res)
  } catch (err) {
    console.error('Appointment API error:', err)
    const errMsg = err instanceof Error ? err.message : String(err)
    if (!res.headersSent) {
      applyApiHeaders(res)
    }
    return res.status(500).json({
      success: false,
      message: 'Booking API error. Check server logs.',
      detail: errMsg,
    })
  }
}
