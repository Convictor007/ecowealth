/** Vercel serverless booking API — single file, CommonJS (no ESM / split bundles). */

const SERVICE_LABELS = {
  'free-checkup': 'Free check-up / consultation',
  'colon-hydrotherapy': 'Colon hydrotherapy',
  'wellness-massage': 'Therapeutic massage & wellness',
  iridology: 'Iridology',
  herbology: 'Herbology',
  'herbal-coffee': 'Herbal coffee',
  supplements: 'Food supplements',
  'general-consultation': 'General wellness consultation',
  'products-inquiry': 'Products inquiry (in-clinic)',
}

function serviceLabel(id) {
  return SERVICE_LABELS[id] || id
}

function listEnv(key, fallback) {
  const raw = process.env[key]
  if (!raw || !String(raw).trim()) return fallback
  return String(raw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function loadConfig() {
  const smtpUser = process.env.MAIL_SMTP_USER || ''
  const smtpPass = process.env.MAIL_SMTP_PASS || ''
  const fromEmail = process.env.MAIL_FROM_EMAIL || smtpUser
  const encryption = (process.env.MAIL_SMTP_ENCRYPTION || 'tls').toLowerCase()

  return {
    clinicName: process.env.CLINIC_NAME || 'Eco Wealth Wellnessolution',
    clinicEmail: process.env.CLINIC_EMAIL || '',
    mailFromName: process.env.MAIL_FROM_NAME || 'Eco Wealth Appointments',
    smtp: {
      host: process.env.MAIL_SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.MAIL_SMTP_PORT || '587'),
      secure: encryption === 'ssl',
      user: smtpUser,
      pass: smtpPass,
      fromEmail,
    },
    branding: {
      tagline:
        process.env.EMAIL_TAGLINE ||
        'Natural Healing · Holistic Wellness · Trusted Care',
      practitioner: process.env.EMAIL_PRACTITIONER || 'Edgar Bustamante, N.D.',
      practitionerTitle:
        process.env.EMAIL_PRACTITIONER_TITLE || 'Naturopathy Practitioner',
      phones: listEnv('EMAIL_PHONES', ['0951 611 4125', '0991 391 6469']),
      hours:
        process.env.EMAIL_HOURS ||
        'Mon–Sat 9:00 AM – 6:00 PM · Sunday by appointment',
      location:
        process.env.EMAIL_LOCATION ||
        'ONEWAYHI Health and Wellness, Bicol Region, Philippines',
    },
  }
}

function validate(input) {
  const errors = {}
  const allowed = Object.keys(SERVICE_LABELS)

  const fullName = String(input.fullName ?? '').trim()
  const phone = String(input.phone ?? '').trim()
  const email = String(input.email ?? '').trim()
  const service = String(input.service ?? '').trim()
  const preferredDate = String(input.preferredDate ?? '').trim()
  const preferredTime = String(input.preferredTime ?? '').trim()
  const notes = String(input.notes ?? '').trim()

  if (fullName === '' || fullName.length < 2) errors.fullName = 'Please enter your full name.'
  if (phone === '' || !/^[\d\s+\-()]{7,20}$/.test(phone)) {
    errors.phone = 'Please enter a valid phone number.'
  }
  if (email === '' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email address.'
  }
  if (service === '' || !allowed.includes(service)) {
    errors.service = 'Please select a service.'
  }
  if (preferredDate !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(preferredDate)) {
    errors.preferredDate = 'Please enter a valid preferred date.'
  }
  if (preferredTime !== '' && !/^\d{2}:\d{2}$/.test(preferredTime)) {
    errors.preferredTime = 'Please enter a valid time (HH:MM).'
  }
  if (notes.length > 1000) errors.notes = 'Notes must be 1000 characters or less.'

  return {
    data: { fullName, phone, email, service, preferredDate, preferredTime, notes },
    errors,
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildEmail(appointment, config) {
  const clinicName = config.clinicName
  const service = serviceLabel(appointment.service)
  const submittedAt =
    new Intl.DateTimeFormat('en-PH', {
      timeZone: 'Asia/Manila',
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date()) + ' (Philippines)'

  const subject = `${clinicName} · New appointment · ${appointment.fullName} — ${service}`

  const text = [
    clinicName,
    'New appointment request',
    `Name: ${appointment.fullName}`,
    `Phone: ${appointment.phone}`,
    `Email: ${appointment.email}`,
    `Service: ${service}`,
    `Date: ${appointment.preferredDate || 'Flexible'}`,
    `Time: ${appointment.preferredTime || 'Flexible'}`,
    `Notes: ${appointment.notes || '(none)'}`,
    `Submitted: ${submittedAt}`,
  ].join('\n')

  const html = `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:24px;">
<h2>${escapeHtml(clinicName)}</h2>
<p><strong>New appointment</strong></p>
<p>Name: ${escapeHtml(appointment.fullName)}<br>
Phone: ${escapeHtml(appointment.phone)}<br>
Email: ${escapeHtml(appointment.email)}<br>
Service: ${escapeHtml(service)}<br>
Date: ${escapeHtml(appointment.preferredDate || 'Flexible')}<br>
Time: ${escapeHtml(appointment.preferredTime || 'Flexible')}</p>
<p>Notes: ${escapeHtml(appointment.notes || '(none)')}</p>
<p style="color:#666;font-size:13px;">${escapeHtml(submittedAt)}</p>
</body></html>`

  return { subject, html, text }
}

async function sendEmail(appointment, config) {
  const { clinicEmail, smtp, mailFromName } = config
  if (!clinicEmail || !smtp.user || !smtp.pass) return false

  const nodemailer = require('nodemailer')
  const { subject, html, text } = buildEmail(appointment, config)

  const transport = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: { user: smtp.user, pass: smtp.pass },
  })

  await transport.sendMail({
    from: `"${String(mailFromName).replace(/"/g, '')}" <${smtp.fromEmail}>`,
    to: clinicEmail,
    replyTo: appointment.email,
    subject,
    text,
    html,
  })

  return true
}

function applyCors(req, res) {
  const origin = req.headers.origin || ''
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*')
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept')
}

function sendJson(res, status, data) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(status).json(data)
  }
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(data))
}

function parseBody(req) {
  const raw = req.body
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) return raw
  if (typeof raw === 'string' && raw.trim()) {
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  }
  return null
}

module.exports = async function handler(req, res) {
  applyCors(req, res)

  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') return res.status(204).end()
    res.statusCode = 204
    return res.end()
  }

  try {
    const config = loadConfig()

    if (req.method === 'GET') {
      return sendJson(res, 200, {
        success: true,
        message: 'Appointments API is running. Send POST JSON to book.',
        smtpConfigured: Boolean(config.clinicEmail && config.smtp.user && config.smtp.pass),
      })
    }

    if (req.method !== 'POST') {
      return sendJson(res, 405, { success: false, message: 'Method not allowed.' })
    }

    const payload = parseBody(req)
    if (!payload) {
      return sendJson(res, 400, { success: false, message: 'Invalid JSON body.' })
    }

    const { data, errors } = validate(payload)
    if (Object.keys(errors).length > 0) {
      return sendJson(res, 422, {
        success: false,
        message: 'Please correct the errors below.',
        errors,
      })
    }

    let emailSent = false
    try {
      emailSent = await sendEmail(data, config)
    } catch (err) {
      console.error('SMTP error:', err)
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
    console.error('Handler error:', err)
    return sendJson(res, 500, {
      success: false,
      message: 'Booking server error.',
      detail: process.env.NODE_ENV === 'development' ? String(err) : undefined,
    })
  }
}
