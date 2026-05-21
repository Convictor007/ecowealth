/**
 * Booking API URL — Vercel uses /api/appointments; XAMPP uses PHP when served under /ecowealth_v2
 */
export function resolveAppointmentApiUrl(): string {
  const fromEnv = import.meta.env.VITE_APPOINTMENT_API_URL as string | undefined
  if (fromEnv) return fromEnv

  if (typeof window !== 'undefined') {
    const { hostname, port, pathname, origin } = window.location
    const phpPath = '/ecowealth_v2/api/appointments/book.php'

    if (hostname.includes('vercel.app')) {
      return `${origin}/api/appointments`
    }

    // Vite dev → XAMPP PHP (email only; Apache must be running)
    if (port === '5173' || port === '4173') {
      return `http://${hostname}/ecowealth_v2/api/appointments/book.php`
    }

    if (pathname.includes('/ecowealth_v2')) {
      return `${origin}${phpPath}`
    }

    return `${origin}/api/appointments`
  }

  return import.meta.env.DEV
    ? 'http://localhost/ecowealth_v2/api/appointments/book.php'
    : '/api/appointments'
}

export const APPOINTMENT_SERVICES_FALLBACK = [
  { id: 'free-checkup', label: 'Free check-up / consultation' },
  { id: 'colon-hydrotherapy', label: 'Colon hydrotherapy' },
  { id: 'wellness-massage', label: 'Therapeutic massage & wellness' },
  { id: 'iridology', label: 'Iridology' },
  { id: 'herbology', label: 'Herbology' },
  { id: 'herbal-coffee', label: 'Herbal coffee' },
  { id: 'supplements', label: 'Food supplements' },
  { id: 'general-consultation', label: 'General wellness consultation' },
  { id: 'products-inquiry', label: 'Products inquiry (in-clinic)' },
] as const
