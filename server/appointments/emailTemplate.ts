import { existsSync, readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import type { AppointmentInput } from './validate'
import { serviceLabel } from './services'

const BLUE = '#0d5c8c'
const TEXT_MUTED = '#4a5f57'
const WHITE = '#ffffff'
const BORDER = '#d8e4df'

export interface EmailBranding {
  clinicName: string
  tagline: string
  practitioner: string
  practitionerTitle: string
  phones: string[]
  hours: string
  location: string
}

export function loadEmailBranding(): EmailBranding {
  const listEnv = (key: string, fallback: string[]) => {
    const raw = process.env[key]
    if (!raw?.trim()) return fallback
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }

  return {
    clinicName: process.env.CLINIC_NAME || 'Eco Wealth Wellnessolution',
    tagline:
      process.env.EMAIL_TAGLINE || 'Natural Healing · Holistic Wellness · Trusted Care',
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
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escapeNbsp(value: string): string {
  return escapeHtml(value).replace(/ /g, '&nbsp;')
}

function formatSubmittedAt(): string {
  return (
    new Intl.DateTimeFormat('en-PH', {
      timeZone: 'Asia/Manila',
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date()) + ' (Philippines)'
  )
}

function formatPreferredDate(date: string | undefined): string {
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

function formatPreferredTime(time: string | undefined): string {
  if (!time) return 'Flexible / to be confirmed'
  const [h, m] = time.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return time
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })
}

function infoCell(label: string, valueHtml: string): string {
  return `<td width="50%" valign="top" style="padding:8px 6px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${WHITE};border:1px solid ${BORDER};border-radius:10px;">
<tr><td style="padding:14px 16px;">
<p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${TEXT_MUTED};">${escapeHtml(label)}</p>
<div style="font-size:15px;line-height:1.45;color:#1a2e28;font-weight:600;">${valueHtml}</div>
</td></tr></table></td>`
}

function buildContactGrid(appointment: AppointmentInput): string {
  const phoneDigits = appointment.phone.replace(/\D+/g, '')
  const phone = escapeHtml(appointment.phone)
  const email = escapeHtml(appointment.email)
  const telPatient = `tel:${escapeHtml(phoneDigits)}`

  return (
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>' +
    infoCell('Full name', escapeHtml(appointment.fullName)) +
    infoCell('Phone', `<a href="${telPatient}" style="color:${BLUE};text-decoration:none;">${phone}</a>`) +
    '</tr><tr><td colspan="2" style="padding:8px 6px;">' +
    `<table role="presentation" width="100%" style="background:${WHITE};border:1px solid ${BORDER};border-radius:10px;"><tr><td style="padding:14px 16px;">` +
    `<p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${TEXT_MUTED};">Email</p>` +
    `<div style="font-size:15px;font-weight:600;"><a href="mailto:${email}" style="color:${BLUE};text-decoration:none;word-break:break-all;">${email}</a></div>` +
    '</td></tr></table></td></tr></table>'
  )
}

function buildPhonesHtml(phones: string[]): string {
  return phones
    .map((p) => {
      const tel = p.replace(/\D+/g, '')
      return `<a href="tel:${escapeHtml(tel)}" style="color:#b8e6cf;text-decoration:none;font-weight:600;">${escapeHtml(p)}</a>`
    })
    .join(' &nbsp;|&nbsp; ')
}

let cachedTemplate: string | null = null

function templateCandidates(): string[] {
  const here = dirname(fileURLToPath(import.meta.url))
  return [
    join(process.cwd(), 'api/templates/appointment-email.html'),
    join(here, '../../api/templates/appointment-email.html'),
    join(here, '../../../api/templates/appointment-email.html'),
  ]
}

function loadHtmlTemplate(): string {
  if (cachedTemplate) return cachedTemplate
  for (const path of templateCandidates()) {
    if (existsSync(path)) {
      cachedTemplate = readFileSync(path, 'utf8')
      return cachedTemplate
    }
  }
  console.warn('appointment-email.html not found; using plain layout fallback')
  cachedTemplate = '{{FALLBACK_HTML}}'
  return cachedTemplate
}

function applyPlaceholders(html: string, vars: Record<string, string>): string {
  let out = html
  for (const [key, value] of Object.entries(vars)) {
    out = out.split(`{{${key}}}`).join(value)
  }
  return out
}

function buildPlain(
  appointment: AppointmentInput,
  clinicName: string,
  service: string,
  submittedAt: string,
): string {
  const notes = appointment.notes || '(none)'

  return [
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
    notes,
    '',
    `Submitted: ${submittedAt}`,
    '',
    `Reply directly to this email to reach ${appointment.fullName}.`,
  ].join('\n')
}

function buildHtml(
  appointment: AppointmentInput,
  branding: EmailBranding,
  service: string,
  submittedAt: string,
): string {
  const phoneDigits = appointment.phone.replace(/\D+/g, '')
  const notesRaw = appointment.notes || 'No additional notes provided.'
  const notes = escapeHtml(notesRaw).replace(/\n/g, '<br>')

  const raw = loadHtmlTemplate()
  const vars: Record<string, string> = {
    CLINIC_NAME: escapeNbsp(branding.clinicName),
    TAGLINE: escapeHtml(branding.tagline),
    PATIENT_NAME: escapeHtml(appointment.fullName),
    SERVICE: escapeHtml(service),
    PREFERRED_DATE: escapeHtml(formatPreferredDate(appointment.preferredDate)),
    PREFERRED_TIME: escapeHtml(formatPreferredTime(appointment.preferredTime)),
    CONTACT_GRID: buildContactGrid(appointment),
    NOTES: notes,
    REPLY_URL:
      'mailto:' +
      encodeURIComponent(appointment.email) +
      '?subject=' +
      encodeURIComponent('Re: Your Eco Wealth appointment request'),
    TEL_URL: `tel:${escapeHtml(phoneDigits)}`,
    SUBMITTED_AT: escapeHtml(submittedAt),
    PRACTITIONER: escapeHtml(branding.practitioner),
    PRACTITIONER_TITLE: escapeHtml(branding.practitionerTitle),
    LOCATION: escapeHtml(branding.location),
    HOURS: escapeHtml(branding.hours),
    PHONES_HTML: buildPhonesHtml(branding.phones),
  }

  if (raw.includes('{{FALLBACK_HTML}}')) {
    return buildFallbackHtml(appointment, branding, service, submittedAt)
  }

  return applyPlaceholders(raw, vars)
}

function buildFallbackHtml(
  appointment: AppointmentInput,
  branding: EmailBranding,
  service: string,
  submittedAt: string,
): string {
  const name = escapeHtml(appointment.fullName)
  const phone = escapeHtml(appointment.phone)
  const email = escapeHtml(appointment.email)
  const serviceHtml = escapeHtml(service)
  const notes = escapeHtml(appointment.notes || '(none)').replace(/\n/g, '<br>')
  const clinic = escapeHtml(branding.clinicName)

  return `<!DOCTYPE html><html><body style="font-family:Segoe UI,sans-serif;padding:24px;background:#f7f9f8;">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:24px;border:1px solid #d8e4df;">
<h2 style="color:#1a7a4a;margin:0 0 8px;">${clinic}</h2>
<p style="color:#4a5f57;margin:0 0 20px;">New appointment request</p>
<p><strong>Name:</strong> ${name}<br><strong>Phone:</strong> ${phone}<br><strong>Email:</strong> ${email}</p>
<p><strong>Service:</strong> ${serviceHtml}<br><strong>Date:</strong> ${escapeHtml(formatPreferredDate(appointment.preferredDate))}<br><strong>Time:</strong> ${escapeHtml(formatPreferredTime(appointment.preferredTime))}</p>
<p><strong>Notes:</strong><br>${notes}</p>
<p style="font-size:13px;color:#888;margin-top:20px;">${escapeHtml(submittedAt)}</p>
</div></body></html>`
}

export function buildAppointmentEmail(
  appointment: AppointmentInput,
  branding?: EmailBranding,
): { subject: string; html: string; text: string } {
  const brand = branding ?? loadEmailBranding()
  const service = serviceLabel(appointment.service)
  const submittedAt = formatSubmittedAt()

  const subject = `${brand.clinicName} · New appointment · ${appointment.fullName} — ${service}`

  return {
    subject,
    html: buildHtml(appointment, brand, service, submittedAt),
    text: buildPlain(appointment, brand.clinicName, service, submittedAt),
  }
}
