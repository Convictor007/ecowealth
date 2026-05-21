const { serviceLabel } = require('./services.cjs')

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatSubmittedAt() {
  return (
    new Intl.DateTimeFormat('en-PH', {
      timeZone: 'Asia/Manila',
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date()) + ' (Philippines)'
  )
}

function formatPreferredDate(date) {
  if (!date) return 'Flexible / to be confirmed'
  const parsed = new Date(`${date}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString('en-PH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatPreferredTime(time) {
  if (!time) return 'Flexible / to be confirmed'
  const [h, m] = time.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return time
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })
}

function buildAppointmentEmail(appointment, config) {
  const clinicName = config.clinicName
  const service = serviceLabel(appointment.service)
  const submittedAt = formatSubmittedAt()

  const subject = `${clinicName} · New appointment · ${appointment.fullName} — ${service}`

  const text = [
    clinicName,
    'New appointment request from your website',
    '='.repeat(48),
    '',
    'Patient details',
    `  Name:           ${appointment.fullName}`,
    `  Phone:          ${appointment.phone}`,
    `  Email:          ${appointment.email}`,
    '',
    'Requested visit',
    `  Service:        ${service}`,
    `  Preferred date: ${formatPreferredDate(appointment.preferredDate)}`,
    `  Preferred time: ${formatPreferredTime(appointment.preferredTime)}`,
    '',
    'Notes from patient',
    appointment.notes || '(none)',
    '',
    `Submitted: ${submittedAt}`,
    '',
    `Reply directly to this email to reach ${appointment.fullName}.`,
  ].join('\n')

  const g1 = '#1a7a4a'
  const g2 = '#145f3a'
  const blue = '#0d5c8c'
  const name = escapeHtml(appointment.fullName)
  const phone = escapeHtml(appointment.phone)
  const email = escapeHtml(appointment.email)
  const notes = escapeHtml(appointment.notes || 'No additional notes provided.').replace(
    /\n/g,
    '<br>',
  )
  const phonesHtml = config.branding.phones
    .map((p) => {
      const tel = String(p).replace(/\D+/g, '')
      return `<a href="tel:${escapeHtml(tel)}" style="color:#b8e6cf;text-decoration:none;">${escapeHtml(p)}</a><br>`
    })
    .join('')

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f7f9f8;font-family:'Segoe UI',system-ui,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="600" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;">
<tr><td style="background:linear-gradient(135deg,${g1},${g2} 55%,${blue});padding:28px 32px;color:#fff;">
<p style="margin:0 0 6px;font-size:11px;font-weight:600;">Eco Wealth · Website booking</p>
<h1 style="margin:0;font-size:24px;font-family:Georgia,serif;">${escapeHtml(clinicName)}</h1>
<p style="margin:8px 0 0;font-size:14px;">${escapeHtml(config.branding.tagline)}</p>
</td></tr>
<tr><td style="padding:28px 32px;">
<h2 style="margin:0 0 16px;color:#1a2e28;">New appointment request</h2>
<p><strong>Name:</strong> ${name}<br>
<strong>Phone:</strong> ${phone}<br>
<strong>Email:</strong> ${email}</p>
<p><strong>Service:</strong> ${escapeHtml(service)}<br>
<strong>Preferred date:</strong> ${escapeHtml(formatPreferredDate(appointment.preferredDate))}<br>
<strong>Preferred time:</strong> ${escapeHtml(formatPreferredTime(appointment.preferredTime))}</p>
<p><strong>Notes:</strong><br>${notes}</p>
<p style="color:#4a5f57;font-size:13px;">Submitted ${escapeHtml(submittedAt)}</p>
</td></tr>
<tr><td style="background:#0c3d52;padding:24px 32px;color:#fff;font-size:13px;">
<p style="margin:0 0 4px;font-weight:600;">${escapeHtml(config.branding.practitioner)}</p>
<p style="margin:0 0 8px;opacity:0.85;">${escapeHtml(config.branding.practitionerTitle)}</p>
<p style="margin:0 0 8px;opacity:0.75;">${escapeHtml(config.branding.location)}</p>
<p style="margin:0;">${phonesHtml}</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`

  return { subject, html, text }
}

module.exports = { buildAppointmentEmail }
