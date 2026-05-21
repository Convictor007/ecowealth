import nodemailer from 'nodemailer'
import type { AppointmentInput } from './validate'
import { buildAppointmentEmail } from './emailTemplate'

export function isEmailConfigured(): boolean {
  const clinicEmail = process.env.CLINIC_EMAIL
  const smtpUser = process.env.MAIL_SMTP_USER
  const smtpPass = process.env.MAIL_SMTP_PASS?.replace(/\s+/g, '')
  return Boolean(clinicEmail && smtpUser && smtpPass)
}

function normalizeAppPassword(pass: string): string {
  return pass.replace(/\s+/g, '')
}

function createTransport() {
  const smtpUser = process.env.MAIL_SMTP_USER || ''
  const smtpPass = normalizeAppPassword(process.env.MAIL_SMTP_PASS || '')
  const port = Number(process.env.MAIL_SMTP_PORT || '587')
  const encryption = (process.env.MAIL_SMTP_ENCRYPTION || 'tls').toLowerCase()
  const useImplicitSsl = port === 465 || encryption === 'ssl'

  return nodemailer.createTransport({
    host: process.env.MAIL_SMTP_HOST || 'smtp.gmail.com',
    port,
    secure: useImplicitSsl,
    requireTLS: !useImplicitSsl,
    auth: { user: smtpUser, pass: smtpPass },
    connectionTimeout: 20_000,
    greetingTimeout: 20_000,
    socketTimeout: 30_000,
    tls: { minVersion: 'TLSv1.2' },
  })
}

export async function sendAppointmentEmail(input: AppointmentInput): Promise<void> {
  if (!isEmailConfigured()) {
    throw new Error('Appointment email is not configured (CLINIC_EMAIL, MAIL_SMTP_*)')
  }

  const clinicEmail = process.env.CLINIC_EMAIL!
  const smtpUser = process.env.MAIL_SMTP_USER!
  const fromEmail = process.env.MAIL_FROM_EMAIL || smtpUser
  const fromName = process.env.MAIL_FROM_NAME || 'Eco Wealth Appointments'
  const { subject, html, text } = buildAppointmentEmail(input)

  const transport = createTransport()

  try {
    await transport.sendMail({
      from: `"${fromName.replace(/"/g, '')}" <${fromEmail}>`,
      to: clinicEmail,
      replyTo: input.email,
      subject,
      text,
      html,
    })
  } catch (err) {
    const smtpMsg = err instanceof Error ? err.message : String(err)
    console.error('SMTP send failed:', smtpMsg)
    if (/invalid login|authentication|535|534/i.test(smtpMsg)) {
      throw new Error('SMTP authentication failed — check Gmail App Password')
    }
    throw new Error(`Failed to send appointment email: ${smtpMsg}`)
  } finally {
    transport.close()
  }
}
