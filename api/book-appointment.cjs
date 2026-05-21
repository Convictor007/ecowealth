const { loadAppointmentConfig } = require('./lib/appointments/config.cjs')
const { validateAppointment } = require('./lib/appointments/validate.cjs')
const { sendAppointmentEmail } = require('./lib/appointments/mail.cjs')

function applyBookingCors(req, res) {
  const origin = req.headers.origin || ''

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

function parseJsonBody(req) {
  const raw = req.body
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw
  }
  if (typeof raw === 'string' && raw.trim()) {
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  }
  return null
}

function sendJson(res, status, data) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(data))
}

module.exports = async function handler(req, res) {
  applyBookingCors(req, res)

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    return res.end()
  }

  try {
    const config = loadAppointmentConfig()

    if (req.method === 'GET') {
      const smtpConfigured = Boolean(
        config.clinicEmail && config.smtp.user && config.smtp.pass,
      )
      return sendJson(res, 200, {
        success: true,
        message: 'Appointments API is running. Send POST JSON to book.',
        smtpConfigured,
      })
    }

    if (req.method !== 'POST') {
      return sendJson(res, 405, { success: false, message: 'Method not allowed.' })
    }

    const payload = parseJsonBody(req)
    if (!payload) {
      return sendJson(res, 400, { success: false, message: 'Invalid JSON body.' })
    }

    const { data, errors } = validateAppointment(payload)
    if (Object.keys(errors).length > 0) {
      return sendJson(res, 422, {
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
      return sendJson(res, 200, {
        success: true,
        message: 'Request received. Our team will follow up with you shortly.',
        emailSent: false,
      })
    }

    return sendJson(res, 200, {
      success: true,
      message:
        'Thank you! Your appointment request was received. We will contact you soon.',
      emailSent: true,
    })
  } catch (err) {
    console.error('book-appointment handler error:', err)
    return sendJson(res, 500, {
      success: false,
      message: 'Booking server error. Check Vercel function logs.',
    })
  }
}
