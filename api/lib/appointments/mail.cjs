const nodemailer = require('nodemailer')
const { buildAppointmentEmail } = require('./email.cjs')

async function sendAppointmentEmail(appointment, config) {
  const { clinicEmail, smtp, mailFromName } = config
  if (!clinicEmail || !smtp.user || !smtp.pass) {
    return false
  }

  const { subject, html, text } = buildAppointmentEmail(appointment, config)

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

module.exports = { sendAppointmentEmail }
