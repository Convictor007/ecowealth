/**
 * Eco Wealth — book appointment (Vercel serverless + Gmail SMTP).
 * Env: CLINIC_EMAIL, MAIL_SMTP_USER, MAIL_SMTP_PASS, MAIL_FROM_EMAIL, MAIL_FROM_NAME
 */
const { sendViaGmailSmtp } = require('./lib/gmail-smtp.cjs')

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

  return {
    clinicName: process.env.CLINIC_NAME || 'Eco Wealth Wellnessolution',
    clinicEmail: process.env.CLINIC_EMAIL || '',
    mailFromName: process.env.MAIL_FROM_NAME || 'Eco Wealth Appointments',
    smtp: {
      host: process.env.MAIL_SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.MAIL_SMTP_PORT || '587'),
      encryption: (process.env.MAIL_SMTP_ENCRYPTION || 'tls').toLowerCase(),
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
    'New appointment request from your website',
    '',
    `Name: ${appointment.fullName}`,
    `Phone: ${appointment.phone}`,
    `Email: ${appointment.email}`,
    `Service: ${service}`,
    `Preferred date: ${appointment.preferredDate || 'Flexible'}`,
    `Preferred time: ${appointment.preferredTime || 'Flexible'}`,
    `Notes: ${appointment.notes || '(none)'}`,
    '',
    `Submitted: ${submittedAt}`,
  ].join('\n')

  const html = `<!DOCTYPE html><html><body style="font-family:Segoe UI,sans-serif;padding:24px;background:#f7f9f8;">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:24px;">
<h2 style="color:#1a7a4a;margin:0 0 8px;">${escapeHtml(clinicName)}</h2>
<p style="color:#4a5f57;margin:0 0 20px;">New appointment request</p>
<table style="width:100%;font-size:15px;line-height:1.6;">
<tr><td style="padding:6px 0;color:#4a5f57;">Name</td><td><strong>${escapeHtml(appointment.fullName)}</strong></td></tr>
<tr><td style="padding:6px 0;color:#4a5f57;">Phone</td><td>${escapeHtml(appointment.phone)}</td></tr>
<tr><td style="padding:6px 0;color:#4a5f57;">Email</td><td>${escapeHtml(appointment.email)}</td></tr>
<tr><td style="padding:6px 0;color:#4a5f57;">Service</td><td style="color:#1a7a4a;font-weight:600;">${escapeHtml(service)}</td></tr>
<tr><td style="padding:6px 0;color:#4a5f57;">Date</td><td>${escapeHtml(appointment.preferredDate || 'Flexible')}</td></tr>
<tr><td style="padding:6px 0;color:#4a5f57;">Time</td><td>${escapeHtml(appointment.preferredTime || 'Flexible')}</td></tr>
</table>
<p style="margin-top:20px;"><strong>Notes</strong><br>${escapeHtml(appointment.notes || '(none)')}</p>
<p style="font-size:13px;color:#888;">${escapeHtml(submittedAt)}</p>
</div></body></html>`

  return { subject, html, text }
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

async function handler(req, res) {
  applyCors(req, res)

  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') return res.status(204).end()
    res.statusCode = 204
    return res.end()
  }

  try {
    const config = loadConfig()
    const smtpReady = Boolean(
      config.clinicEmail && config.smtp.user && config.smtp.pass,
    )

    if (req.method === 'GET') {
      return sendJson(res, 200, {
        success: true,
        message: 'Appointments API is running. Send POST JSON to book.',
        provider: 'gmail-smtp',
        smtpConfigured: smtpReady,
        smtpHost: config.smtp.host,
        smtpPort: config.smtp.port,
      })
    }

    if (req.method !== 'POST') {
      return sendJson(res, 405, { success: false, message: 'Method not allowed.' })
    }

    if (!smtpReady) {
      return sendJson(res, 503, {
        success: false,
        message:
          'Email not configured. Set CLINIC_EMAIL, MAIL_SMTP_USER, and MAIL_SMTP_PASS (Gmail App Password) on Vercel.',
      })
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

    const { subject, html, text } = buildEmail(data, config)
    const result = await sendViaGmailSmtp({
      smtp: config.smtp,
      mailFromName: config.mailFromName,
      fromEmail: config.smtp.fromEmail,
      to: config.clinicEmail,
      replyTo: data.email,
      subject,
      html,
      text,
    })

    if (!result.ok) {
      return sendJson(res, 200, {
        success: true,
        message: 'Request received. Email could not be sent — we will follow up soon.',
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
    })
  }
}

handler.config = { maxDuration: 60 }
module.exports = handler
