import { useEffect, useState, type FormEvent } from 'react'
import { Calendar, Mail, Phone, User, X } from 'lucide-react'
import {
  getAppointmentErrors,
  getAppointmentServices,
  submitAppointment,
} from '@/api/appointments'
import { ApiError } from '@/api/client'
import type { AppointmentService } from '@/api/types'
import { useAppointmentModal } from '@/context/AppointmentModalContext'
import {
  resolveAppointmentApiUrl,
  APPOINTMENT_SERVICES_FALLBACK,
} from '@/constants/appointments'
import { BOOKING_CTA } from '@/constants/clinic'
import './AppointmentModal.css'

const EMPTY_FORM = {
  fullName: '',
  phone: '',
  email: '',
  service: 'free-checkup',
  preferredDate: '',
  preferredTime: '',
  notes: '',
}

export default function AppointmentModal() {
  const { isOpen, closeAppointmentModal } = useAppointmentModal()
  const [services, setServices] = useState<AppointmentService[]>([...APPOINTMENT_SERVICES_FALLBACK])
  const [form, setForm] = useState(EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!isOpen) return
    getAppointmentServices()
      .then((res) => setServices(res.services))
      .catch(() => setServices([...APPOINTMENT_SERVICES_FALLBACK]))
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAppointmentModal()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, closeAppointmentModal])

  if (!isOpen) return null

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    setMessage('')
    setFieldErrors({})

    try {
      const res = await submitAppointment(
        {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          service: form.service,
          preferredDate: form.preferredDate || undefined,
          preferredTime: form.preferredTime || undefined,
          notes: form.notes.trim() || undefined,
        },
        resolveAppointmentApiUrl(),
      )
      setStatus('success')
      setMessage(res.message)
      setForm(EMPTY_FORM)
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof ApiError ? err.message : 'Something went wrong. Please try again or call us.')
      setFieldErrors(getAppointmentErrors(err))
    }
  }

  return (
    <div className="appointment-modal" role="presentation" onClick={closeAppointmentModal}>
      <div
        className="appointment-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="appointment-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="appointment-modal__header">
          <div>
            <h2 id="appointment-modal-title">{BOOKING_CTA.label}</h2>
            <p>Request an appointment by email. We will confirm by phone or email.</p>
          </div>
          <button
            type="button"
            className="appointment-modal__close"
            onClick={closeAppointmentModal}
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </header>

        {status === 'success' ? (
          <div className="appointment-modal__success">
            <p>{message}</p>
            <button type="button" className="btn btn--primary" onClick={closeAppointmentModal}>
              Close
            </button>
          </div>
        ) : (
          <form className="appointment-modal__form" onSubmit={handleSubmit} noValidate>
            <div className="appointment-modal__row appointment-modal__row--2">
              <label className="appointment-modal__field">
                <span>
                  <User size={16} aria-hidden />
                  Full name *
                </span>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={(e) => update('fullName', e.target.value)}
                  autoComplete="name"
                  required
                />
                {fieldErrors.fullName && <em>{fieldErrors.fullName}</em>}
              </label>
              <label className="appointment-modal__field">
                <span>
                  <Phone size={16} aria-hidden />
                  Phone *
                </span>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  autoComplete="tel"
                  placeholder="0951 611 4125"
                  required
                />
                {fieldErrors.phone && <em>{fieldErrors.phone}</em>}
              </label>
            </div>

            <label className="appointment-modal__field">
              <span>
                <Mail size={16} aria-hidden />
                Email *
              </span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                autoComplete="email"
                required
              />
              {fieldErrors.email && <em>{fieldErrors.email}</em>}
            </label>

            <label className="appointment-modal__field">
              <span>Service *</span>
              <select
                name="service"
                value={form.service}
                onChange={(e) => update('service', e.target.value)}
                required
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              {fieldErrors.service && <em>{fieldErrors.service}</em>}
            </label>

            <div className="appointment-modal__row appointment-modal__row--2">
              <label className="appointment-modal__field">
                <span>
                  <Calendar size={16} aria-hidden />
                  Preferred date
                </span>
                <input
                  type="date"
                  name="preferredDate"
                  value={form.preferredDate}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => update('preferredDate', e.target.value)}
                />
                {fieldErrors.preferredDate && <em>{fieldErrors.preferredDate}</em>}
              </label>
              <label className="appointment-modal__field">
                <span>Preferred time</span>
                <input
                  type="time"
                  name="preferredTime"
                  value={form.preferredTime}
                  onChange={(e) => update('preferredTime', e.target.value)}
                />
                {fieldErrors.preferredTime && <em>{fieldErrors.preferredTime}</em>}
              </label>
            </div>

            <label className="appointment-modal__field">
              <span>Notes (optional)</span>
              <textarea
                name="notes"
                rows={3}
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
                placeholder="Symptoms, questions, or best time to reach you"
              />
              {fieldErrors.notes && <em>{fieldErrors.notes}</em>}
            </label>

            {status === 'error' && message && (
              <p className="appointment-modal__alert" role="alert">
                {message}
              </p>
            )}

            <div className="appointment-modal__actions">
              <button type="button" className="btn btn--outline" onClick={closeAppointmentModal}>
                Cancel
              </button>
              <button type="submit" className="btn btn--primary" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Sending…' : 'Send request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
