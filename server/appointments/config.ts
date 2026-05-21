export type AppointmentServerConfig = {
  clinicName: string
  clinicEmail: string
  mailFromName: string
  allowedOrigins: string[]
  smtp: {
    host: string
    port: number
    secure: boolean
    user: string
    pass: string
    fromEmail: string
  }
  branding: {
    tagline: string
    practitioner: string
    practitionerTitle: string
    phones: string[]
    hours: string
    location: string
  }
}

function listEnv(key: string, fallback: string[]): string[] {
  const raw = process.env[key]
  if (!raw?.trim()) return fallback
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function loadAppointmentConfig(): AppointmentServerConfig {
  const smtpUser = process.env.MAIL_SMTP_USER ?? ''
  const smtpPass = process.env.MAIL_SMTP_PASS ?? ''
  const fromEmail = process.env.MAIL_FROM_EMAIL ?? smtpUser
  const encryption = (process.env.MAIL_SMTP_ENCRYPTION ?? 'tls').toLowerCase()

  return {
    clinicName: process.env.CLINIC_NAME ?? 'Eco Wealth Wellnessolution',
    clinicEmail: process.env.CLINIC_EMAIL ?? '',
    mailFromName: process.env.MAIL_FROM_NAME ?? 'Eco Wealth Appointments',
    allowedOrigins: listEnv('CORS_ORIGINS', [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost',
    ]),
    smtp: {
      host: process.env.MAIL_SMTP_HOST ?? 'smtp.gmail.com',
      port: Number(process.env.MAIL_SMTP_PORT ?? '587'),
      secure: encryption === 'ssl',
      user: smtpUser,
      pass: smtpPass,
      fromEmail,
    },
    branding: {
      tagline:
        process.env.EMAIL_TAGLINE ??
        'Natural Healing · Holistic Wellness · Trusted Care',
      practitioner: process.env.EMAIL_PRACTITIONER ?? 'Edgar Bustamante, N.D.',
      practitionerTitle:
        process.env.EMAIL_PRACTITIONER_TITLE ?? 'Naturopathy Practitioner',
      phones: listEnv('EMAIL_PHONES', ['0951 611 4125', '0991 391 6469']),
      hours:
        process.env.EMAIL_HOURS ??
        'Mon–Sat 9:00 AM – 6:00 PM · Sunday by appointment',
      location:
        process.env.EMAIL_LOCATION ??
        'ONEWAYHI Health and Wellness, Bicol Region, Philippines',
    },
  }
}
