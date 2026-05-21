import { createRequire } from 'module'
import type { AppointmentInput } from './validate'
import { buildAppointmentEmail } from './emailTemplate'

const require = createRequire(import.meta.url)
const { sendViaGmailSmtp } = require('../../api/lib/gmail-smtp.cjs') as {
  sendViaGmailSmtp: (opts: {
    smtp: {
      host: string
      port: number
      encryption: string
      user: string
      pass: string
      fromEmail: string
    }
    mailFromName: string
    fromEmail: string
    to: string
    replyTo: string
    subject: string
    html: string
    text: string
  }) => Promise<{ ok: boolean; error?: string }>
}

export function isEmailConfigured(): boolean {
  const clinicEmail = process.env.CLINIC_EMAIL
  const smtpUser = process.env.MAIL_SMTP_USER
  const smtpPass = process.env.MAIL_SMTP_PASS?.replace(/\s+/g, '')
  return Boolean(clinicEmail && smtpUser && smtpPass)
}

function smtpConfig() {
  const smtpUser = process.env.MAIL_SMTP_USER || ''
  const smtpPass = process.env.MAIL_SMTP_PASS || ''
  return {
    host: process.env.MAIL_SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.MAIL_SMTP_PORT || '587'),
    encryption: (process.env.MAIL_SMTP_ENCRYPTION || 'tls').toLowerCase(),
    user: smtpUser,
    pass: smtpPass,
    fromEmail: process.env.MAIL_FROM_EMAIL || smtpUser,
  }
}

export async function sendAppointmentEmail(input: AppointmentInput): Promise<void> {
  if (!isEmailConfigured()) {
    throw new Error('Appointment email is not configured (CLINIC_EMAIL, MAIL_SMTP_*)')
  }

  const clinicEmail = process.env.CLINIC_EMAIL!
  const { subject, html, text } = buildAppointmentEmail(input)
  const mailFromName = process.env.MAIL_FROM_NAME || 'Eco Wealth Appointments'
  const smtp = smtpConfig()

  const result = await sendViaGmailSmtp({
    smtp,
    mailFromName,
    fromEmail: smtp.fromEmail,
    to: clinicEmail,
    replyTo: input.email,
    subject,
    html,
    text,
  })

  if (!result.ok) {
    const err = result.error || 'Failed to send appointment email'
    if (/invalid login|authentication|535|534/i.test(err)) {
      throw new Error('SMTP authentication failed — check Gmail App Password')
    }
    throw new Error(err)
  }
}
