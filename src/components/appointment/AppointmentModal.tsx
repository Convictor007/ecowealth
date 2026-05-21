import { useEffect, useState, type FormEvent } from 'react'
import { Loader2, Mail, Phone, User, X } from 'lucide-react'
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
import AppointmentDateTime from './AppointmentDateTime'
import './AppointmentModal.css'

const EMPTY_FORM = {
  fullName: '',
  phone: '',
  email: '',
  service: 'free-checkup',
  preferredDate: '',
  preferredTime: '',
  notes: '',
  website: '',
}

export default function AppointmentModal() {
  const { isOpen, closeAppointmentModal } = useAppointmentModal()
  const [services, setServices] = useState<AppointmentService[]>([...APPOINTMENT_SERVICES_FALLBACK])
  const [servicesLoading, setServicesLoading] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!isOpen) return
    setServicesLoading(true)
    getAppointmentServices()
      .then((res) => setServices(res.services))
      .catch(() => setServices([...APPOINTMENT_SERVICES_FALLBACK]))
      .finally(() => setServicesLoading(false))
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && status !== 'submitting') closeAppointmentModal()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, closeAppointmentModal, status])

  if (!isOpen) return null

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setFieldErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const isSubmitting = status === 'submitting'
  const formBusy = isSubmitting || servicesLoading

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
          website: form.website,
        },
        resolveAppointmentApiUrl(),
      )
      setStatus('success')
      setMessage(res.message)
      setForm(EMPTY_FORM)
    } catch (err) {
      setStatus('error')
      setMessage(
        err instanceof ApiError
          ? err.message
          : 'Something went wrong. Please try again or call us.',
      )
      setFieldErrors(getAppointmentErrors(err))
    }
  }

  return (
    <div className="appointment-modal" role="presentation" onClick={closeAppointmentModal}>
      <div
        className={`appointment-modal__dialog${isSubmitting ? ' appointment-modal__dialog--submitting' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="appointment-modal-title"
        aria-busy={formBusy}
        onClick={(e) => e.stopPropagation()}
      >
        {isSubmitting && (
          <div
            className="appointment-modal__sending"
            role="status"
            aria-live="assertive"
            aria-label="Sending appointment request"
          >
            <div className="appointment-modal__sending-card">
              <Loader2 size={40} className="appointment-modal__spin" aria-hidden />
              <p className="appointment-modal__sending-title">Sending your request</p>
              <p className="appointment-modal__sending-hint">Connecting to the clinic…</p>
              <div className="appointment-modal__sending-bar" aria-hidden>
                <span className="appointment-modal__sending-bar-fill" />
              </div>
            </div>
          </div>
        )}

        <header className="appointment-modal__header">
          <div>
            <h2 id="appointment-modal-title">{BOOKING_CTA.label}</h2>
            <p>Request an appointment by email. We will confirm by phone or email.</p>
          </div>
          <button
            type="button"
            className="appointment-modal__close"
            onClick={closeAppointmentModal}
            disabled={isSubmitting}
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
            {servicesLoading && (
              <div className="appointment-modal__loading appointment-modal__loading--inline" aria-live="polite">
                <Loader2 size={20} className="appointment-modal__spin" aria-hidden />
                <span>Loading services…</span>
              </div>
            )}

            <div className="appointment-modal__hp" aria-hidden="true">
              <label>
                Website
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.website}
                  onChange={(e) => update('website', e.target.value)}
                />
              </label>
            </div>

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
                  disabled={formBusy}
                />
                {fieldErrors.fullName && (
                  <span className="appointment-modal__field-error">{fieldErrors.fullName}</span>
                )}
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
                  disabled={formBusy}
                />
                {fieldErrors.phone && (
                  <span className="appointment-modal__field-error">{fieldErrors.phone}</span>
                )}
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
                disabled={formBusy}
              />
              {fieldErrors.email && (
                <span className="appointment-modal__field-error">{fieldErrors.email}</span>
              )}
            </label>

            <label className="appointment-modal__field">
              <span>Service *</span>
              <select
                name="service"
                value={form.service}
                onChange={(e) => update('service', e.target.value)}
                required
                disabled={formBusy}
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              {fieldErrors.service && (
                <span className="appointment-modal__field-error">{fieldErrors.service}</span>
              )}
            </label>

            <AppointmentDateTime
              preferredDate={form.preferredDate}
              preferredTime={form.preferredTime}
              onDateChange={(v) => update('preferredDate', v)}
              onTimeChange={(v) => update('preferredTime', v)}
              dateError={fieldErrors.preferredDate}
              timeError={fieldErrors.preferredTime}
              disabled={formBusy}
            />

            <label className="appointment-modal__field">
              <span>Notes (optional)</span>
              <textarea
                name="notes"
                rows={3}
                value={form.notes}
                onChange={(e) => update('notes', e.target.value)}
                placeholder="Symptoms, questions, or best time to reach you"
                disabled={formBusy}
              />
              {fieldErrors.notes && (
                <span className="appointment-modal__field-error">{fieldErrors.notes}</span>
              )}
            </label>

            {status === 'error' && message && (
              <p className="appointment-modal__alert" role="alert">
                {message}
              </p>
            )}

            <div className="appointment-modal__actions">
              <button
                type="button"
                className="btn btn--outline"
                onClick={closeAppointmentModal}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn--primary appointment-modal__submit"
                disabled={formBusy}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="appointment-modal__spin" aria-hidden />
                    Sending…
                  </>
                ) : (
                  'Send request'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
