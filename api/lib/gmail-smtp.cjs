/**
 * Gmail SMTP via nodemailer (App Password required).
 * https://support.google.com/mail/answer/185833
 */
function normalizeAppPassword(pass) {
  return String(pass || '').replace(/\s+/g, '')
}

function createGmailTransport(smtp) {
  const nodemailer = require('nodemailer')
  const port = Number(smtp.port) || 587
  const encryption = String(smtp.encryption || 'tls').toLowerCase()
  const useImplicitSsl = port === 465 || encryption === 'ssl'

  return nodemailer.createTransport({
    host: smtp.host || 'smtp.gmail.com',
    port,
    secure: useImplicitSsl,
    requireTLS: !useImplicitSsl,
    auth: {
      user: smtp.user,
      pass: normalizeAppPassword(smtp.pass),
    },
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 30000,
    tls: { minVersion: 'TLSv1.2' },
  })
}

async function sendViaGmailSmtp({ smtp, mailFromName, fromEmail, to, replyTo, subject, html, text }) {
  if (!to || !smtp.user || !smtp.pass) {
    return { ok: false, error: 'Missing CLINIC_EMAIL or MAIL_SMTP_USER / MAIL_SMTP_PASS' }
  }

  const transport = createGmailTransport(smtp)
  const from = `"${String(mailFromName).replace(/"/g, '')}" <${fromEmail || smtp.user}>`

  try {
    await transport.sendMail({
      from,
      to,
      replyTo,
      subject,
      text,
      html,
    })
    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Gmail SMTP send failed:', message)
    return { ok: false, error: message }
  } finally {
    transport.close()
  }
}

module.exports = { createGmailTransport, sendViaGmailSmtp, normalizeAppPassword }
