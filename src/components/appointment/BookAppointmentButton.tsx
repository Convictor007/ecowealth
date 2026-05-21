import { useAppointmentModal } from '@/context/AppointmentModalContext'
import { BOOKING_CTA } from '@/constants/clinic'

interface BookAppointmentButtonProps {
  className?: string
  variant?: 'primary' | 'outline'
  label?: string
}

export default function BookAppointmentButton({
  className = '',
  variant = 'primary',
  label = BOOKING_CTA.label,
}: BookAppointmentButtonProps) {
  const { openAppointmentModal } = useAppointmentModal()

  return (
    <button
      type="button"
      className={`btn btn--${variant} ${className}`.trim()}
      onClick={openAppointmentModal}
      aria-haspopup="dialog"
    >
      {label}
    </button>
  )
}
