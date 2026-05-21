import { useRef } from 'react'
import { Calendar, Clock } from 'lucide-react'

const TIME_SLOTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00']

function formatDateLabel(iso: string): string {
  if (!iso) return 'Choose a date'
  const d = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-PH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTimeLabel(time: string): string {
  if (!time) return 'Choose a time'
  const [h, m] = time.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return time
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })
}

function openPicker(input: HTMLInputElement | null) {
  if (!input) return
  if (typeof input.showPicker === 'function') {
    try {
      input.showPicker()
      return
    } catch {
      /* fallback */
    }
  }
  input.focus()
  input.click()
}

interface AppointmentDateTimeProps {
  preferredDate: string
  preferredTime: string
  onDateChange: (value: string) => void
  onTimeChange: (value: string) => void
  dateError?: string
  timeError?: string
  disabled?: boolean
}

export default function AppointmentDateTime({
  preferredDate,
  preferredTime,
  onDateChange,
  onTimeChange,
  dateError,
  timeError,
  disabled = false,
}: AppointmentDateTimeProps) {
  const dateRef = useRef<HTMLInputElement>(null)
  const timeRef = useRef<HTMLInputElement>(null)
  const minDate = new Date().toISOString().slice(0, 10)

  return (
    <fieldset className="appointment-modal__schedule" disabled={disabled}>
      <legend className="appointment-modal__schedule-legend">Preferred schedule (optional)</legend>

      <div
        className={`appointment-modal__picker${dateError ? ' appointment-modal__picker--error' : ''}${preferredDate ? ' appointment-modal__picker--filled' : ''}`}
      >
        <button
          type="button"
          className="appointment-modal__picker-hit"
          disabled={disabled}
          onClick={() => openPicker(dateRef.current)}
          aria-label="Choose preferred date"
        >
          <span className="appointment-modal__picker-icon" aria-hidden>
            <Calendar size={22} />
          </span>
          <span className="appointment-modal__picker-body">
            <span className="appointment-modal__picker-label">Date</span>
            <span className="appointment-modal__picker-value">{formatDateLabel(preferredDate)}</span>
          </span>
          <span className="appointment-modal__picker-action">Tap to pick</span>
        </button>
        <input
          ref={dateRef}
          type="date"
          name="preferredDate"
          className="appointment-modal__picker-input"
          value={preferredDate}
          min={minDate}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden
          onChange={(e) => onDateChange(e.target.value)}
        />
        {preferredDate && (
          <button
            type="button"
            className="appointment-modal__picker-clear"
            disabled={disabled}
            onClick={() => onDateChange('')}
            aria-label="Clear date"
          >
            Clear
          </button>
        )}
      </div>
      {dateError && <span className="appointment-modal__field-error">{dateError}</span>}

      <p className="appointment-modal__time-hint">Pick a time slot or choose a custom time</p>
      <div className="appointment-modal__time-slots" role="group" aria-label="Preferred time slots">
        {TIME_SLOTS.map((slot) => {
          const active = preferredTime === slot
          return (
            <button
              key={slot}
              type="button"
              className={`appointment-modal__time-slot${active ? ' appointment-modal__time-slot--active' : ''}`}
              disabled={disabled}
              aria-pressed={active}
              onClick={() => onTimeChange(active ? '' : slot)}
            >
              {formatTimeLabel(slot)}
            </button>
          )
        })}
      </div>

      <div
        className={`appointment-modal__picker appointment-modal__picker--time${timeError ? ' appointment-modal__picker--error' : ''}${preferredTime ? ' appointment-modal__picker--filled' : ''}`}
      >
        <button
          type="button"
          className="appointment-modal__picker-hit"
          disabled={disabled}
          onClick={() => openPicker(timeRef.current)}
          aria-label="Choose custom time"
        >
          <span className="appointment-modal__picker-icon" aria-hidden>
            <Clock size={22} />
          </span>
          <span className="appointment-modal__picker-body">
            <span className="appointment-modal__picker-label">Custom time</span>
            <span className="appointment-modal__picker-value">{formatTimeLabel(preferredTime)}</span>
          </span>
          <span className="appointment-modal__picker-action">Tap to pick</span>
        </button>
        <input
          ref={timeRef}
          type="time"
          name="preferredTime"
          className="appointment-modal__picker-input"
          value={preferredTime}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden
          onChange={(e) => onTimeChange(e.target.value)}
        />
        {preferredTime && (
          <button
            type="button"
            className="appointment-modal__picker-clear"
            disabled={disabled}
            onClick={() => onTimeChange('')}
            aria-label="Clear time"
          >
            Clear
          </button>
        )}
      </div>
      {timeError && <span className="appointment-modal__field-error">{timeError}</span>}
    </fieldset>
  )
}
