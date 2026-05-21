const { allowedServiceIds } = require('./services.cjs')

function validateAppointment(input) {
  const errors = {}
  const allowed = allowedServiceIds()

  const fullName = String(input.fullName ?? '').trim()
  const phone = String(input.phone ?? '').trim()
  const email = String(input.email ?? '').trim()
  const service = String(input.service ?? '').trim()
  const preferredDate = String(input.preferredDate ?? '').trim()
  const preferredTime = String(input.preferredTime ?? '').trim()
  const notes = String(input.notes ?? '').trim()

  if (fullName === '' || fullName.length < 2) {
    errors.fullName = 'Please enter your full name.'
  }
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
  if (notes.length > 1000) {
    errors.notes = 'Notes must be 1000 characters or less.'
  }

  return {
    data: {
      fullName,
      phone,
      email,
      service,
      preferredDate,
      preferredTime,
      notes,
    },
    errors,
  }
}

module.exports = { validateAppointment }
